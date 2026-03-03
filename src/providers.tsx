"use client";

import { useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { store, persistor } from "@/store";
import { PersistGate } from "redux-persist/integration/react";
import Spinner from "./components/common/spinner";

export function AppBootLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-white">
      <Spinner className="h-8 w-8 text-brand-neutral-800" />
    </div>
  );
}

export default function Providers({ children } : { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                retry: 1,
            },
            mutations: {
                retry: 0,
            },
        },
    }));
    
    return (
        <ReduxProvider store={store}>
            <PersistGate loading={<AppBootLoader />} persistor={persistor}>
              <QueryClientProvider client={queryClient}>
                  {children}
                  <Toaster richColors position="top-right" />
              </QueryClientProvider>
            </PersistGate>
        </ReduxProvider> 
    );
}