"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/use-toast";
import api from "./api";
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  AUTH_ENDPOINTS,
  getGoogleOAuthUrl,
} from "./auth";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Extend the axios request config type to include our custom _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface AuthContextType {
  user: AuthResponse["user"] | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  getAuthToken: () => string | null;
  checkAuthStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Add this helper function at the top level
const setAuthToken = (token: string | null) => {
  if (typeof window === "undefined") return;

  if (token) {
    // Set in localStorage
    localStorage.setItem("access_token", token);
    // Set in cookies with httpOnly and secure flags
    document.cookie = `access_token=${token}; path=/; max-age=2592000; SameSite=Lax`; // 30 days
    // Set axios header
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    // Clear from localStorage
    localStorage.removeItem("access_token");
    // Clear from cookies
    document.cookie =
      "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Clear axios header
    delete api.defaults.headers.common["Authorization"];
  }
};

// Helper function to safely access localStorage
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
};

// Helper function to safely set localStorage
const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
};

// Helper function to safely remove from localStorage
const removeLocalStorageItem = (key: string): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse["user"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [hasRefreshToken, setHasRefreshToken] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Update token state on mount
  useEffect(() => {
    setHasToken(!!getLocalStorageItem("access_token"));
    setHasRefreshToken(!!getLocalStorageItem("refresh_token"));
  }, []);

  // Add debug logging for user state changes
  useEffect(() => {
    console.log("Auth Context - User state updated:", {
      user,
      hasToken,
      hasRefreshToken,
    });
  }, [user, hasToken, hasRefreshToken]);

  // Update the checkAuth function to be more focused
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      console.log("Auth Context - Starting initial auth check");
      try {
        const token = getLocalStorageItem("access_token");
        const refreshToken = getLocalStorageItem("refresh_token");

        console.log("Auth Context - Initial check:", {
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
          hasUser: !!user,
          userId: user?.id,
        });

        if (!token) {
          console.log("Auth Context - No token found, clearing state");
          if (isMounted) {
            setUser(null);
            setAuthToken(null);
            setHasToken(false);
            setHasRefreshToken(false);
            setIsLoading(false);
          }
          return;
        }

        // Set the auth token
        setAuthToken(token);

        // If we already have valid user data, use it
        if (user && user.id) {
          console.log("Auth Context - Using existing user data:", user);
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        try {
          console.log("Auth Context - Fetching user data");
          const response = await api.get(AUTH_ENDPOINTS.ME);
          console.log("Auth Context - User data response:", response.data);

          if (response.data && response.data.id && isMounted) {
            console.log("Auth Context - Setting user data");
            setUser(response.data);
            setIsLoading(false);
          } else if (isMounted) {
            throw new Error("Invalid user data received");
          }
        } catch (error) {
          console.error("Auth Context - User data fetch failed:", error);

          if (axios.isAxiosError(error) && error.response?.status === 401) {
            console.log("Auth Context - Token expired, attempting refresh");

            if (!refreshToken) {
              throw new Error("No refresh token available");
            }

            try {
              // Try to refresh the token
              const refreshResponse = await api.post(AUTH_ENDPOINTS.REFRESH, {
                refresh: refreshToken,
              });

              const newToken = refreshResponse.data.access;
              if (!newToken) {
                throw new Error("No access token in refresh response");
              }

              console.log("Auth Context - Token refreshed successfully");
              localStorage.setItem("access_token", newToken);
              setAuthToken(newToken);

              // Retry the user data fetch with new token
              const retryResponse = await api.get(AUTH_ENDPOINTS.ME);
              if (retryResponse.data && retryResponse.data.id && isMounted) {
                console.log("Auth Context - User data fetched after refresh");
                setUser(retryResponse.data);
                setIsLoading(false);
              } else {
                throw new Error("Invalid user data after refresh");
              }
            } catch (refreshError) {
              console.error(
                "Auth Context - Token refresh failed:",
                refreshError
              );
              // Clear all auth data on refresh failure
              if (isMounted) {
                setUser(null);
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                setAuthToken(null);
                setIsLoading(false);
              }
              throw refreshError;
            }
          } else {
            // For any other error, clear the auth state
            if (isMounted) {
              setUser(null);
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              setAuthToken(null);
              setIsLoading(false);
            }
            throw error;
          }
        }

        // Update token states when setting new tokens
        if (refreshToken) {
          setLocalStorageItem("refresh_token", refreshToken);
          setHasRefreshToken(true);
        }
      } catch (error) {
        console.error("Auth Context - Auth check failed:", error);
        if (isMounted) {
          setUser(null);
          removeLocalStorageItem("access_token");
          removeLocalStorageItem("refresh_token");
          setAuthToken(null);
          setHasToken(false);
          setHasRefreshToken(false);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update the login function to be more robust
  const login = async (credentials: LoginCredentials) => {
    console.log("Login function called with credentials:", {
      ...credentials,
      password: "[REDACTED]",
    });
    try {
      setIsLoading(true);
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, credentials);
      console.log("Login successful, received data:", response.data);

      if (!response.data.access) {
        throw new Error("No access token in response");
      }

      // Store the tokens using our helper functions
      setAuthToken(response.data.access);
      if (response.data.refresh) {
        setLocalStorageItem("refresh_token", response.data.refresh);
        setHasRefreshToken(true);
      }
      setHasToken(true);

      // Fetch user data
      const userResponse = await api.get(AUTH_ENDPOINTS.ME);
      console.log("User data fetched:", userResponse.data);

      if (!userResponse.data || !userResponse.data.id) {
        throw new Error("Invalid user data received");
      }

      setUser(userResponse.data);
      router.push("/");
      toast({
        title: "Success",
        description: "Successfully logged in",
      });
    } catch (error: unknown) {
      console.error("Login failed:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }
      toast({
        title: "Error",
        description: "Failed to login. Please check your credentials.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update the logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await api.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setUser(null);
      removeLocalStorageItem("access_token");
      removeLocalStorageItem("refresh_token");
      setAuthToken(null);
      setHasToken(false);
      setHasRefreshToken(false);
      setIsLoading(false);
      router.push("/auth/login");
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      // Update to use the correct register endpoint
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, credentials);

      if (response.data.access) {
        // Store the tokens
        localStorage.setItem("access_token", response.data.access);
        if (response.data.refresh) {
          localStorage.setItem("refresh_token", response.data.refresh);
        }

        // Set the authorization header
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.access}`;

        // Fetch user data
        const userResponse = await api.get(AUTH_ENDPOINTS.ME);
        setUser(userResponse.data);

        router.push("/");
        toast({
          title: "Success",
          description: "Successfully registered",
        });
      } else {
        throw new Error("No access token in response");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update the isAuthenticated function
  const isAuthenticated = useCallback(() => {
    return !!user && hasToken;
  }, [user, hasToken]);

  // Update the checkAuthStatus function
  const checkAuthStatus = useCallback(async () => {
    console.log("Auth Context - Starting auth status check");
    const token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");
    const currentState = {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      userId: user?.id,
    };
    console.log("Auth Context - Current state:", currentState);

    if (!token) {
      console.log("Auth Context - No token found");
      return false;
    }

    try {
      // Set the auth header
      setAuthToken(token);

      // If we have valid user data, use it
      if (user && user.id) {
        console.log("Auth Context - Using existing user data");
        return true;
      }

      console.log("Auth Context - Fetching fresh user data");
      const response = await api.get(AUTH_ENDPOINTS.ME);
      console.log("Auth Context - User data response:", response.data);

      if (response.data && response.data.id) {
        console.log("Auth Context - Setting fresh user data");
        setUser(response.data);
        return true;
      }

      console.log("Auth Context - Invalid user data");
      return false;
    } catch (error) {
      console.error("Auth Context - Auth check failed:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("Auth Context - Token expired, attempting refresh");
        try {
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const refreshResponse = await api.post(AUTH_ENDPOINTS.REFRESH, {
            refresh: refreshToken,
          });
          const newToken = refreshResponse.data.access;
          if (newToken) {
            console.log("Auth Context - Token refreshed");
            localStorage.setItem("access_token", newToken);
            setAuthToken(newToken);
            const retryResponse = await api.get(AUTH_ENDPOINTS.ME);
            if (retryResponse.data && retryResponse.data.id) {
              console.log("Auth Context - User data fetched after refresh");
              setUser(retryResponse.data);
              return true;
            }
          }
        } catch (refreshError) {
          console.error("Auth Context - Token refresh failed:", refreshError);
          setUser(null);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setAuthToken(null);
        }
      }
      return false;
    }
  }, [user]);

  // Add a function to get the current auth token
  const getAuthToken = useCallback(() => {
    return getLocalStorageItem("access_token");
  }, []);

  // Update the context value to include the new function
  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
    isAuthenticated,
    getAuthToken,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
