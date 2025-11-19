import axiosInstance from "./axios";
import { Post } from "../types/post";

/**
 * Posts API for EduOps Mobile App
 * Read-only operations for student view
 */

export const postsApi = {
  /**
   * Get all posts with optional filters
   * @param params - Optional query parameters (tag, status, isArchived)
   * @returns Promise with posts data
   */
  getPosts: async (params = {}): Promise<Post[]> => {
    try {
      const response = await axiosInstance.get("/posts", { params });
      return response.data.data || [];
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch posts"
      );
    }
  },

  /**
   * Get single post by ID
   * @param postId - Post ID
   * @returns Promise with post data
   */
  getPost: async (postId: number): Promise<Post> => {
    try {
      const response = await axiosInstance.get(`/posts/${postId}`);
      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching post:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch post"
      );
    }
  },
};

/**
 * Format backend post data to mobile-friendly format
 * @param backendPost - Raw post data from backend
 * @returns Formatted post object
 */
export const formatBackendPost = (backendPost: any): Post => {
  // Determine department based on user role
  let department = "Department";
  if (backendPost.user?.role === "admin") {
    department = "Admin Office";
  } else if (backendPost.user?.role === "teacher") {
    department = "Faculty";
  } else if (backendPost.user?.role === "student") {
    department = "Student";
  }

  // Format date
  const formattedDate = formatDate(backendPost.createdAt);

  return {
    id: backendPost.id,
    title: backendPost.title,
    content: backendPost.content,
    tag: backendPost.tag,
    status: backendPost.status,
    isArchived: backendPost.isArchived || false,
    userId: backendPost.userId,
    createdAt: backendPost.createdAt,
    updatedAt: backendPost.updatedAt,
    user: backendPost.user,
    files: backendPost.files || [],
    // Formatted fields for display
    profilePic: backendPost.user?.profilePicLink || null,
    postedBy: backendPost.user
      ? `${backendPost.user.firstName} ${backendPost.user.lastName}`
      : "Unknown",
    department,
    formattedDate,
  };
};

/**
 * Format date to mobile-friendly format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return "Just now";
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  // More than a week - show full date
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Determine if a post is visible to a specific user role
 * @param post - Post object
 * @param userRole - User role (student, teacher, admin)
 * @returns true if post should be visible
 */
export const isPostVisibleToRole = (
  post: Post,
  userRole: "student" | "teacher" | "admin"
): boolean => {
  if (!post) return false;

  // Archived posts only visible to admins
  if (post.isArchived) return userRole === "admin";

  // Admins can see all posts
  if (userRole === "admin") return true;

  // Check tag visibility
  if (post.tag === "global") return true;
  if (post.tag === "student" && userRole === "student") return true;
  if (post.tag === "teacher" && userRole === "teacher") return true;

  return false;
};

/**
 * Filter posts by user role
 * @param posts - Array of posts
 * @param userRole - User role
 * @returns Filtered array of posts
 */
export const filterPostsByRole = (
  posts: Post[],
  userRole: "student" | "teacher" | "admin"
): Post[] => {
  return posts.filter((post) => isPostVisibleToRole(post, userRole));
};
