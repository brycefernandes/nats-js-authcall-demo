import { connect } from "nats";
import { AuthService } from "./authService";
import { WorkspaceKV } from "./workspaceKV";
import * as nkeys from "nkeys.js";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    // Connect to NATS server
    const nc = await connect({
      servers: "nats://localhost:4222",
      user: "auth",
      pass: "auth",
    });

    // Load the NKey seed from environment variables
    const NKeySeed = process.env.NKEY_SEED;
    if (!NKeySeed) {
      throw new Error("NKEY_SEED not found in environment variables");
    }

    // Create key pair from the seed
    const kp = nkeys.fromSeed(new TextEncoder().encode(NKeySeed));

    // Initialize WorkspaceKV
    const workspace = await WorkspaceKV.create(nc, "chat_workspace");

    // Initialize AuthService
    const auth = new AuthService(nc, kp, workspace);

    // Subscribe to authentication requests
    const sub = nc.subscribe("$SYS.REQ.USER.AUTH", {
      callback: async (err, msg) => {
        if (err) {
          console.error("Subscription error:", err);
          return;
        }
        await auth.handle(msg);
      },
    });

    console.log("Auth service is running and listening for requests...");

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      await sub.drain();
      await nc.drain();
      process.exit();
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main().catch(console.error);
