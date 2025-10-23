import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#de0000",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flex: 1,
  },
  headerLogo: {
    width: 120,
    height: 32,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#fffdf2",
    position: "relative",
  },
  decorativeTop: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    backgroundColor: "#de0000",
    transform: [{ rotate: "45deg" }],
    zIndex: 1,
  },
  decorativeBottom: {
    position: "absolute",
    bottom: 80,
    left: -50,
    width: 200,
    height: 200,
    backgroundColor: "#de0000",
    transform: [{ rotate: "45deg" }],
    zIndex: 1,
  },
  scrollContent: {
    flex: 1,
    zIndex: 2,
  },
  profileContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profilePictureSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePictureContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  editProfileText: {
    fontSize: 14,
    color: "#666",
  },
  changePasswordButton: {
    backgroundColor: "#8B0000",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  changePasswordText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  nameSection: {
    marginBottom: 30,
  },
  studentName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  nameLine: {
    height: 2,
    backgroundColor: "#de0000",
    width: "100%",
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  detailsGrid: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    gap: 20,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navText: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  activeNavText: {
    color: "#de0000",
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#8B0000",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    alignSelf: "center",
    width: "100%",
  },
  logoutText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
});
