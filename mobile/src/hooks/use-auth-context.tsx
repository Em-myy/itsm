import { UserType } from "@/utils/helpers";
import { createContext, useContext } from "react";

export type AuthData = {
  claims?: Record<string, any> | null;
  profile?: UserType | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  avatar: any;
  initials: string | undefined;
  handleSignout: () => void;
};

export const AuthContext = createContext<AuthData>({
  claims: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
  avatar: null,
  initials: "",
  handleSignout: () => {},
});

export const useAuthContext = () => useContext(AuthContext);
