import { TAttachment } from "../types";
import { Message, Model, TAgent } from "../types/agents";
import {
  TUserData,
  TConversationData,
  TReactionTemplate,
} from "../types/chatTypes";
import { AudioPlayerOptions } from "./utils";

type SetOpenedProps = {
  action: "add" | "remove";
  name: "documents" | "tags" | "completions" | "settings";
};

export type Store = {
  socket: any;
  messages: Message[];
  input: string;
  models: Model[];
  agents: TAgent[];
  user?: TUserData;
  modelsAndAgents: TAgent[];
  chatState: {
    isSidebarOpened: boolean;
    attachments: TAttachment[];
    webSearch: boolean;
    writtingMode: boolean;
    useRag: boolean;
    maxMemoryMessages: number;
    autoPlay: boolean;
    autoScroll: boolean;
  };
  conversation: TConversationData | undefined;
  openedModals: string[];
  reactionTemplates: TReactionTemplate[];

  startup: () => void;
  removeAgent: (slug: string) => void;
  updateSingleAgent: (agent: TAgent) => void;
  setOpenedModals: (opts: SetOpenedProps) => void;
  setMessages: (messages: Message[]) => void;
  setConversation: (conversationId: string | null) => void;
  addAttachment: (newAttachment: TAttachment, saved?: boolean) => void;
  updateAttachment: (
    index: number,
    newAttachment: Partial<TAttachment>
  ) => void;
  setInput: (input: string) => void;
  setModels: (models: Model[]) => void;
  fetchAgents: () => void;
  toggleSidebar: () => void;
  cleanAttachments: () => void;
  deleteAttachment: (index: number) => void;
  toggleWebSearch: () => void;
  toggleWrittingMode: () => void;
  toggleUseRag: () => void;
  toggleAgentSelected: (slug: string) => void;
  setUser: (user: TUserData) => void;
  addAgent: () => void;
  updateChatState: (state: Partial<Store["chatState"]>) => void;
  test: () => void;
};
