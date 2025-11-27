import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (envUrl) {
    console.log('🔗 tRPC Base URL (from env):', envUrl);
    return envUrl;
  }

  if (typeof window !== 'undefined') {
    const url = window.location.origin;
    console.log('🔗 tRPC Base URL (web):', url);
    return url;
  }

  const fallbackUrl = 'https://2b7ahlotwdh2bh5k8ktkw.rork.app';
  console.log('🔗 tRPC Base URL (fallback):', fallbackUrl);
  return fallbackUrl;
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
