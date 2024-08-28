import { NatsConnection } from "nats";
import { Kvm, KV } from "@nats-io/kv";
import type { WorkspaceUser } from "./types";

export class WorkspaceKV {
  private kv: KV;

  private constructor(kv: KV) {
    this.kv = kv;
  }

  static async create(
    nc: NatsConnection,
    bucket: string,
  ): Promise<WorkspaceKV> {
    const kvm = new Kvm(nc);
    const kv = await kvm.create(bucket, { history: 5 });
    return new WorkspaceKV(kv);
  }

  async addUser(user: WorkspaceUser): Promise<void> {
    if (!user.id) {
      throw new Error("User ID is undefined");
    }
    const key = `users.${user.id}`;
    await this.kv.put(key, JSON.stringify(user));
  }

  async getUser(userId: string): Promise<WorkspaceUser | null> {
    const key = `users.${userId}`;
    try {
      const userData = await this.kv.get(key);
      if (userData) {
        return JSON.parse(userData.string()) as WorkspaceUser;
      }
    } catch (error) {
      console.error("Error retrieving user from KV store:", error);
    }
    return null;
  }
}
