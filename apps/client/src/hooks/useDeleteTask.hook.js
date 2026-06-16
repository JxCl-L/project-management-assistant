import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api.js";

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, taskId }) => {
      const { data } = await api.delete(`projects/${projectId}/tasks`, {
        data: { _id: taskId },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchTasks"], refetchType: "all" });
    },
  });
}
