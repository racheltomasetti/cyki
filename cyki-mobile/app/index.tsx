import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const [modalVisible, setModalVisible] = useState(false);
  const [signature, setSignature] = useState("");
  const [hasCommitted, setHasCommitted] = useState(false);

  const handleCommit = () => {
    if (signature.trim()) {
      setHasCommitted(true);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.imageSection}>
        <Image
          source={require("../assets/images/aura.png")}
          style={styles.auraImage}
          resizeMode="cover"
        />
        <Text style={styles.cykiText}>cyki</Text>
        <Text style={styles.subtitleText}>
          understand your cycle to unlock your Self
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          {hasCommitted ? "view commitment" : "i'm ready."}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Your Commitment</Text>
            <Text style={styles.modalText}>
              By signing below, you are making a commitment to yourself to
              embark on this journey of self-discovery and growth.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={signature}
              onChangeText={setSignature}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.commitButton]}
                onPress={handleCommit}
              >
                <Text style={styles.commitButtonText}>Commit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "space-between",
    paddingBottom: 40,
  },
  imageSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  auraImage: {
    width: width * 2.5,
    height: width * 2.5,
    opacity: 0.8,
    marginTop: 100,
  },
  cykiText: {
    position: "absolute",
    color: "#002AFF",
    fontSize: 36,
    fontWeight: "500",
    fontStyle: "italic",
    textAlign: "center",
    letterSpacing: 2,
    opacity: 0.6,
    top: "45%",
  },
  subtitleText: {
    position: "absolute",
    color: "#002AFF",
    fontSize: 16,
    fontWeight: "400",
    opacity: 0.6,
    letterSpacing: 1,
    textAlign: "center",
    maxWidth: width * 0.8,
    fontStyle: "italic",
    top: "55%",
    flexWrap: "wrap",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    marginHorizontal: 20,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#002AFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#666",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  commitButton: {
    backgroundColor: "#2196F3",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  commitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
