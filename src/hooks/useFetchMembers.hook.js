import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import api from "@/lib/api.js";

const fetchMembers = async (projectId) => {

  const token = Cookies.get("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const url = new URL(
    `${import.meta.env.VITE_API_URL}projects/${projectId}/members`
  );

  console.log("🔄 Fetching members for Project:", projectId);

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

export function useFetchMembers(projectId) {
  const result = useQuery({
    queryKey: ["fetchMembers", projectId],
    // queryFn: () => fetchMembers(projectId),
    queryFn: async () => {
      const { data } = await api.get(`projects/${projectId}/members`);
      return data;
    },
    // staleTime: 30000, // 30 seconds
    // retry: 2,
    enabled: !!projectId,
  });
  console.log("📊 useFetchMembers Query result:", result?.data);
  return result;
}
