import { createClient } from "@/utils/supabase/server";

const GO_API_URL = process.env.NEXT_PUBLIC_GO_API_URL;

export const fetchFromGo = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${GO_API_URL}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Go Backend Error] ${response.status} on ${endpoint}:`,
        errorText,
      );
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const rawText = await response.text();
      console.error(`[Go Backend returned non-JSON] on ${endpoint}:`, rawText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[fetchFromGo Network Failure] on ${endpoint}:`, error);
    return null;
  }
};
