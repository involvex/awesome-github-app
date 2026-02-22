import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

import React, { createContext, useContext, useEffect, useState } from "react";
import { setToken, clearToken, getOctokit } from "../lib/api/github";
import { getItem, setItem, deleteItem } from "../lib/storage";
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

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: "https://github.com/settings/connections/applications",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const nativeClientId =
    Constants.expoConfig?.extra?.oauth?.githubClientId ?? "";
  const webClientId =
    Constants.expoConfig?.extra?.oauth?.webGithubClientId ?? "";
  const isWeb = Platform.OS === "web" && !!webClientId;
  const clientId = isWeb ? webClientId : nativeClientId;

  const redirectUri = AuthSession.makeRedirectUri(
    Platform.OS === "web"
      ? { path: "oauth/callback" }
      : { native: "awesomegithubapp://oauth/callback" },
  );

  const [, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes: ["read:user", "user:email", "repo", "notifications", "workflow"],
      redirectUri,
    },
    discovery,
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

  // Handle OAuth response
  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      exchangeCodeForToken(code);
    }
  }, [response]);

  const exchangeCodeForToken = async (code: string) => {
    setIsLoading(true);
    try {
      // On web, proxy through local API route to avoid CORS.
      // On native, call GitHub directly (no CORS restrictions in native fetch).
      // On web, proxy through Cloudflare Worker to avoid CORS and keep secrets secure.
      // On native, call GitHub directly (no CORS restrictions in native fetch).
      const tokenUrl = isWeb
        ? "https://awesomegithubapp-api.involvex.workers.dev/token"
        : "https://github.com/login/oauth/access_token";

      const tokenRes = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          // On web, the Cloudflare Worker handles client_secret
          ...(isWeb ? {} : {}),
          code,
          redirect_uri: redirectUri,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) throw new Error("No access token returned");

      await setToken(tokenData.access_token);
      await fetchAndStoreUser();
    } catch (e) {
      console.error("Token exchange failed:", e);
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
    await promptAsync();
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
