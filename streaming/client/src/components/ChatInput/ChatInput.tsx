import React, { useRef, useEffect, useCallback, useState } from "react";
import { SVGS } from "../../assets/svgs";
import { v4 as uuidv4 } from "uuid";
import { useStore } from "../../modules/store";
import "./ChatInput.css";
import toast from "react-hot-toast";
import { Thumbnail } from "../Thumbnail/Thumbnail";
import { SvgButton } from "../SvgButton/SvgButton";
import { TConversationData } from "../../types/chatTypes";
import { useTranslation } from "react-i18next";
import { debounce } from "../../modules/utils";
import { getDocuments, getSuggestion } from "../../modules/apiCalls";
import { SpeechHandler } from "../SpeechHandler/SpeechHandler";
import { FloatingDropdown } from "../Dropdown/Dropdown";
import { Modal } from "../Modal/Modal";

import { TAttachment, TDocument } from "../../types";
import { SliderInput } from "../SimpleForm/SliderInput";

interface ChatInputProps {
  handleSendMessage: () => void;
  handleKeyDown: (event) => void;
  conversation: TConversationData;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  handleSendMessage,
  handleKeyDown,
  conversation,
}) => {
  const { t } = useTranslation();
  const {
    input,
    setInput,
    attachments,
    addAttachment,
    chatState,
    toggleWebSearch,

    toggleWritingMode,
  } = useStore((state) => ({
    input: state.input,
    setInput: state.setInput,
    attachments: state.chatState.attachments,
    addAttachment: state.addAttachment,
    chatState: state.chatState,
    toggleWebSearch: state.toggleWebSearch,
    toggleWritingMode: state.toggleWrittingMode,
  }));

  // const [suggestion, setSuggestion] = useState("");

  // const debouncedGetSuggestion = useCallback(
  //   debounce(async (inputContent: string) => {
  //     if (inputContent.length > 0) {
  //       const result = await getSuggestion(inputContent);
  //       if (typeof result.suggestion === "string") {
  //         setSuggestion(result.suggestion);
  //       }
  //     }
  //   }, 1000),
  //   []
  // );

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (allowedImageTypes.includes(item.type)) {
        const blob = item.getAsFile();
        const reader = new FileReader();

        reader.onload = (event) => {
          const target = event.target;
          if (!target) return;
          const result = target.result;
          if (!result) return;
          const id = uuidv4();

          if (!blob) return;

          addAttachment({
            content: result as string,
            type: "image",
            name: id,
            file: blob,
            text: "",
          });
        };
        if (blob) reader.readAsDataURL(blob);
      }
    }
  };

  const handleAudioTranscript = (
    transcript: string,
    audioUrl: string,
    base64Audio: string
  ) => {
    setInput(input + " " + transcript);
    addAttachment({
      content: base64Audio,
      type: "audio",
      name: uuidv4(),
      file: null,
      text: "",
    });
  };

  return (
    <div className="chat-input">
      <section className="attachments">
        {attachments.map(({ content, type, name, id, mode }, index) => (
          <Thumbnail
            // file={file}
            id={id}
            name={name}
            type={type}
            src={content}
            key={index}
            index={index}
            showFloatingButtons={true}
            mode={mode}
          />
        ))}
      </section>
      <section>
        <textarea
          className={chatState.writtingMode ? "big-size" : ""}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={t("type-your-message")}
          name="chat-input"
        />
      </section>
      <section className="mt-small">
        <div className="flex-x gap-small">
          <SvgButton
            title={t("send-message")}
            onClick={handleSendMessage}
            svg={SVGS.send}
          />

          <SvgButton
            extraClass={chatState.writtingMode ? "active" : ""}
            onClick={toggleWritingMode}
            svg={SVGS.writePen}
            title={t("turn-on-off-writing-mode")}
          />
          <RagSearchOptions />
          <FileLoader />
          <SvgButton
            extraClass={chatState.webSearch ? "active" : ""}
            onClick={toggleWebSearch}
            svg={SVGS.webSearch}
            title={t("turn-on-off-web-search")}
          />

          <SpeechHandler onTranscript={handleAudioTranscript} />
          <ConversationConfig hide={() => {}} />
        </div>
      </section>
    </div>
  );
};

const allowedDocumentTypes = [
  "application/pdf",
  "text/plain",
  "text/html",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const allowedImageTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
];

export const FileLoader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const addAttachment = useStore((s) => s.addAttachment);

  const addDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (
        allowedImageTypes.includes(file.type) ||
        allowedDocumentTypes.includes(file.type)
      ) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const target = event.target;
          if (!target) return;
          const result = target.result;
          if (!result) return;

          addAttachment({
            content: result as string,
            file: file,
            type: file.type,
            name: file.name,
            text: "",
          });
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(t("file-type-not-allowed"));
      }
    }
  };

  const openDocuments = () => {
    if (!fileInputRef || !fileInputRef.current) return;
    fileInputRef.current.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={addDocument}
        style={{ display: "none" }}
        id="fileInput"
        accept=".png,.jpeg,.jpg,.gif,.webp,.pdf,.txt,.html,.doc,.docx"
      />
      <label htmlFor="fileInput">
        <SvgButton
          onClick={openDocuments}
          title={t("add-files")}
          svg={SVGS.addDocument}
        />
      </label>
    </>
  );
};

const RagSearchOptions = () => {
  const { toggleUseRag, chatState } = useStore((state) => ({
    toggleUseRag: state.toggleUseRag,
    chatState: state.chatState,
  }));

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const { t } = useTranslation();
  return (
    <FloatingDropdown
      bottom="100%"
      left="50%"
      transform="translateX(-50%)"
      opener={
        <SvgButton
          extraClass={chatState.useRag ? "active" : ""}
          onClick={toggleUseRag}
          svg={SVGS.document}
          title={t("turn-on-off-rag")}
        />
      }
    >
      <div className="width-300">
        <p>You can select specific documents from each of your collections</p>
        <SvgButton
          onClick={() => setIsConfigOpen(true)}
          size="big"
          // text={t("add-knowledge")}
          svg={SVGS.plus}
        />
        {isConfigOpen && <RagConfig hide={() => setIsConfigOpen(false)} />}
      </div>
    </FloatingDropdown>
  );
};

const RagConfig = ({ hide }: { hide: () => void }) => {
  const [documents, setDocuments] = useState([] as TDocument[]);

  const { addAttatchment, chatState, removeAttatchment } = useStore((s) => ({
    addAttatchment: s.addAttachment,
    chatState: s.chatState,
    removeAttatchment: s.deleteAttachment,
  }));

  const { t } = useTranslation();

  useEffect(() => {
    getDocs();
  }, []);

  const getDocs = async () => {
    const docs = await getDocuments();
    setDocuments(docs);
  };

  const toggleDocument = (d: TDocument) => {
    if (chatState.attachments.findIndex((a) => a.id == d.id) === -1) {
      const attachment: TAttachment = {
        content: d.text,
        name: d.name,
        type: "text/plain",
        id: d.id,
        mode: "all_possible_text",
        text: d.text,
      };
      addAttatchment(attachment, true);
    } else {
      removeAttatchment(chatState.attachments.findIndex((a) => a.id == d.id));
    }
  };

  return (
    <Modal hide={hide}>
      <h3 className="text-center padding-big">
        {t("select-documents-to-use")}
      </h3>
      <div className="d-flex gap-small wrap-wrap">
        {documents.map((d) => (
          <div
            key={d.id}
            onClick={() => toggleDocument(d)}
            className={`card pressable ${chatState.attachments.findIndex((a) => a.id == d.id) != -1 && "bg-active"}`}
          >
            <h4>{d.name}</h4>
            <p title={d.brief}>{d.brief.slice(0, 200)}...</p>
          </div>
        ))}
      </div>
    </Modal>
  );
};

const ConversationConfig = ({ hide }: { hide: () => void }) => {
  const { chatState, updateChatState } = useStore((s) => ({
    chatState: s.chatState,
    updateChatState: s.updateChatState,
  }));

  const { t } = useTranslation();

  const updateMaxMemoryMessages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      updateChatState({ maxMemoryMessages: parseInt(e.target.value) });
    }
  };

  return (
    <FloatingDropdown
      bottom="100%"
      right="0"
      opener={<SvgButton svg={SVGS.options} />}
    >
      <div className="flex-y gap-small">
        <h5>{t("max-memory-messages")}</h5>
        <input
          type="number"
          className="input padding-small"
          value={chatState.maxMemoryMessages}
          onChange={updateMaxMemoryMessages}
          min={0}
        />
        <hr />
        <h5>{t("auto-play")}</h5>
        <span>{t("auto-play-description")}</span>
        <SliderInput
          checked={chatState.autoPlay}
          onChange={(checked) => updateChatState({ autoPlay: checked })}
        />
        <hr />
        <h5>{t("auto-scroll")}</h5>
        <span>{t("auto-scroll-description")}</span>
        <SliderInput
          checked={chatState.autoScroll}
          onChange={(checked) => updateChatState({ autoScroll: checked })}
        />
      </div>
    </FloatingDropdown>
  );
};
