import { PostlyClient } from "@blummify/postly-sdk";

const globalForPostly = globalThis as unknown as {
  postly: PostlyClient | undefined;
};

function makePostlyClient(): PostlyClient {
  return new PostlyClient({
    baseUrl: process.env.POSTLY_BASE_URL!,
    apiKey: process.env.POSTLY_API_KEY!,
  });
}

// Proxy defers instantiation until the first call — safe to import when env vars are absent at build time.
export const postly: PostlyClient = new Proxy({} as PostlyClient, {
  get(_, prop) {
    const client = (globalForPostly.postly ??= makePostlyClient());
    return Reflect.get(client, prop);
  },
});
