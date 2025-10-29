import { create } from "zustand";
import {
  postsApi,
  formatBackendPost,
  filterPostsByRole,
} from "../utils/postsApi";
import { Post, PostsState } from "../types/post";

/**
 * Read-only Posts Store for Student View
 * Handles fetching and displaying posts
 */
const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  isLoading: false,
  isRefreshing: false,
  error: null,

  /**
   * Fetch all posts from the backend
   * Formats posts for mobile display
   */
  fetchPosts: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await postsApi.getPosts();
      const formattedPosts = response.map(formatBackendPost);

      set({
        posts: formattedPosts,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      set({
        error: error.message || "Failed to load posts",
        isLoading: false,
      });
    }
  },

  /**
   * Refresh posts (for pull-to-refresh)
   * Uses separate loading state to avoid UI conflicts
   */
  refreshPosts: async () => {
    set({ isRefreshing: true, error: null });

    try {
      const response = await postsApi.getPosts();
      const formattedPosts = response.map(formatBackendPost);

      set({
        posts: formattedPosts,
        isRefreshing: false,
        error: null,
      });
    } catch (error: any) {
      console.error("Error refreshing posts:", error);
      set({
        error: error.message || "Failed to refresh posts",
        isRefreshing: false,
      });
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Get posts visible to a specific user role
   * Filters by tag and archived status
   * @param userRole - User role (student, teacher, admin)
   * @returns Filtered posts array
   */
  getVisiblePosts: (userRole: "student" | "teacher" | "admin") => {
    const { posts } = get();
    return filterPostsByRole(posts, userRole);
  },
}));

export default usePostsStore;
