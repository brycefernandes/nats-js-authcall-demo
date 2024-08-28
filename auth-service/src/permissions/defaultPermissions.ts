import { UserPermissions } from "../types";

const defaultPermissions: UserPermissions["nats"] = {
  pub: {
    allow: [
      "$JS.API.INFO",
      "chat.*.${userId}",
      "$JS.API.STREAM.INFO.chat_messages",
      "$JS.API.CONSUMER.CREATE.chat_messages.>",
      "$JS.API.CONSUMER.MSG.NEXT.chat_messages.>",
      "$JS.API.DIRECT.GET.KV_chat_workspace.>",
      "$JS.API.STREAM.INFO.KV_chat_workspace",
      "$JS.API.CONSUMER.CREATE.KV_chat_workspace.*.>",
    ],
    deny: [],
  },
  subs: -1,
  data: -1,
  payload: -1,
  type: "user",
  version: 2,
};

export default defaultPermissions;
