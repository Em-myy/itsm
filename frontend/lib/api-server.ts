import { createClient } from "@/utils/supabase/server";

const GO_API_URL = process.env.NEXT_PUBLIC_GO_API_URL;

export const fetchFromGo = async (
  endpoint: string,
  options: RequestInit = {},
) => {
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

  let response: Response;
  try {
    response = await fetch(`${GO_API_URL}${endpoint}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error(`[fetchFromGo Network Failure] on ${endpoint}:`, error);
    throw new Error(`Could not reach the server for ${endpoint}`);
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[Go Backend Error] ${response.status} on ${endpoint}:`,
      errorText,
    );
    throw new Error(
      `Request to ${endpoint} failed with status ${response.status}`,
    );
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const rawText = await response.text();
    console.error(`[Go Backend returned non-JSON] on ${endpoint}:`, rawText);
    throw new Error(`Unexpected response format from ${endpoint}`);
  }

  return await response.json();
};
