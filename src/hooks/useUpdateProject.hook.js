import { useQueryClient, useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import api from "@/lib/api.js";

const updateProject = async (data) => {
  const token = Cookies.get("token");
  const response = await fetch(`${import.meta.env.VITE_API_URL}projects`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: updateProject,
    mutationFn: async (projectData) => {
      const { data } = await api.patch(`projects`, projectData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fetchProjects"],
        refetchType: "all",
      });
    },
  });
}
