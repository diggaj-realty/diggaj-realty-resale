/** Phone numbers are stored server-side as 10 bare digits. */
export const formatPhone = (digits: string | null | undefined) =>
  !digits || digits.length !== 10 ? (digits ?? "—") : `${digits.slice(0, 5)} ${digits.slice(5)}`;

export const telHref = (digits: string | null | undefined) =>
  digits && digits.length === 10 ? `tel:+91${digits}` : undefined;
