import axios from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data;

    if (data && typeof data === "object") {
      if (Array.isArray(data)) {
        const first: unknown = data[0];

        if (first && typeof first === "object") {
          const message = (first as { mensagem?: unknown }).mensagem;
          if (typeof message === "string") return message;
        }
      } else {
        const message = (data as { message?: unknown }).message;
        if (typeof message === "string") return message;
      }
    }

    return fallback;
  }

  return error instanceof Error ? error.message : fallback;
}