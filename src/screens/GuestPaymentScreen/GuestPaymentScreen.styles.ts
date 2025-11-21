import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#700A06",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  paymentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  paymentCard: {
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
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#de0000",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
    zIndex: 100,
  },
  halfWidth: {
    flex: 1,
    zIndex: 100,
  },
  fullWidth: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#333",
    backgroundColor: "white",
    minHeight: 40,
  },
  inputWithIcon: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    right: 12,
    top: 10,
  },
  inputDisabled: {
    backgroundColor: "#f5f5f5",
    opacity: 0.6,
  },
  inputReadOnly: {
    backgroundColor: "#f5f5f5",
  },
  inputError: {
    borderColor: "#de0000",
    borderWidth: 1,
  },
  errorContainer: {
    marginBottom: 16,
    marginTop: -8,
  },
  errorText: {
    fontSize: 12,
    color: "#de0000",
    marginTop: 4,
  },
  dropdownContainer: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
    minHeight: 40,
  },
  dropdownText: {
    fontSize: 13,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    maxHeight: "70%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalOptionSelected: {
    backgroundColor: "#fff5f5",
  },
  modalOptionLast: {
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  modalOptionTextSelected: {
    color: "#de0000",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#de0000",
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: "stretch",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoPanel: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#90caf9",
    marginTop: 20,
    gap: 12,
  },
  infoPanelContent: {
    flex: 1,
  },
  infoPanelTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1565c0",
    marginBottom: 8,
  },
  infoPanelText: {
    fontSize: 12,
    color: "#1565c0",
    lineHeight: 18,
    marginBottom: 4,
  },
  emptyStateContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    minHeight: 40,
    justifyContent: "center",
  },
  emptyStateText: {
    fontSize: 13,
    color: "#999",
  },
});
