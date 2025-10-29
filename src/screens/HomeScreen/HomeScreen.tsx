import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import ImageViewing from "react-native-image-viewing";
import { useRouter, useSegments } from "expo-router";
import { styles } from "./Homescreen.styles";
import { BottomNavigation } from "../../components/BottomNavigation";
import { NotificationDropdown } from "../../../components/NotificationDropdown";
import usePostsStore from "../../stores/postsStore";
import { Post, PostFile } from "../../types/post";
import {
  showDownloadConfirmation,
  downloadAndShare,
} from "../../utils/fileDownload";

interface PostCardProps {
  post: Post;
  onImagePress: (images: { uri: string }[], index: number) => void;
  onFilePress: (file: PostFile) => void;
}

const PostTag: React.FC<{ tag: string }> = ({ tag }) => {
  const getTagStyle = () => {
    switch (tag) {
      case "global":
        return { backgroundColor: "#3b82f6", text: "Global" };
      case "student":
        return { backgroundColor: "#10b981", text: "Student" };
      case "teacher":
        return { backgroundColor: "#f59e0b", text: "Teacher" };
      default:
        return { backgroundColor: "#6b7280", text: tag };
    }
  };

  const tagStyle = getTagStyle();

  return (
    <View
      style={[styles.tagBadge, { backgroundColor: tagStyle.backgroundColor }]}
    >
      <Text style={styles.tagText}>{tagStyle.text}</Text>
    </View>
  );
};

const FileAttachment: React.FC<{ file: PostFile; onPress: () => void }> = ({
  file,
  onPress,
}) => {
  const isImage = file.fileType?.startsWith("image/");

  if (isImage) {
    return (
      <TouchableOpacity style={styles.imageAttachment} onPress={onPress}>
        <Image
          source={{ uri: file.url }}
          style={styles.attachmentImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  }

  // Non-image file
  return (
    <TouchableOpacity style={styles.fileAttachment} onPress={onPress}>
      <View style={styles.fileIcon}>
        <Icon name="insert-drive-file" size={24} color="#3b82f6" />
      </View>
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.fileName}
        </Text>
        <Text style={styles.fileSize}>
          {file.fileSize
            ? `${(file.fileSize / 1024 / 1024).toFixed(2)} MB`
            : "File"}
        </Text>
      </View>
      <Icon name="download" size={20} color="#666" />
    </TouchableOpacity>
  );
};

const PostCard: React.FC<PostCardProps> = ({
  post,
  onImagePress,
  onFilePress,
}) => {
  const images =
    post.files?.filter((f) => f.fileType?.startsWith("image/")) || [];
  const documents =
    post.files?.filter((f) => !f.fileType?.startsWith("image/")) || [];

  const handleImagePress = (file: PostFile) => {
    const imageIndex = images.findIndex((img) => img.id === file.id);
    const imageUris = images.map((img) => ({ uri: img.url }));
    onImagePress(imageUris, imageIndex);
  };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: post.profilePic }}
          style={styles.avatar}
          defaultSource={require("../../../assets/images/sprachins-logo-3.png")}
        />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{post.postedBy}</Text>
          <Text style={styles.department}>{post.department}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.timeAgo}>{post.formattedDate}</Text>
            <Icon
              name="public"
              size={12}
              color="#666"
              style={styles.publicIcon}
            />
          </View>
        </View>
      </View>

      <Text style={styles.postTitle}>{post.title}</Text>
      <Text style={styles.postContent}>{post.content}</Text>

      {/* Image Attachments */}
      {images.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <View
            style={[
              styles.imagesGrid,
              images.length === 1 && styles.singleImageGrid,
            ]}
          >
            {images.map((file) => (
              <FileAttachment
                key={file.id}
                file={file}
                onPress={() => handleImagePress(file)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Document Attachments */}
      {documents.length > 0 && (
        <View style={styles.attachmentsContainer}>
          {documents.map((file) => (
            <FileAttachment
              key={file.id}
              file={file}
              onPress={() => onFilePress(file)}
            />
          ))}
        </View>
      )}

      {/* Post Tag */}
      <View style={styles.postFooter}>
        <PostTag tag={post.tag} />
      </View>
    </View>
  );
};

export const HomeScreen = (): React.JSX.Element => {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = "/" + (segments[segments.length - 1] || "");

  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImages, setCurrentImages] = useState<{ uri: string }[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    getVisiblePosts,
    fetchPosts,
    refreshPosts,
    isLoading,
    isRefreshing,
    error,
    clearError,
  } = usePostsStore();

  const visiblePosts = getVisiblePosts("student");

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRetry = () => {
    clearError();
    fetchPosts();
  };

  const handleImagePress = (images: { uri: string }[], index: number) => {
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setImageViewerVisible(true);
  };

  const handleFilePress = (file: PostFile) => {
    showDownloadConfirmation(file.fileName, file.fileSize, async () => {
      try {
        await downloadAndShare(file.url, file.fileName);
      } catch (error) {
        console.error("Download error:", error);
      }
    });
  };

  const isEnrollmentActive =
    currentRoute === "/enrollment" ||
    currentRoute === "/enrollment-status" ||
    currentRoute === "/schedule";
  const isPaymentActive = ["/paymentform", "/assessment", "/ledger"].includes(
    currentRoute
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#de0000" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/images/sprachins-logo-3.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerIcons}>
            <NotificationDropdown />
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.replace("/profile")}
            >
              <Text style={styles.profileText}>PD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#de0000" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Icon name="error-outline" size={64} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.mainContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refreshPosts}
              colors={["#de0000"]}
              tintColor="#de0000"
            />
          }
        >
          <View style={styles.postsContainer}>
            {visiblePosts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="article" size={64} color="#d1d5db" />
                <Text style={styles.emptyText}>No posts as of the moment</Text>
              </View>
            ) : (
              visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onImagePress={handleImagePress}
                  onFilePress={handleFilePress}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* Image Viewer */}
      <ImageViewing
        images={currentImages}
        imageIndex={currentImageIndex}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}
      />

      {/* Bottom Navigation */}
      <BottomNavigation
        enrollmentActive={isEnrollmentActive}
        paymentActive={isPaymentActive}
      />
    </SafeAreaView>
  );
};
