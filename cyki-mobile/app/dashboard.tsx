import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import WebhookService from "@/components/WebhookService";

const { width } = Dimensions.get("window");

const categoryPrompts = [
  {
    id: "nutrition",
    icon: "restaurant",
    title: "Nutrition",
  },
  // ... other categories
];

const welcomeMessage = {
  type: "system",
  content:
    "Welcome back! Ready to dive into how your mind and body shift through your cycle? Ask anything or explore one of the five facets of wellness. 🌱✨",
};

export default function Dashboard() {
  const [messages, setMessages] = useState([welcomeMessage]);
  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef<any>();

  const sendMessageToWorkflow = async (message: string) => {
    // Ensure message is a string and not undefined
    const safeMessage = message || "";

    if (!safeMessage.trim()) return;

    setIsSubmitting(true);
    try {
      // Create a user message immediately
      const userMessage = {
        type: "user",
        content: safeMessage,
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Send message to N8N workflow via WebhookService
      const response = await WebhookService.triggerWebhook({
        chatInput: safeMessage,
      });

      // Handle the AI response with additional checks
      const aiResponse = {
        type: "system",
        content:
          response?.aiResponse ||
          response?.message ||
          "I received your message, but couldn't generate a response.",
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    } catch (error: any) {
      console.error("Error sending message to workflow:", error);

      // Add an error message to the chat
      const errorMessage = {
        type: "system",
        content:
          error.message ||
          "Sorry, there was an error processing your message. Please try again.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);

      // Show an alert for the user
      Alert.alert(
        "Network Error",
        error.message || "Failed to send message. Please check your connection."
      );
    } finally {
      setIsSubmitting(false);
      setInputText(""); // Clear input after sending
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleCategoryClick = (category: any) => {
    // Safely handle potential undefined category
    if (!category || !category.title) {
      console.error("Invalid category:", category);
      return;
    }

    const message = `Tell me about my ${category.title.toLowerCase()}`;
    sendMessageToWorkflow(message);
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      sendMessageToWorkflow(inputText);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.chatContainer}>
        {/* Category Icons */}
        <View style={styles.categoriesContainer}>
          {categoryPrompts.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryClick(category)}
            >
              <MaterialIcons name={category.icon} size={38} color="#002AFF" />
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBox,
                message.type === "user"
                  ? styles.userMessage
                  : styles.systemMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.type === "user"
                    ? styles.userMessageText
                    : styles.systemMessageText,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask away..."
            multiline
            maxLength={200}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={isSubmitting || !inputText.trim()}
          >
            <MaterialIcons
              name="send"
              size={24}
              color={isSubmitting || !inputText.trim() ? "#CCCCCC" : "#002AFF"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  categoryCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    width: width / 6,
    aspectRatio: 1,
  },
  categoryTitle: {
    fontSize: 6,
    color: "#002AFF",
    marginTop: 4,
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBox: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    backgroundColor: "#002AFF",
    alignSelf: "flex-end",
  },
  systemMessage: {
    backgroundColor: "#D3E6D9",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#ffffff",
  },
  systemMessageText: {
    color: "#333333",
  },
  promptsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingVertical: 8,
  },
  promptsContent: {
    paddingHorizontal: 8,
  },
  promptButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  promptText: {
    color: "#002AFF",
    fontSize: 13,
    marginLeft: 6,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
});
