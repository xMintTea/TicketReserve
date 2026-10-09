// app/frontend/src/trpc/client.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import type { AppRouter } from '../../../backend/src/trpc/router';
import SuperJSON from 'superjson';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();


export function TRPCReactProvider({ children, queryClient }: { children: React.ReactNode, queryClient: QueryClient }) {
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',
          transformer: SuperJSON,
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}