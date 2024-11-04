import React, { useEffect, useCallback } from "react";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js/lib/common";

import "highlight.js/styles/tokyo-night-dark.css";
import toast from "react-hot-toast";
import "./MarkdownRenderer.css";
import { convertHtmlToMarkdown, debounce } from "../../modules/utils";

const DEBOUNCE_TIME = 180;

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const MarkdownRenderer = ({
  markdown,
  extraClass,
}: {
  markdown: string;
  extraClass?: string;
}) => {

  const highlightCodeBlocks = useCallback(
    debounce(() => {
      document.querySelectorAll("pre code").forEach((block) => {
        const htmlBlock = block as HTMLElement;
        if (!htmlBlock.dataset.highlighted) {
          hljs.highlightElement(htmlBlock);
          htmlBlock.dataset.highlighted = "true";
        }
      });
    }, DEBOUNCE_TIME),
    []
  );

  const addCopyButtons = useCallback(
    debounce(() => {
      document.querySelectorAll("pre").forEach((block) => {
        if (!block.querySelector(".copy-btn")) {
          const button = document.createElement("button");
          button.className = "copy-btn clickeable";
          button.textContent = "Copy";
          block.appendChild(button);

          button.addEventListener("click", () => {
            const codeElement = block.querySelector("code");
            const code = codeElement ? codeElement.textContent : "";

            if (code) {
              navigator.clipboard.writeText(code);
              toast.success("Code copied to clipboard!");
            } else {
              toast.error("No code available!");
            }
          });
        }
      });
    }, DEBOUNCE_TIME),
    []
  );

  useEffect(() => {
    highlightCodeBlocks();
    addCopyButtons();
  }, [markdown]);

  const getMarkdownText = () => {
    const rawMarkup = md.render(markdown);
    return { __html: rawMarkup };
  };

  return (
    <div
      className={`markdown-renderer ${extraClass}`}
      dangerouslySetInnerHTML={getMarkdownText()}
    />
  );
};

export default MarkdownRenderer;
