import { useQueryClient, useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import api from "@/lib/api.js";

const updateMember = async ({ memberData, projectId }) => {
  console.log("In useUpdateMember hook, projectId:", projectId);
  const token = Cookies.get("token");
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}projects/${projectId}/members`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(memberData),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    console.log("Error response:", errorData.error.message);
    // Extract the error message from the error object
    throw new Error(errorData.error.message || "Network response was not ok");
  }
  return await response.json();
};

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: updateMember,
    mutationFn: async ({ memberData, projectId }) => {
      const { data } = await api.patch(`projects/${projectId}/members`, memberData);
      return data;
    },
    onSuccess: (response, variables) => {
      console.log("Member updated successfully:", response);
      queryClient.invalidateQueries({
        queryKey: ["fetchMembers", variables.projectId],
        refetchType: "all",
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["fetchProjects"],
        refetchType: "all",
      });
    },
    onError: (error) => {
      console.error("Error updating member:", error);
    },
  });
}
