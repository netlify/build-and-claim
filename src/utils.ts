export async function post(
  url: string,
  options?: { headers?: HeadersInit; body?: unknown },
) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (!response.ok) {
      console.error("Response is not ok", response);
      throw new Error("Response is not ok");
    }
    if (!options.headers["Content-Type"]) {
      return response;
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

export function getEnv(env: Record<string, string> = {}) {
  return Object.entries(env).map(([key, value]) => ({
    key,
    scopes: ["builds", "functions", "runtime", "post_processing"],
    values: [
      {
        context: "all",
        value: value as string,
      },
    ],
  }));
}
