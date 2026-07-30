import { ApiError } from "@/lib/api/client";

export const BUYER_PHONE_REQUIRED = "BUYER_PHONE_REQUIRED";

export function isBuyerPhoneRequired(err: unknown): err is ApiError {
  return err instanceof ApiError && err.status === 422 && err.code === BUYER_PHONE_REQUIRED;
}
