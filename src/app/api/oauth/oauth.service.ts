import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { getOAuthConfig } from "./social";
import { OAuthProvider } from "./oauth.interfaces";
import { LoginResponse } from "../auth/auth.interfaces";
import { getStorageWithExpiry } from "src/app/shared/shared.utils";

interface RestAuthConnectData {
  access_token?: string;
  code?: string;
  tags?: string | null;
}

@Injectable({
  providedIn: "root",
})
export class GlitchTipOAuthService {
  private readonly baseUrl = "rest-auth";

  constructor(private http: HttpClient) {}

  getAnalyticsTags() {
    return getStorageWithExpiry("register");
  }

  githubLogin(code: string, isConnect: boolean) {
    const data: RestAuthConnectData = {
      code,
      tags: this.getAnalyticsTags(),
    };
    let url = this.baseUrl + "/github/";
    if (isConnect) {
      url += "connect/";
    }
    return this.http.post<LoginResponse>(url, data);
  }

  microsoftLogin(accessToken: string, isConnect: boolean) {
    const data: RestAuthConnectData = {
      access_token: accessToken,
      tags: this.getAnalyticsTags(),
    };
    let url = this.baseUrl + "/microsoft/";
    if (isConnect) {
      url += "connect/";
    }
    return this.http.post<LoginResponse>(url, data);
  }

  googleLogin(accessToken: string, isConnect: boolean) {
    const data: RestAuthConnectData = {
      access_token: accessToken,
      tags: this.getAnalyticsTags(),
    };
    let url = this.baseUrl + "/google/";
    if (isConnect) {
      url += "connect/";
    }
    return this.http.post<LoginResponse | null>(url, data);
  }

  gitlabLogin(accessToken: string, isConnect: boolean) {
    const data: RestAuthConnectData = {
      access_token: accessToken,
      tags: this.getAnalyticsTags(),
    };
    let url = this.baseUrl + "/gitlab/";
    if (isConnect) {
      url += "connect/";
    }
    return this.http.post<LoginResponse>(url, data);
  }

  initGitlabLogin(clientId: string) {
    this.initOAuthLogin(clientId, "gitlab");
  }

  initGithubLogin(clientId: string) {
    this.initOAuthLogin(clientId, "github");
  }

  initGoogleLogin(clientId: string) {
    this.initOAuthLogin(clientId, "google");
  }

  initMicrosoftLogin(clientId: string) {
    this.initOAuthLogin(clientId, "microsoft");
  }

  /** Redirect user to OAuth provider auth URL */
  private initOAuthLogin(clientId: string, provider: OAuthProvider) {
    const config = getOAuthConfig(provider);
    if (config) {
      const params = new URLSearchParams({
        response_type: "token",
        client_id: clientId,
        redirect_uri: window.location.origin + "/auth/" + provider,
        scope: config.scope,
      });
      const url = `${config.loginURL}?${params.toString()}`;
      window.location.href = url;
    }
  }
}
