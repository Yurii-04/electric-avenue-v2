import {isAxiosError} from "axios";
import { toast } from 'sonner';

export const handleApiError = (
  e: unknown,
  fallbackMessage = "Unexpected error"
) => {
  if (isAxiosError(e) && e.response) {
    const error = e.response.data;

    if (Array.isArray(error.message)) {
      toast.error(error.message[0]);
    } else {
      toast.error(error.message || fallbackMessage);
    }
  } else {
    toast.error("Network error or server unavailable");
  }
}
