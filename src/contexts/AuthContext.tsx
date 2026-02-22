import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthSession from "expo-auth-session";

interface User {
  id: string;
  email: string;
  name: string;
  provider: "github" | "discord";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (provider: "github" | "discord") => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "@app_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (user: User | null) => {
    try {
      if (user) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const createSampleOAuthCode = async (provider: "github" | "discord") => {
    const redirectUri = AuthSession.makeRedirectUri({
      path: "oauth/callback",
    });
    await new Promise(resolve => setTimeout(resolve, 350));
    const scope = provider === "github" ? "read:user" : "identify";
    return `${provider}:${scope}:${redirectUri}:${Date.now()}`;
  };

  const signIn = async (provider: "github" | "discord") => {
    setIsLoading(true);
    try {
      const oauthCode = await createSampleOAuthCode(provider);
      const providerName = provider === "github" ? "GitHub" : "Discord";
      const mockUser: User = {
        id: oauthCode,
        email: `user@${provider}.com`,
        name: `${providerName} User`,
        provider,
      };
      setUser(mockUser);
      await saveUser(mockUser);
    } catch (error) {
      console.error(`Sign in with ${provider} failed:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      await saveUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
