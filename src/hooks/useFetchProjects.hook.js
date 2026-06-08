import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { useMemo } from "react";
// import { useNavigate } from "react-router";
import api from "@/lib/api.js";

const fetchProjects = async ({ queryKey }) => {

  const [_key, params] = queryKey;
  const { sortBy = "createdAt", order = "asc", search = "" } = params;

  const token = Cookies.get("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const url = new URL(`${import.meta.env.VITE_API_URL}projects`);
  url.searchParams.append("order", order);
  url.searchParams.append("sortBy", sortBy);
  if (search) {
    url.searchParams.append("search", search);
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }

  return await response.json();
};

export function useFetchProjects(params = {}) {
  // const navigate = useNavigate();

  // stablilize params with useMemo
  const stableParams = useMemo(
    () => ({
      sortBy: params.sortBy || "createdAt",
      order: params.order || "asc",
      search: params.search || "",
    }),
    [params.sortBy, params.order, params.search]
  );

  const result = useQuery({
    queryKey: ["fetchProjects", stableParams], // use stableParams not params
      // why use stableParams here ?????
      // stableParams only creates NEW object when values actually change
    // queryFn: fetchProjects,
    queryFn: async () => {
      const { data } = await api.get(`projects`, {
        params: {
          sortBy: stableParams.sortBy,
          order: stableParams.order,
          ...(stableParams.search && { search: stableParams.search }),
        },
      });
      return data;
    },

    retry: (failureCount, error) => {
      // Don't retry on 4xx authentication errors
      if (error.status >= 400 && error.status < 500) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    // Handle errors
    // onError: (error) => {
    //   // Redirect to login on authentication errors
    //   console.error("❌ Error fetching projects:", error);
    //   if (error.status === 401 || error.status === 403) {
    //     navigate("/");
    //   }
    // },
  });

  return result;
}
