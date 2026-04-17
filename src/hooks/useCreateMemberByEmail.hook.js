import { useQueryClient, useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useParams } from "react-router";
import api from "@/lib/api.js";

const createMemberByEmail = async ({memberData, projectId}) => {
  const token = Cookies.get("token");
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}projects/${projectId}/members/email`,
    {
      method: "POST",
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

export function useCreateMemberByEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    // mutationFn: createMemberByEmail,
    mutationFn: async ({memberData, projectId}) => {
      const { data } = await api.post(`projects/${projectId}/members/email`, memberData);
      return data;
    },
    onSuccess: (response, variables) => {
      console.log("Member created successfully:", response);
      queryClient.invalidateQueries({
        queryKey: ["fetchMembers",  variables.projectId ],
        refetchType: "all",
        exact: false
      });
    },
    onError: (error) => {
      console.error("Error creating member:", error.response?.data || error.message );
      // 401 handled by api.js interceptor
    },
  });
}
