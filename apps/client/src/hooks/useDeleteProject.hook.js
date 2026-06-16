import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import api from "@/lib/api.js";

const deleteProject = async (project) => {
  const token = Cookies.get("token");
  const response = await fetch(`${import.meta.env.VITE_API_URL}projects`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: deleteProject,
    mutationFn: async (project) => {
      const { data } = await api.delete(`projects`, { data: project });
      return data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ["fetchProjects"],
        refetchType: "all",
      });
      console.log("Project deleted successfully:", response);
    },
    onError: (error) => {
      console.error("Error deleting project:", error);
    },
  });
}
