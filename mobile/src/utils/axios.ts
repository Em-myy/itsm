import { supabase } from "@/lib/supabase";
import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const GO_PORT = 8080;

const getBaseUrl = () => {
  if (!__DEV__) {
    return process.env.EXPO_PUBLIC_PROD_API_URL;
  }

  const hostUri = Constants.expoConfig?.hostUri;

  if (hostUri) {
    const ipAddress = hostUri.split(":")[0];
    return `http://${ipAddress}:${GO_PORT}/api`;
  }

  return Platform.OS === "android"
    ? `http://10.0.2.2:${GO_PORT}/api`
    : `http://localhost:${GO_PORT}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

api.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
export default api;
