export interface NotificationUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePicLink?: string | null;
  role: string;
}

export interface NotificationData {
  posterFirstName?: string;
  posterLastName?: string;
  posterProfilePic?: string;
  [key: string]: any; // Allow additional properties
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: NotificationData;
  profilePic?: string | null;
  isRead: boolean;
  delivered: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  user?: NotificationUser;
}

export interface NotificationResponse {
  error: boolean;
  data: Notification[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MarkReadResponse {
  error: boolean;
  message: string;
}

export const NOTIFICATION_TYPES = {
  MESSAGE: { prefix: 'New message from', isSystem: false },
  SYSTEM: { prefix: 'Course reminder from', isSystem: true },
  ANNOUNCEMENT: { prefix: 'Announcement from', isSystem: true },
  PAYMENT: { prefix: 'Payment reminder from', isSystem: true },
  ENROLLMENT: { prefix: 'Enrollment update from', isSystem: true },
} as const;
