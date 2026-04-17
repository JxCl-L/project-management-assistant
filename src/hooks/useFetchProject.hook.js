import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import api from "@/lib/api.js";

const fetchProject = async (projectId) => {
  const token = Cookies.get("token");
  
  if (!projectId) {
    console.log("⚠️ No projectId provided, skipping fetch");
    return null;
  }

  const url = new URL(
    `${import.meta.env.VITE_API_URL}projects/${projectId}`
  );

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};

export function useFetchProject(projectId) {
  const result = useQuery({
    queryKey: ["fetchProject", projectId],
    // queryFn: () => fetchProject(projectId),
    queryFn: async () => {
      const { data } = await api.get(`projects/${projectId}`);
      return data;
    },
    // staleTime: 30000, // 30 seconds
    // retry: 2,
    enabled: !!projectId,
  });
  return result;
}
