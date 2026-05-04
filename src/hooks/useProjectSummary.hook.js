import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api.js";

export function useProjectSummary() {
  return useMutation({
    mutationFn: async (projectId) => {
      const { data } = await api.get(`projects/${projectId}/summary`);
      return data;
    },
  });
}
