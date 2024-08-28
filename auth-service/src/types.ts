import { UserPermissionsLimits, IssuerAccount, GenericFields } from "nats-jwt";

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  photoURL: string;
}

export interface UserPermissions
  extends UserPermissionsLimits,
    IssuerAccount,
    GenericFields {
  nats: {
    pub: {
      allow: string[];
      deny: string[];
    };
    subs: number;
    data: number;
    payload: number;
    type: string;
    version: number;
  };
}
