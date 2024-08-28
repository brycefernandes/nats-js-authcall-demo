import { NatsConnection, Msg, StringCodec } from "nats";
import * as nkeys from "nkeys.js";
import { decode, encode, Algorithms } from "nats-jwt";
import { WorkspaceKV } from "./workspaceKV";
import type { ClaimsData, AuthorizationResponse } from "nats-jwt";
import { verifyMockToken } from "./mockVerification";
import { getPermissions } from "./permissions";
import { UserPermissions, WorkspaceUser } from "./types";

const sc = StringCodec();

interface AuthorizationRequestClaims {
  nats: {
    user_nkey: string;
    server_id: {
      id: string;
    };
    connect_opts: {
      auth_token: string;
    };
  };
}

export class AuthService {
  private issuerKeyPair: nkeys.KeyPair;
  private nc: NatsConnection;
  private workspace: WorkspaceKV;

  constructor(
    nc: NatsConnection,
    issuer: nkeys.KeyPair,
    workspace: WorkspaceKV,
  ) {
    this.nc = nc;
    this.issuerKeyPair = issuer;
    this.workspace = workspace;
  }

  async handle(msg: Msg) {
    try {
      // Decode the JWT from the message data
      const jwtStr = sc.decode(msg.data);
      const decodedJwt = decode(jwtStr);
      const req = decodedJwt as unknown as AuthorizationRequestClaims;

      // Process the claims and generate a response
      const response = await this.processClaims(req);
      const token = await this.validateAndSign(response, req);
      this.respond(msg, token);
    } catch (error) {
      // Respond with an error message if processing fails
      this.respond(msg, null, (error as Error).message);
    }
  }

  private async processClaims(
    req: AuthorizationRequestClaims,
  ): Promise<AuthorizationResponse> {
    // Verify the mock token
    const workspaceUser = await verifyMockToken(
      req.nats.connect_opts.auth_token,
    );
    if (!workspaceUser) {
      throw new Error("Invalid mock token");
    }

    // Add the user to the workspace
    await this.workspace.addUser(workspaceUser);

    // Get permissions for the user
    const permissions = getPermissions(workspaceUser.id);

    // Create user claims
    const userClaims: ClaimsData<UserPermissions> = {
      jti: nkeys.createAccount().getPublicKey(),
      iat: Math.floor(Date.now() / 1000),
      iss: this.issuerKeyPair.getPublicKey(),
      sub: req.nats.user_nkey,
      aud: "CHAT",
      name: workspaceUser.id,
      nats: permissions,
    };

    // Encode the user claims into a JWT
    const userJWT = await encode(Algorithms.v2, userClaims, this.issuerKeyPair);

    // Create and return the authorization response
    return {
      jwt: userJWT,
      version: 2,
      type: "authorization_response",
    };
  }

  private respond(msg: Msg, responseJWT: string | null, error?: string) {
    let response: string;
    if (error) {
      response = JSON.stringify({ error });
    } else if (responseJWT) {
      response = responseJWT;
    } else {
      response = JSON.stringify({ error: "Unknown error occurred" });
    }
    msg.respond(sc.encode(response));
  }

  private async validateAndSign(
    response: AuthorizationResponse,
    req: AuthorizationRequestClaims,
  ): Promise<string> {
    const authResponseClaims: ClaimsData<AuthorizationResponse> = {
      jti: nkeys.createAccount().getPublicKey(),
      iat: Math.floor(Date.now() / 1000),
      iss: this.issuerKeyPair.getPublicKey(),
      sub: req.nats.user_nkey,
      aud: req.nats.server_id.id,
      name: "auth_response",
      nats: response,
    };

    return encode(Algorithms.v2, authResponseClaims, this.issuerKeyPair);
  }
}
