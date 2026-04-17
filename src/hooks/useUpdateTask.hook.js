import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api.js";


export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: updateTask,
    mutationFn: async ({projectId, taskData}) => {
      const { data } = await api.patch(`projects/${projectId}/tasks`, taskData);
      return data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["fetchTasks"],
        refetchType: "all",
      });
      console.log("Task updated successfully:", response);
    },
    onError: (error) => {
      console.error("Error updating task:", error);
    },
  });
}
