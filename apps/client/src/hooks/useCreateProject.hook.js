import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
// import { useNavigate } from "react-router";
import api from "@/lib/api.js";

const createProject = async (projectData) => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const url = new URL(`${import.meta.env.VITE_API_URL}projects`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });

  if (response.status === 401 || response.status === 403) {
    // Handle authentication errors
    console.log("Authentication error: redirecting to login");
    Cookies.remove("token");
    const error = new Error("Authentication error");
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.status}`);
  }

  return await response.json();
};

export function useCreateProject() {
  // const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    // mutationFn: createProject,
    mutationFn: async (projectData) => {
      const { data } = await api.post(`projects`, projectData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["fetchProjects"],
        refetchType: "all",
        exact: false
      });
      console.log("Project created successfully:", data);
    },
    onError: (error) => {
      console.log("❌ Error creating project:", error.response?.data || error.message );
      // 401 handled by api.js interceptor
    },
  });
}
