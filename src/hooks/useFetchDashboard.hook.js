import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api.js";

export function useFetchDashboard() {
  return useQuery({
    queryKey: ["projectsDashboard"],
    queryFn: async () => {
      const { data } = await api.get("projects/dashboard");
      return data;
    },
    staleTime: 3 * 60 * 1000,
  });
}
