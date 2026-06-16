import "./index.css";

// Apply saved theme before first render to avoid flash
const savedTheme = localStorage.getItem("theme") ?? "dark";
const root = document.documentElement;
root.classList.remove("dark", "solarized-light");
if (savedTheme === "dark") root.classList.add("dark");
else if (savedTheme === "solarized-light") root.classList.add("solarized-light");

import { RouterProvider } from "react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { router } from "./routes.jsx";
import Cookies from "js-cookie";

import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-query-devtools").then(m => ({ default: m.ReactQueryDevtools })))
  : null;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      cacheTime: 1000 * 60 * 10, // 10 minutes - cache lifetime
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: true, // Refetch on mount if data is stale (respects staleTime)
      retry: 1, // Only retry once on failure
      retryDelay: 1000, // Wait 1 second before retry

      // onError: (error) => {
      //   // handle authentication errors globally
      //   if (error.response?.status === 401) {
      //     console.log("❌ Authentication error, redirecting to login.");
      //     Cookies.remove("token");
      //     localStorage.removeItem("token");
      //     window.location.href = "/";
      //     return;
      //   }
      //   // handle server/network errors globally
      //   if (
      //     error.response?.status >= 500 ||
      //     error.code === "ERR_NETWORK" ||
      //     error.code === "ERR_CONNECTION_REFUSED" ||
      //     !error.response
      //   ) {
      //     alert("A server or network error occurred. Redirecting to login.");
      //     console.error(
      //       "Network or server error: ",
      //       error,
      //       ", redirecting to login."
      //     );
      //     Cookies.remove("token");
      //     localStorage.removeItem("token");
      //     window.location.href = "/";
      //     return;
      //   }
      // },  // replaced by interceptor in api.js, hooks, components
    },
    mutations: {
      // onError: (error) => {
      //   // handle authentication errors globally
      //   if (error.response?.status === 401) {
      //     Cookies.remove("token");
      //     localStorage.removeItem("token");
      //     window.location.href = "/";
      //     return;
      //   }
      //   // handle server/network errors globally
      //   if (
      //     error.response?.status >= 500 ||
      //     error.code === "ERR_NETWORK" ||
      //     error.code === "ERR_CONNECTION_REFUSED" ||
      //     !error.response
      //   ) {
      //     alert("A server or network error occurred. Redirecting to login.");
      //     console.error(
      //       "Network or server error: ",
      //       error,
      //       ", redirecting to login."
      //     );
      //     Cookies.remove("token");
      //     localStorage.removeItem("token");
      //     window.location.href = "/";
      //     return;
      //   }
      // }, // replaced by interceptor in api.js, hooks, components
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
      {import.meta.env.DEV && ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  </StrictMode>
);
