import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api.js";

export function useRewriteTaskContent() {
  return useMutation({
    mutationFn: async ({ projectId, taskId }) => {
      const { data } = await api.post(
        `projects/${projectId}/tasks/${taskId}/contents/rewrite`
      );
      return data;
    },
  });
}
