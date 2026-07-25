import { authedGet, authedSend } from "@/lib/api/authed";
import type { AppNotification, NotificationsResponse } from "@/types/notifications";

export const getNotifications = (token: string, pageSize = 20) =>
  authedGet<NotificationsResponse>(`/notifications?pageSize=${pageSize}`, token);

export const markNotificationRead = (token: string, id: string) =>
  authedSend<AppNotification>(`/notifications/${id}/read`, token, { method: "POST" });

export const markAllNotificationsRead = (token: string) =>
  authedSend<{ updated: number }>("/notifications/read-all", token, { method: "POST" });
