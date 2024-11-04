import React, { useEffect, useRef, useState } from "react";
import { SVGS } from "../../assets/svgs";
import MarkdownRenderer from "../MarkdownRenderer/MarkdownRenderer";
import { TAttachment, TVersion } from "../../types";
import { Thumbnail } from "../Thumbnail/Thumbnail";
import "./Message.css";
import { SvgButton } from "../SvgButton/SvgButton";
import toast from "react-hot-toast";
import { getChunk, updateMessage } from "../../modules/apiCalls";
import { Modal } from "../Modal/Modal";
import { useTranslation } from "react-i18next";
import { Pill } from "../Pill/Pill";
import { useStore } from "../../modules/store";
import { Reactions } from "../Reactions/Reactions";
type TReaction = {
  id: number;
  template: number;
};

interface Link {
  url: string;
  text: string;
}

interface MessageProps {
  id?: number;
  type: string;
  text: string;
  index: number;
  versions?: TVersion[];
  attachments: TAttachment[];
  onGenerateSpeech: (text: string) => void;
  onGenerateImage: (text: string) => void;
  onMessageEdit: (index: number, text: string, versions?: TVersion[]) => void;
  reactions?: TReaction[];
}

export const Message: React.FC<MessageProps> = ({
  type,
  index,
  id,
  text,
  versions,
  reactions,
  attachments,
  onGenerateSpeech,
  onGenerateImage,
  onMessageEdit,
}) => {
  const [sources, setSources] = useState([] as Link[]);
  const [isEditing, setIsEditing] = useState(false);
  const [innerText, setInnerText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [innerReactions, setInnerReactions] = useState(
    reactions || ([] as TReaction[])
  );

  const { t } = useTranslation();

  const { agents, reactionTemplates } = useStore((s) => ({
    agents: s.agents,
    reactionTemplates: s.reactionTemplates,
  }));
  const copyToClipboard = () => {
    const textToCopy = versions?.[currentVersion]?.text || innerText;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        toast.success(t("message-copied"));
      },
      (err) => {
        console.error("Error al copiar al portapapeles: ", err);
      }
    );
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";

      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
    return () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    };
  }, [innerText, isEditing]);

  useEffect(() => {
    const anchors = document.querySelectorAll(`.message-${index} a`);

    const extractedLinks: Link[] = [];

    anchors.forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (!href) return;
      const isSource = href.includes("#");
      if (isSource) {
        anchor.removeAttribute("target");
      } else {
        anchor.setAttribute("target", "_blank");
      }
      const currentHrefs = extractedLinks.map((l) => l.url);
      if (!currentHrefs.includes(href)) {
        extractedLinks.push({ url: href, text: anchor.textContent || "" });
      }
    });
    setSources(extractedLinks);
    setInnerText(text);
  }, [text]);

  const toggleEditMode = () => {
    if (isEditing) {
      textareaRef.current?.blur();
      // Get the textarea value
      const textareaValue = textareaRef.current?.value;

      if (id && type === "assistant" && versions && textareaValue) {
        const newVersions = versions.map((v, index) => {
          if (currentVersion === index) {
            return {
              ...v,
              text: textareaValue,
            };
          }
          return v;
        });

        updateMessage(id, {
          text: textareaValue,
          type: type,
          versions: newVersions,
        });
        onMessageEdit(index, textareaValue, newVersions);
      }
      if (id && type === "user" && textareaValue) {
        updateMessage(id, {
          text: textareaValue,
          type: type,
        });
        onMessageEdit(index, textareaValue);
      }
    }
    setIsEditing(!isEditing);
  };

  const handleReaction = (action: "add" | "remove", templateId: number) => {
    if (action === "add") {
      setInnerReactions([
        ...innerReactions,
        { id: templateId, template: templateId },
      ]);
    } else {
      setInnerReactions(
        innerReactions.filter((r) => r.template !== templateId)
      );
    }
  };
  return (
    <div className={`message ${type} message-${index}`}>
      {isEditing ? (
        <textarea
          autoComplete="on"
          ref={textareaRef}
          className="message-textarea"
          defaultValue={versions?.[currentVersion]?.text || innerText}
        />
      ) : (
        <MarkdownRenderer
          markdown={versions?.[currentVersion]?.text || innerText}
          extraClass={`message-text ${type === "user" ? "fancy-gradient" : ""}`}
        />
      )}

      <section className="message__attachments">
        {attachments &&
          attachments.map(({ content, type, name }, index) => (
            <Thumbnail
              index={index}
              type={type}
              src={content}
              name={name}
              key={index}
            />
          ))}
        {sources &&
          sources.map((s, index) => (
            <Source key={index} text={s.text} href={s.url}></Source>
          ))}
      </section>
      <div className="message-buttons d-flex gap-small align-center">
        <SvgButton
          title={t("generate-speech")}
          onClick={() => onGenerateSpeech(text)}
          svg={SVGS.waves}
        />
        <SvgButton
          title={t("generate-image")}
          onClick={() => onGenerateImage(text)}
          svg={SVGS.picture}
        />
        <SvgButton
          title={t("copy-to-clipboard")}
          onClick={() => copyToClipboard()}
          svg={SVGS.copyTwo}
        />
        {id && (
          <>
            <SvgButton
              title={isEditing ? t("finish") : t("edit")}
              onClick={toggleEditMode}
              svg={isEditing ? SVGS.finish : SVGS.edit}
            />
            <Reactions
              direction={type === "user" ? "right" : "left"}
              onReaction={handleReaction}
              messageId={id.toString()}
              currentReactions={innerReactions?.map((r) => r.template) || []}
            />
            {innerReactions && innerReactions.length > 0 && (
              <>
                {innerReactions.map(
                  (r) =>
                    reactionTemplates.find((rt) => rt.id === r.template)?.emoji
                )}
              </>
            )}
          </>
        )}

        {versions && (
          <div className="d-flex gap-small align-center">
            {versions.map((v, index) => (
              <Pill
                key={index + "pill"}
                extraClass={` ${
                  currentVersion === index ? "bg-active" : "bg-hovered"
                }`}
                onClick={() => setCurrentVersion(index)}
              >
                {index + 1}
              </Pill>
            ))}
          </div>
        )}
        {versions?.[currentVersion]?.agent_slug ? (
          <Pill>
            {
              agents.find((a) => a.slug === versions[currentVersion].agent_slug)
                ?.name
            }
          </Pill>
        ) : null}
      </div>
    </div>
  );
};

function getSomeNumberFromChunkString(chunkString) {
  // It must cut the string at - and return both parts
  const [modelName, modelId] = chunkString.split("-");
  return { modelName, modelId };
}

type TChunk = {
  id: number;
  document: number;
  content: string;
  brief?: string;
  tags?: string;
};
const Source = ({ href, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [chunkInfo, setChunkInfo] = useState({} as TChunk);

  const sourceId = href.replace(/^#/, "");

  const handleGetModel = async () => {
    const { modelId, modelName } = getSomeNumberFromChunkString(href);
    const chunk = await getChunk(modelId);
    setChunkInfo(chunk);
    setIsVisible(true);
  };

  return (
    <div className="source-component">
      <input id={sourceId} type="text" />
      <h5>{text}</h5>
      <p>{href}</p>
      <SvgButton svg={SVGS.eyes} onClick={handleGetModel} />
      {isVisible && (
        <Modal
          minHeight={"40vh"}
          visible={isVisible}
          hide={() => setIsVisible(false)}
        >
          <div className="chunk-info">
            <h3>{chunkInfo.brief}</h3>
            <textarea
              value={JSON.stringify(chunkInfo.content)}
              readOnly
              name="chunk_text"
            ></textarea>
          </div>
        </Modal>
      )}
    </div>
  );
};
