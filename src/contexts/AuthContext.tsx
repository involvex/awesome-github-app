import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const webTokenExchangeUrl =
    Constants.expoConfig?.extra?.oauth?.webTokenExchangeUrl ??
    "https://awesomegithubapp-api.involvex.workers.dev/token";
  const isWeb = Platform.OS === "web";
  const clientId = isWeb ? webClientId : nativeClientId;
  const codeVerifierRef = useRef<string | undefined>(undefined);

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
    discovery,
  );

  useEffect(() => {
    if (request?.codeVerifier) {
      codeVerifierRef.current = request.codeVerifier;
    }
  }, [request?.codeVerifier]);

  useEffect(() => {
    if (!isWeb && webClientId && nativeClientId === webClientId) {
      console.warn(
        "Native and web OAuth client IDs are identical. Ensure native uses the native OAuth app client ID.",
      );
    }
  }, [isWeb, nativeClientId, webClientId]);

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
      const codeVerifier = request?.codeVerifier ?? codeVerifierRef.current;
      if (!codeVerifier) {
        console.error(
          "Missing PKCE code_verifier on OAuth callback; cannot redeem code.",
          { platform: Platform.OS, redirectUri },
        );
        return;
      }
      exchangeCodeForToken(code, codeVerifier);
    }
  }, [redirectUri, request?.codeVerifier, response]);

  const exchangeCodeForToken = async (code: string, codeVerifier?: string) => {
    setIsLoading(true);
    let tokenUrl = "https://github.com/login/oauth/access_token";
    try {
      tokenUrl = isWeb ? webTokenExchangeUrl : tokenUrl;

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
          details || `No access token returned (status ${tokenRes.status})`,
        );
      }

      await setToken(tokenData.access_token);
      await fetchAndStoreUser();
    } catch (e) {
      console.error(
        "Token exchange failed:",
        e,
        "platform:",
        Platform.OS,
        "clientId:",
        clientId,
        "tokenUrl:",
        tokenUrl,
        "hasCodeVerifier:",
        !!codeVerifier,
        "redirectUri:",
        redirectUri,
      );
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
    if (!clientId) {
      console.error(
        `Missing OAuth client ID for ${isWeb ? "web" : "native"} platform`,
      );
      return;
    }
    console.info("Starting OAuth sign-in", {
      platform: Platform.OS,
      clientId,
      redirectUri,
    });
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
