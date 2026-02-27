"use client";

import { useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { store } from "@/store";

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
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster />
            </QueryClientProvider>
        </ReduxProvider>
    );
}