import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api.js";
import Cookies from "js-cookie";

const fetchTask = async (projectId, taskId) => {
  const token = Cookies.get("token");
  
  if (!projectId || !taskId) {
    console.log("⚠️ No projectId or taskId provided, skipping fetch");
    return null;
  }

  const url = new URL(
    `${import.meta.env.VITE_API_URL}projects/${projectId}/tasks/${taskId}`
  );
  console.log("🔄 Fetching task:", taskId, "for Project:", projectId);

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

export function useFetchTask(projectId, taskId) {
  const result = useQuery({
    queryKey: ["fetchTask", projectId, taskId],
    // queryFn: () => fetchTask(projectId, taskId),
    queryFn: async () => {
      const { data } = await api.get(`projects/${projectId}/tasks/${taskId}`);
      return data;
    },
    // staleTime: 30000, // 30 seconds
    // retry: 2,
    enabled: !!projectId && !!taskId,
  });
  console.log("📊 useFetchTask Query result:", result?.data);
  return result;
}
