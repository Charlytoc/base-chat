import os
import json
from datetime import datetime
from .utils.openai_functions import stream_completion, generate_speech_api

from .utils.apiCalls import save_message, get_results, regenerate_conversation
from .utils.brave_search import search_brave
import hashlib
from .utils.apiCalls import get_system_prompt
from .logger import get_custom_logger

logger = get_custom_logger("event_triggers")


def extract_rag_results(rag_results, context):
    documents_context = ""
    complete_context = context
    counter = 0
    added_sources = []
    sources = []
    if rag_results is not None:
        metadatas = rag_results["results"]["metadatas"]
        for meta in metadatas:
            for ref in meta:
                if len(ref) > 0:
                    if ref in added_sources:
                        continue

                    sources.append(ref)
                    added_sources.append(ref)

                    documents_context += f"vector_href='#{ref.get('model_name', 'chunk')}-{ref.get('model_id', 132132)}'\nVECTOR CONTENT:\n--- {ref.get('content', '')}---"
                    counter += 1

        if len(documents_context) > 0:
            complete_context += f"\n\nThe following is information about a embeddings vector storage querying the user message: ---start_vector_context\n\n{documents_context}\n\n---end_vector_context---\nIf you use information from the vector storage, please cite the resourcess in anchor tags using the provided href, for example: <a href='#chunk-CHUNK_ID' target='__blank'>SOME_RELATED_CONECTOR</a> where  SOME_RELATED_CONECTOR is a three-four words text related to the chunk content that the user will be able to review. You can add the sources in any place of your response. Add as many as needed. You must cite the source using the href, the SOME_RELATED_CONECTOR is generated by you."

    return complete_context, sources


async def on_message_handler(socket_id, data, **kwargs):
    now = datetime.now()

    current_date_time = now.strftime("%Y-%m-%d %H:%M:%S")

    from server.socket import sio

    context = data["context"]
    message = data["message"]
    web_search_activated = data.get("web_search_activated", False)
    use_rag = data.get("use_rag", False)
    regenerate = data.get("regenerate", None)

    models_to_complete = data.get(
        "models_to_complete",
        [
            {
                # TODO: change this to the default agent: The default agent should exist always in the db
                "slug": "public-assistant",
                "llm": {"provider": "openai", "slug": "gpt-4o-mini"},
                "name": "Public Assistant",
            }
        ],
    )

    token = data["token"]

    conversation = data["conversation"]

    message["conversation"] = conversation.get("id", None)

    if not regenerate:
        user_message_res = save_message(
            message=message,
            token=token,
        )

    else:
        regenerate_conversation(
            conversation_id=conversation["id"],
            user_message_id=regenerate["user_message_id"],
            token=token,
        )

    versions = []

    for m in models_to_complete:
        agent_slug = m["slug"]
        version = {
            "agent_slug": agent_slug,
            "type": "assistant",
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        }
        complete_context = f"The current date and time is {current_date_time}\n\n"
        if use_rag:
            await sio.emit(
                "notification",
                {"message": "Searching relevant information in the documents"},
                to=socket_id,
            )
            rag_results = get_results(
                query_text=message["text"],
                agent_slug=agent_slug,
                token=token,
                conversation_id=conversation["id"],
            )
            complete_context, sources = extract_rag_results(
                rag_results, complete_context
            )
            version["sources"] = sources
            await sio.emit(
                "sources",
                {"status": "rag_finished", "sources": sources},
                to=socket_id,
            )

        if web_search_activated:

            await sio.emit(
                "notification",
                {"message": "Exploring the web to add more context to your message"},
                to=socket_id,
            )
            web_results = search_brave(message["text"], json.dumps(context))
            version["web_search_results"] = web_results
            complete_context += f"\n\<web_search_results>\n{json.dumps(web_results)}\n </web_search_results>\n"

        system_prompt = get_system_prompt(
            context=complete_context, agent_slug=agent_slug, token=token
        )

        data = {"agent_slug": agent_slug}
        ai_response = ""

        async for chunk in stream_completion(
            system_prompt,
            message["text"],
            model=m["llm"],
            attachments=message["attachments"],
            config=m,
            prev_messages=context,
            agent_slug=m["slug"],
        ):
            if isinstance(chunk, str):
                data["chunk"] = chunk
                ai_response += chunk
                await sio.emit("response", data, to=socket_id)

            else:
                version["usage"] = {
                    "completion_tokens": chunk.completion_tokens,
                    "prompt_tokens": chunk.prompt_tokens,
                    "total_tokens": chunk.total_tokens,
                }

        version["text"] = ai_response
        versions.append(version)

    ai_message_res = save_message(
        message={
            "type": "assistant",
            "text": versions[0]["text"],
            "attachments": message["attachments"],
            "conversation": conversation.get("id", None),
            "versions": versions,
        },
        token=token,
    )

    await sio.emit(
        "responseFinished",
        {
            "status": "ok",
            "versions": versions,
            "user_message_id": user_message_res["id"],
            "ai_message_id": ai_message_res["id"],
        },
        to=socket_id,
    )


def on_connect_handler(socket_id, **kwargs):
    pass


async def on_start_handler(socket_id, data, **kwargs):

    print(data)


AUDIO_DIR = "audios"


async def on_speech_request_handler(socket_id, data, **kwargs):

    logger.debug("Generating speech with socket", data)

    from server.socket import sio

    text = data["text"]
    logger.debug(f"TEXT to SPEECH {text}")

    # Hash the text to obtain a unique value
    hashed_text = hashlib.md5(text.encode()).hexdigest()

    output_path = os.path.join(AUDIO_DIR, f"{hashed_text}.mp3")

    # Check if the audio file already exists
    if os.path.exists(output_path):
        logger.debug("Audio file already exists, sending existing file.")
        with open(output_path, "rb") as audio_file:
            audio_content = audio_file.read()
            await sio.emit("audio-file", audio_content, to=socket_id)
    else:
        for chunk in generate_speech_api(text=text, output_path=output_path):
            logger.debug("audio emitted!")
            await sio.emit("audio-chunk", chunk, to=socket_id)

        with open(output_path, "rb") as audio_file:
            audio_content = audio_file.read()
            await sio.emit("audio-file", audio_content, to=socket_id)
