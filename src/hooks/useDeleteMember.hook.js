import { useQueryClient, useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import api from "@/lib/api.js";

const deleteMember = async ({memberId, projectId}) => {
  const token = Cookies.get("token");
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}projects/${projectId}/members`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ _id: memberId }),
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

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: deleteMember,
    mutationFn: async ({memberId, projectId}) => {
      const { data } = await api.delete(`projects/${projectId}/members`, { data: { _id: memberId } });
      return data;
    },
    onSuccess: (response, variables) => {
      console.log("Member deleted successfully:", response);
      queryClient.invalidateQueries({
        queryKey: ["fetchMembers", variables.projectId ],
        refetchType: "all",
        exact: false
      });
    },
    onError: (error) => {
      console.error("Error deleting member:", error);
    },
  });
}
