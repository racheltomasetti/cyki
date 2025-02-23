import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import WebhookService from "@/components/WebhookService";

export default function Notes() {
  const [noteText, setNoteText] = useState("");
  const [timestamp] = useState(new Date().toLocaleString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaAttachments, setMediaAttachments] = useState([]);
  const inputRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Request permissions on component mount
  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setMediaAttachments([
        ...mediaAttachments,
        { type: "image", uri: result.assets[0].uri },
      ]);
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = [...mediaAttachments];
    newAttachments.splice(index, 1);
    setMediaAttachments(newAttachments);
  };

  const insertAtCursor = (textToInsert) => {
    const before = noteText.slice(0, cursorPosition);
    const after = noteText.slice(cursorPosition);
    const newText = before + textToInsert + after;
    setNoteText(newText);

    setTimeout(() => {
      inputRef.current?.focus();
      const newPosition = cursorPosition + textToInsert.length;
      setCursorPosition(newPosition);
    }, 50);
  };

  const handleSelectionChange = (event) => {
    setCursorPosition(event.nativeEvent.selection.start);
  };

  const addTodoItem = () => {
    const currentLine = getCurrentLine();
    if (currentLine.trim() === "") {
      insertAtCursor("☐ ");
    } else {
      insertAtCursor("\n☐ ");
    }
  };

  const addBulletPoint = () => {
    const currentLine = getCurrentLine();
    if (currentLine.trim() === "") {
      insertAtCursor("• ");
    } else {
      insertAtCursor("\n• ");
    }
  };

  const addNumberedItem = () => {
    const lines = noteText.slice(0, cursorPosition).split("\n");
    const currentNumber =
      lines.filter((line) => /^\d+\./.test(line)).length + 1;
    const currentLine = getCurrentLine();

    if (currentLine.trim() === "") {
      insertAtCursor(`${currentNumber}. `);
    } else {
      insertAtCursor(`\n${currentNumber}. `);
    }
  };

  const getCurrentLine = () => {
    const lines = noteText.slice(0, cursorPosition).split("\n");
    return lines[lines.length - 1] || "";
  };

  const handleTextChange = (text) => {
    // Check if the last character entered was a newline
    if (text.endsWith("\n") && text !== noteText) {
      const lines = text.split("\n");
      const previousLine = lines[lines.length - 2] || ""; // Get the line before the new line

      // Check for different list patterns
      const bulletMatch = previousLine.match(/^[•]\s/);
      const todoMatch = previousLine.match(/^[☐]\s/);
      const numberMatch = previousLine.match(/^(\d+)\.\s/);

      if (bulletMatch) {
        setNoteText(text + "• ");
        return;
      }

      if (todoMatch) {
        setNoteText(text + "☐ ");
        return;
      }

      if (numberMatch) {
        const nextNumber = parseInt(numberMatch[1]) + 1;
        setNoteText(text + `${nextNumber}. `);
        return;
      }
    }

    setNoteText(text);
  };

  const handleRefactor = async () => {
    if (!noteText.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("content", noteText);
      formData.append("timestamp", timestamp);

      mediaAttachments.forEach((attachment, index) => {
        formData.append(`media_${index}`, {
          uri: attachment.uri,
          type: "image/jpeg",
          name: `image_${index}.jpg`,
        });
      });

      const response = await fetch("YOUR_API_ENDPOINT/refactor", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        const refactoredNote = await response.json();
        setNoteText(refactoredNote.content);
      } else {
        console.error("Failed to refactor note");
      }
    } catch (error) {
      console.error("Error refactoring note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNote = async () => {
    if (!noteText.trim()) return;

    setIsSubmitting(true);
    try {
      // Simplified payload without multimedia
      const payload = {
        content: noteText,
        timestamp: timestamp,
        status: "closed",
      };

      const response = await WebhookService.triggerWebhook(payload);

      if (response && response.status === "success") {
        setNoteText("");
        // Optionally clear media attachments if needed
        setMediaAttachments([]);

        console.log("Note successfully processed by workflow");
      } else {
        console.error("Failed to process note through workflow", response);
      }
    } catch (error) {
      console.error("Error triggering workflow:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.header}>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </View>

          <View style={styles.contentContainer}>
            <ScrollView
              style={styles.inputContainer}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                ref={inputRef}
                style={styles.input}
                multiline
                value={noteText}
                onChangeText={handleTextChange}
                onSelectionChange={handleSelectionChange}
                placeholder="Write your notes here..."
                placeholderTextColor="#666"
                autoFocus={false}
                textAlignVertical="top"
              />

              {mediaAttachments.length > 0 && (
                <View style={styles.attachmentsContainer}>
                  {mediaAttachments.map((attachment, index) => (
                    <View key={index} style={styles.attachmentPreview}>
                      <Image
                        source={{ uri: attachment.uri }}
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeAttachment(index)}
                      >
                        <MaterialIcons name="close" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.sideBar}>
              <View style={styles.formatSection}>
                <TouchableOpacity
                  style={styles.sideBarButton}
                  onPress={addTodoItem}
                >
                  <MaterialIcons
                    name="check-box-outline-blank"
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sideBarButton}
                  onPress={addBulletPoint}
                >
                  <MaterialIcons
                    name="fiber-manual-record"
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sideBarButton}
                  onPress={addNumberedItem}
                >
                  <MaterialIcons
                    name="format-list-numbered"
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sideBarButton}
                  onPress={pickImage}
                >
                  <MaterialIcons name="image" size={22} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.actionSection}>
                <TouchableOpacity
                  style={[styles.sideBarButton, styles.refactorButton]}
                  onPress={handleRefactor}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <MaterialIcons
                      name="auto-fix-high"
                      size={22}
                      color="#fff"
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sideBarButton, styles.closeButton]}
                  onPress={handleCloseNote}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <MaterialIcons name="check-circle" size={22} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
  },
  contentContainer: {
    flex: 1,
    flexDirection: "row",
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    textAlignVertical: "top",
    padding: 15,
    minHeight: 150,
  },
  sideBar: {
    width: 50,
    backgroundColor: "#D3E6D9",
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
    paddingVertical: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  formatSection: {
    alignItems: "center",
    gap: 15,
  },
  actionSection: {
    alignItems: "center",
    gap: 15,
  },
  sideBarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  refactorButton: {
    backgroundColor: "#002AFF",
  },
  closeButton: {
    backgroundColor: "#D100D1",
  },
  attachmentsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 15,
    gap: 10,
  },
  attachmentPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
