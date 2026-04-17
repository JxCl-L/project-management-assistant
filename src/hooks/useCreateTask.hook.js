import { useQueryClient, useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useParams } from "react-router";
import api from "@/lib/api.js";

const createTask = async (task, projectId) => {
  const token = Cookies.get("token");
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}projects/${projectId}/tasks`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(task),
    }
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};

export function useCreateTask() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: (task) => createTask(task, projectId),
    mutationFn: async (task) => {
      const { data } = await api.post(`projects/${projectId}/tasks`, task);
      return data;
    },
    onSuccess: (response) => {
      console.log("Task created successfully:", response);
      queryClient.invalidateQueries({
        queryKey: ["fetchTasks"],
        refetchType: "all",
        exact: false
      });
    },
    onError: (error) => {
      console.error("Error creating task:", error.response?.data || error.message );
      // 401 handled by api.js interceptor
    },
  });
}
