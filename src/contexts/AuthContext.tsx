import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

import React, { createContext, useContext, useEffect, useState } from "react";
import { clearToken, getOctokit, setToken } from "../lib/api/github";
import { deleteItem, getItem, setItem } from "../lib/storage";
import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";
import Constants from "expo-constants";

export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

interface AuthContextType {
  user: GitHubUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "github_user_profile";
const GITHUB_TOKEN_KEY = "github_access_token";

const GITHUB_DISCOVERY = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: "https://github.com/settings/connections/applications",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isWeb = Platform.OS === "web";

  const nativeClientId =
    Constants.expoConfig?.extra?.oauth?.githubClientId ?? "";
  const webClientId =
    Constants.expoConfig?.extra?.oauth?.webGithubClientId ?? "";
  const tokenExchangeUrl =
    Constants.expoConfig?.extra?.oauth?.webTokenExchangeUrl ??
    "https://awesomegithubapp-api.involvex.workers.dev/token";

  // Web uses a separate OAuth app; native (dev client + production) uses the default app
  const clientId = isWeb ? webClientId : nativeClientId;
  const redirectUri = isWeb
    ? AuthSession.makeRedirectUri({ path: "oauth/callback" })
    : "awesomegithubapp://oauth/callback";

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes: ["read:user", "user:email", "repo", "notifications", "workflow"],
      redirectUri,
      usePKCE: true,
    },
    GITHUB_DISCOVERY,
  );

  // Load persisted user on mount
  useEffect(() => {
    (async () => {
      try {
        const userJson = await getItem(USER_STORAGE_KEY);
        const token = await getItem(GITHUB_TOKEN_KEY);
        if (userJson && token) {
          setUser(JSON.parse(userJson));
        }
      } catch (e) {
        console.error("Failed to load user:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Handle OAuth response from the browser redirect
  useEffect(() => {
    if (response?.type !== "success") {
      if (response) {
        console.warn("OAuth response was not successful:", response.type);
        setIsLoading(false);
      }
      return;
    }
    const { code } = response.params;
    if (!code) {
      console.error("OAuth callback missing authorization code.");
      setIsLoading(false);
      return;
    }
    // code_verifier is available from the in-memory request object
    void exchangeCodeForToken(code, request?.codeVerifier);
  }, [response]);

  // Always exchange through the Cloudflare Worker — it holds the client_secret.
  // GitHub OAuth apps require client_secret; direct exchange from native would fail.
  const exchangeCodeForToken = async (
    code: string,
    codeVerifier: string | undefined,
  ) => {
    setIsLoading(true);
    try {
      if (!codeVerifier) {
        throw new Error(
          "Missing PKCE code_verifier; cannot redeem authorization code.",
        );
      }

      const tokenRes = await fetch(tokenExchangeUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          code,
          code_verifier: codeVerifier,
          redirect_uri: redirectUri,
        }),
      });

      const tokenData: {
        access_token?: string;
        error?: string;
        error_description?: string;
      } = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.access_token) {
        const details = [tokenData.error, tokenData.error_description]
          .filter(Boolean)
          .join(": ");
        throw new Error(
          details || `Token exchange failed (status ${tokenRes.status})`,
        );
      }

      await setToken(tokenData.access_token);
      await fetchAndStoreUser();
    } catch (e) {
      // Avoid logging sensitive values (client IDs, redirect URIs or token data).
      // Log only the error message and non-sensitive flags to aid debugging.
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("Token exchange failed:", errorMessage, {
        platform: Platform.OS,
        hasCodeVerifier: !!codeVerifier,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndStoreUser = async () => {
    const octokit = await getOctokit();
    const { data } = await octokit.users.getAuthenticated();
    const profile: GitHubUser = {
      id: data.id,
      login: data.login,
      name: data.name ?? null,
      email: data.email ?? null,
      avatar_url: data.avatar_url,
      bio: data.bio ?? null,
      company: data.company ?? null,
      location: data.location ?? null,
      blog: data.blog ?? null,
      public_repos: data.public_repos,
      followers: data.followers,
      following: data.following,
      html_url: data.html_url,
    };
    setUser(profile);
    await setItem(USER_STORAGE_KEY, JSON.stringify(profile));
  };

  const signIn = async () => {
    if (!request) {
      console.error("OAuth request is not ready yet.");
      return;
    }
    if (!clientId) {
      console.error(
        `Missing OAuth client ID for ${isWeb ? "web" : "native"} platform.`,
      );
      return;
    }
    // Do not log OAuth client IDs or redirect URIs in clear text.
    // Log only non-sensitive flags to help triage issues without exposing secrets.
    console.info("Starting OAuth sign-in", {
      platform: Platform.OS,
      isWeb,
      hasClientId: !!clientId,
    });
    setIsLoading(true);
    const result = await promptAsync();
    if (result.type !== "success") {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await clearToken();
      await deleteItem(USER_STORAGE_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
