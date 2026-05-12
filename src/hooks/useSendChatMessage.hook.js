import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api.js";

export function useSendChatMessage() {
  return useMutation({
    mutationFn: async ({ projectId, messages, strategy }) => {
      const params = strategy ? `?strategy=${strategy}` : "";
      const { data } = await api.post(`projects/${projectId}/chat${params}`, { messages });
      return data.data; // unwrap envelope: { status, message: 'OK', data: { message, _debug } }
    },
  });
}
