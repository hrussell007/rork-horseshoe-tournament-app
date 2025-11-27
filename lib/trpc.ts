import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (baseUrl) {
    console.log('🔗 tRPC Base URL (from env):', baseUrl);
    return baseUrl;
  }

  if (typeof window !== 'undefined') {
    const url = window.location.origin;
    console.log('🔗 tRPC Base URL (web):', url);
    return url;
  }

  console.error('❌ EXPO_PUBLIC_RORK_API_BASE_URL is not set!');
  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: (url, options) => {
        console.log('📡 tRPC Request:', url);
        return fetch(url, options).then(
          (res) => {
            console.log('✅ tRPC Response:', res.status, res.statusText);
            return res;
          },
          (err) => {
            console.error('❌ tRPC Fetch Error:', err);
            throw err;
          }
        );
      },
    }),
  ],
});
