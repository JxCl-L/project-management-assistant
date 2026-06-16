import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api.js";

export function useGenerateTask() {
  return useMutation({
    mutationFn: async ({ projectId, prompt }) => {
      const { data } = await api.post(`projects/${projectId}/tasks/generate`, { prompt });
      return data;
    },
  });
}
