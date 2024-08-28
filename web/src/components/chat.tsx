import { Show, createMemo, onCleanup } from "solid-js";
import Sidebar from "./sidebar";
import ChannelView from "./channel-view";
import {
  StringCodec,
  connect,
  millis,
  tokenAuthenticator,
  type Consumer,
  type JsMsg,
  type NatsConnection,
} from "nats.ws";
import { createStore } from "solid-js/store";
import type { Message, Channel, UserID, User } from "../types";
import Login from "./login";

interface ChatStore {
  conn?: NatsConnection;
  consumer?: Consumer;
  user?: User;
  channel: Channel;
  messages: Record<Channel, Message[]>;
  users: Record<UserID, User>;
}

const sc = StringCodec();

const channels = ["general", "random", "dev"];

export default function Chat() {
  const [store, setStore] = createStore<ChatStore>({
    channel: "general",
    messages: {},
    users: {},
  });

  const workspace = createMemo(async () => {
    const conn = store.conn;
    if (!conn) {
      console.log("No connection available for workspace");
      return null;
    }

    const js = conn.jetstream();
    return await js.views.kv("chat_workspace");
  });

  const onLogin = async (email: string, token: string) => {
    console.log("Login attempt with email:", email);
    const authenticator = tokenAuthenticator(token);

    try {
      const conn = await connect({
        servers: ["ws://localhost:8222"],
        authenticator: authenticator,
      });
      setStore("conn", conn);
      console.log("Connected successfully!");
      console.log("Token:", token);

      const js = conn.jetstream();
      const consumer = await js.consumers.get("chat_messages");
      setStore("consumer", consumer);
      console.log("Consumer set successfully");

      // Parse the token to get user info
      const userInfo = JSON.parse(atob(token));
      setStore("user", userInfo);
      console.log("User set in store:", store.user);

      await watchWorkspace();

      const sub = await consumer.consume();
      console.log("Subscribed to consumer");
      for await (const m of sub) {
        onMessageReceived(m);
      }
    } catch (error) {
      console.error("Error during login process:", error);
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      alert(
        "An error occurred during login. Please check the console for details.",
      );
    }
  };

  const onMessageReceived = (m: JsMsg) => {
    console.log("Message received:", m);
    const [_, channel, userID] = m.subject.split(".");

    const msg: Message = {
      userID: userID.toLowerCase(),
      text: m.string(),
      timestamp: new Date(millis(m.info.timestampNanos)),
    };
    setStore("messages", channel, (prev) => (prev ? [...prev, msg] : [msg]));
  };

  const watchWorkspace = async () => {
    return new Promise(async (res) => {
      const conn = store.conn;
      if (!conn) {
        console.log("No connection available for watchWorkspace");
        return;
      }

      const ws = await workspace();
      if (ws) {
        const watcher = await ws.watch({
          initializedFn: () => {
            console.log("Workspace watcher initialized");
            res(null);
          },
        });

        for await (const entry of watcher) {
          console.log("Workspace entry updated:", entry);
          const [resource, ...rest] = entry.key.split(".");

          switch (resource) {
            case "users":
              // Parse and add user to the users lookup table
              const id = rest[0];
              setStore("users", id, entry.json());
              console.log("Updated user in store:", id, store.users[id]);
              break;
          }
        }
      } else {
        console.log("Workspace is null in watchWorkspace");
      }
    });
  };

  onCleanup(async () => {
    console.log("Cleaning up...");
    await store.consumer?.delete();
    await store.conn?.close();
  });

  const sendMessage = (channel: string, message: string) => {
    if (store.user) {
      console.log("Sending message:", channel, message);
      store.conn?.publish(
        `chat.${channel}.${store.user?.id.toLowerCase()}`,
        sc.encode(message),
      );
    } else {
      console.log("Cannot send message: User not set");
    }
  };

  const channelMessages = () => {
    return (store.messages[store.channel] || []).map((m) => {
      return {
        ...m,
        user: store.users[m.userID] ?? {
          id: "unknown",
          name: "Unknown",
          email: "Unknown",
        },
      };
    });
  };

  return (
    <Show when={store.user} fallback={<Login onSubmit={onLogin} />}>
      <div class="inset-0 w-full h-lvh absolute flex flex-row">
        <Sidebar
          channels={channels}
          selected={store.channel}
          onSelect={(c) => setStore("channel", c)}
        />
        <ChannelView
          channel={store.channel}
          onSend={sendMessage}
          messages={channelMessages()}
        />
      </div>
    </Show>
  );
}
