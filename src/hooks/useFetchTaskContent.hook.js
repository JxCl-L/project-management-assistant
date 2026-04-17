import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api.js";

export function useFetchTaskContent(projectId, taskId) {
  const result = useQuery({
    queryKey: ["fetchTaskContent", projectId, taskId],
    // queryFn: () => fetchTaskContent(projectId, taskId),
    queryFn: async () => {
      const { data } = await api.get(`projects/${projectId}/tasks/${taskId}/contents`);
      return data;
    },
    // staleTime: 30000, // 30 seconds
    // retry: 2,
    enabled: !!projectId && !!taskId,
  });
  console.log("📊 useFetchTaskContent Query result:", result?.data);
  return result;
}
