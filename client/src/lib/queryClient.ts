import { QueryClient, QueryFunction } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export async function apiRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  body?: any
): Promise<T> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log(`Making ${method} request to: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Check if the response is empty
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const jsonResponse = await response.json();
      console.log(`API response received (JSON):`, jsonResponse);
      return jsonResponse as T;
    } else {
      const textResponse = await response.text();
      console.log(`API response received (text): ${textResponse}`);
      try {
        // Try to parse as JSON anyway
        return JSON.parse(textResponse) as T;
      } catch (e) {
        console.error("Could not parse response as JSON:", e);
        throw new Error("Invalid response format");
      }
    }
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

async function throwIfResNotOk(res: Response) {
  let error: string | undefined = undefined

  if (!res.ok) {
    try {
      error = await res.text()
    } catch (e) {}

    throw Error(`${res.status} ${res.statusText} ${error ?? ""}`)
  }
}

export async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  await throwIfResNotOk(res)
  return await res.json()
}

export async function postJson<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  await throwIfResNotOk(res)
  return await res.json()
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };