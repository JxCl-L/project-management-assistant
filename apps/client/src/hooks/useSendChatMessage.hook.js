import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL;

// Parses a chunk of an SSE stream and yields one parsed event per `data:`
// line. Keeps a `bufferRef` between chunks because a multi-byte token can
// split across two reads — the leftover suffix is carried into the next
// call so a half-arrived event isn't lost or double-parsed.
function consumeSSEChunk(chunk, bufferRef, onEvent) {
  bufferRef.current += chunk;
  // SSE events are delimited by a blank line (\n\n). Anything after the
  // last \n\n is a partial event — keep it in the buffer for the next chunk.
  const segments = bufferRef.current.split("\n\n");
  bufferRef.current = segments.pop() ?? "";
  for (const segment of segments) {
    const line = segment.trim();
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      onEvent(JSON.parse(payload));
    } catch {
      // Ignore malformed payloads rather than crashing the whole stream —
      // the next event boundary is the natural recovery point.
    }
  }
}

// Streaming chat hook. Backed by react-query's useMutation so callers get
// isPending/isError state, but the underlying call uses fetch + a manual
// SSE reader rather than axios, because axios doesn't expose a streaming
// response body in the browser. Pass `onStage` and `onToken` callbacks via
// mutation variables to receive incremental updates; the mutation resolves
// with the full assembled message text once the stream ends.
export function useSendChatMessage() {
  return useMutation({
    mutationFn: async ({
      projectId,
      messages,
      strategy,
      onStage,
      onToken,
    }) => {
      const params = new URLSearchParams({ stream: "true", debug: "true" });
      if (strategy) params.set("strategy", strategy);
      const token = Cookies.get("token");

      const response = await fetch(
        `${API_URL}projects/${projectId}/chat?${params.toString()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ messages }),
        }
      );

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `Request failed with status ${response.status}`);
      }
      if (!response.body) {
        throw new Error("Streaming response not supported by this browser.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const bufferRef = { current: "" };
      let assembled = "";
      let debug = null;
      let errorMessage = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        consumeSSEChunk(decoder.decode(value, { stream: true }), bufferRef, (event) => {
          switch (event.type) {
            case "stage":
              onStage?.(event.stage);
              break;
            case "token":
              assembled += event.text;
              onToken?.(event.text, assembled);
              break;
            case "debug":
              debug = event.debug;
              break;
            case "error":
              errorMessage = event.message;
              break;
            // "done" handled implicitly when reader closes the stream.
          }
        });
      }

      if (errorMessage) throw new Error(errorMessage);
      return { message: assembled, _debug: debug };
    },
  });
}
