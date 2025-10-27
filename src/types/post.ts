/**
 * Post Types for EduOps Mobile App
 * Based on web app post structure
 */

export interface PostFile {
  id: number;
  fileName: string;
  fileType: string;
  fileSize?: number;
  url: string;
  postId: number;
  createdAt: string;
}

export interface PostUser {
  id: number;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher' | 'student';
  profilePicLink?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  tag: 'global' | 'student' | 'teacher';
  status: string;
  isArchived: boolean;
  userId: number;
  createdAt: string;
  updatedAt?: string;
  user?: PostUser;
  files?: PostFile[];
  // Formatted fields
  profilePic?: string;
  postedBy?: string;
  department?: string;
  formattedDate?: string;
}

export interface PostsState {
  posts: Post[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  clearError: () => void;
  getVisiblePosts: (userRole: 'student' | 'teacher' | 'admin') => Post[];
}

export const POST_TAGS = {
  GLOBAL: 'global',
  STUDENT: 'student',
  TEACHER: 'teacher',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher',
} as const;
