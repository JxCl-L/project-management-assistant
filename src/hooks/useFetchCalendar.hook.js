import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api.js";

export function useFetchCalendar({ from, to }) {
  return useQuery({
    queryKey: ["projectsCalendar", from, to],
    queryFn: async () => {
      const { data } = await api.get("projects/calendar", { params: { from, to } });
      return data;
    },
    staleTime: 3 * 60 * 1000,
  });
}
