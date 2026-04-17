import "./index.css";

import { RouterProvider } from "react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { router } from "./routes.jsx";
import Cookies from "js-cookie";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ProjectsContextProvider } from "./context/projects.context.jsx";
import { TasksContextProvider } from "./context/tasks.context.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      cacheTime: 1000 * 60 * 10, // 10 minutes - cache lifetime
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: true, // Always refetch on component mount
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
      <ProjectsContextProvider>
        <TasksContextProvider>
          <RouterProvider router={router} />
        </TasksContextProvider>
      </ProjectsContextProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
