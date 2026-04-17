import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import api from "@/lib/api.js";

const fetchTasks = async ({ queryKey }) => {
  const [_key, projectId, order = "asc", limit = 5, page = 1, status = "todo,inProgress"] = queryKey;
  console.log  ("🔑 fetchTasks - status:", typeof(status));
  const token = Cookies.get("token");

  if (!projectId) {
    console.log("⚠️ No projectId provided, skipping fetch");
    return null;
  }

  const url = new URL(
    `${import.meta.env.VITE_API_URL}projects/${projectId}/tasks`
  );
  url.searchParams.append("order", order);
  url.searchParams.append("limit", limit);
  url.searchParams.append("page", page);

  const statusParam = Array.isArray(status) ? status.join(",") : status;
  url.searchParams.append("status", statusParam);

  console.log("🔄 Fetching tasks for Project:", projectId);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};

export function useFetchTasks(params = {}) {
  // const navigate = useNavigate();
  
  const stableParams = useMemo(
    () => ({
      projectId: params.projectId,
      order: params.order || "asc",
      limit: params.limit || 5,
      page: params.page || 1,
      status: params.status || "todo,inProgress",
    }),
    [params.projectId, params.order, params.limit, params.page, params.status]
  );
  // const { projectId, order="asc", limit=5, page=1, status="todo,inProgress" } = params;

  const result = useQuery({
    queryKey: ["fetchTasks", stableParams.projectId, stableParams.order, stableParams.limit, stableParams.page, stableParams.status],
    // queryFn: fetchTasks,
    queryFn: async () => {
      if (!stableParams.projectId) return null;
      
      const statusParam = Array.isArray(stableParams.status) ? stableParams.status.join(",") : stableParams.status;

      const { data } = await api.get(`projects/${stableParams.projectId}/tasks`, {
        params: {
          order: stableParams.order,
          limit: stableParams.limit,
          page: stableParams.page,
          status: statusParam,
        },
      });
      return data;  
    },

    // Only fetch if projectId exists
    enabled: !!stableParams.projectId,

    // Auto-refresh configuration
    staleTime: 2 * 60 * 1000, // Tasks are fresh for 2 minutes (shorter than projects since tasks change more frequently)
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when internet reconnects
    refetchInterval: 3 * 60 * 1000, // Background refetch every 3 minutes (more frequent than projects)
    refetchIntervalInBackground: false, // Only refetch when tab is active
   
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.response?.status >= 400 || error.response?.status < 500) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },

    // onError: (error) => {
    //   // Redirect to login on authentication errors
    //   console.error("❌ Error fetching tasks:", error);
    //   if (error.status === 401 || error.status === 403) {
    //     navigate("/");
    //   }
    // },
  });
  console.log("📊 useFetchTasks Query result:", result?.data);
  return result;
}
