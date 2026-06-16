import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api.js";

export function useUpdateTaskContent() {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: updateTaskContent,
    mutationFn: async ({projectId, taskId, taskContentData}) => {
      const { data } = await api.patch(`projects/${projectId}/tasks/${taskId}/contents`, taskContentData);
      return data;
    },
    onSuccess: (response, variables) => {
      const { projectId, taskId } = variables;
      queryClient.invalidateQueries({
        queryKey: ["fetchTaskContent", projectId, taskId],
        refetchType: "all",
      });
      console.log("Task content updated successfully:", response);
    },
    onError: (error) => {
      console.error("Error updating task content:", error);
    },
  });
}
