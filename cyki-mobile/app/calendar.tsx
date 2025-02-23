import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Vibration,
  View,
  Text,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
} from "date-fns";

// Function to get minimally unique day names
const getShortDayName = (date: Date) => {
  const dayNames = {
    Sunday: "Su",
    Monday: "M",
    Tuesday: "T",
    Wednesday: "W",
    Thursday: "Th",
    Friday: "F",
    Saturday: "Sa",
  };
  const fullDay = format(date, "EEEE");
  return dayNames[fullDay as keyof typeof dayNames];
};
import { MaterialIcons } from "@expo/vector-icons";

// Cycle phase colors
const cyclePhases = {
  menstrual: { name: "Menstruation", color: "#E6D3E1", duration: 5 }, // Soft purple for menstrual
  follicular: { name: "Follicular Phase", color: "#D3E6D9", duration: 9 }, // Soft green for follicular
  ovulation: { name: "Ovulation Phase", color: "#E6E1D3", duration: 5 }, // Soft yellow for ovulation
  luteal: { name: "Luteal Phase", color: "#E6D6D3", duration: 9 }, // Soft orange for luteal
};

export default function CalendarScreen() {
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, setPermissionResponse] =
    useState<Audio.PermissionResponse>();
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef<NodeJS.Timer | null>(null);

  // Request permissions on component mount
  useEffect(() => {
    const getPermission = async () => {
      const permission = await Audio.requestPermissionsAsync();
      setPermissionResponse(permission);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    };

    getPermission();

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== "granted") {
        console.warn("No recording permission");
        return;
      }

      // Create new recording instance
      const { recording: recordingInstance } =
        await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

      setRecording(recordingInstance);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      Vibration.vibrate(50);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      clearInterval(recordingTimer.current as NodeJS.Timer);
      recordingTimer.current = null;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (recordingDuration >= 1 && uri) {
        const info = await FileSystem.getInfoAsync(uri);
        console.log("Recording info:", info);
        await sendAudioQuery(uri);
      }

      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);

      Vibration.vibrate(50);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  };

  const handlePressIn = async () => {
    if (permissionResponse?.status === "granted") {
      await startRecording();
    }
  };

  const handlePressOut = async () => {
    if (isRecording) {
      await stopRecording();
    }
  };

  // Add cycle tracking state
  const [cycleStartDate, setCycleStartDate] = useState(new Date(2025, 1, 10)); // Example start date
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date())
  );
  const [isMonthView, setIsMonthView] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const toggleView = () => {
    // Animate the toggle
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsMonthView(!isMonthView);
  };

  // Function to calculate cycle phase for a given date
  const getCyclePhase = (date: Date) => {
    const daysSinceCycleStart = Math.floor(
      (date.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const cycleDayNormalized = ((daysSinceCycleStart % 28) + 28) % 28; // Normalize to 28-day cycle

    if (cycleDayNormalized < cyclePhases.menstrual.duration) {
      return "menstrual";
    } else if (
      cycleDayNormalized <
      cyclePhases.menstrual.duration + cyclePhases.follicular.duration
    ) {
      return "follicular";
    } else if (
      cycleDayNormalized <
      cyclePhases.menstrual.duration +
        cyclePhases.follicular.duration +
        cyclePhases.ovulation.duration
    ) {
      return "ovulation";
    } else {
      return "luteal";
    }
  };

  // Function to calculate gradient opacity for smooth transitions
  const getPhaseOpacity = (date: Date) => {
    const daysSinceCycleStart = Math.floor(
      (date.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const cycleDayNormalized = ((daysSinceCycleStart % 28) + 28) % 28;
    return Math.min(0.3, Math.max(0.1, 0.2)); // Subtle opacity range
  };

  const renderWeek = (startDate: Date, showDayNames: boolean = true) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const isSelected =
        format(date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

      days.push(
        <TouchableOpacity
          key={i}
          style={[styles.dayButton, isSelected && styles.selectedDay]}
          onPress={() => setSelectedDate(date)}
        >
          <LinearGradient
            colors={[
              cyclePhases[getCyclePhase(date) as keyof typeof cyclePhases]
                .color,
              "transparent",
            ]}
            style={[
              StyleSheet.absoluteFill,
              { opacity: getPhaseOpacity(date), borderRadius: 12 },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text
            style={[
              styles.dayText,
              isSelected && styles.selectedDayText,
              { flexShrink: 1 },
            ]}
            numberOfLines={1}
          >
            {getShortDayName(date)}
          </Text>
          <Text style={[styles.dateText, isSelected && styles.selectedDayText]}>
            {format(date, "d")}
          </Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  const renderMonth = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });

    return weeks.map((week, i) => (
      <View key={i} style={styles.weekContainer}>
        {renderWeek(week, i === 0)} {/* Only show day names for first row */}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.calendarContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.monthText}>
              {format(selectedDate, "MMMM yyyy")}
            </Text>
            <TouchableOpacity style={styles.toggleButton} onPress={toggleView}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <MaterialIcons
                  name="calendar-today"
                  size={24}
                  color="#002AFF"
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {isMonthView ? (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              {renderMonth()}
            </Animated.View>
          ) : (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <View style={styles.weekContainer}>
                {renderWeek(currentWeekStart)}
              </View>
            </Animated.View>
          )}

          <View style={styles.scheduleContainer}>
            <Text style={styles.scheduleTitle}>
              Schedule for {format(selectedDate, "MMMM d, yyyy")}
            </Text>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>9:00 AM</Text>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleText}>Morning Meeting</Text>
              </View>
            </View>
            <View style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>2:00 PM</Text>
              <View style={styles.scheduleContent}>
                <Text style={styles.scheduleText}>Project Review</Text>
              </View>
            </View>
          </View>

          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>Cycle Insights</Text>
            <View style={styles.insightCard}>
              <View
                style={[
                  styles.phaseIndicator,
                  {
                    backgroundColor:
                      cyclePhases[
                        getCyclePhase(selectedDate) as keyof typeof cyclePhases
                      ].color,
                  },
                ]}
              >
                <Text style={styles.phaseTitle}>
                  {
                    cyclePhases[
                      getCyclePhase(selectedDate) as keyof typeof cyclePhases
                    ].name
                  }
                </Text>
              </View>
              <View style={styles.insightRow}>
                <MaterialIcons name="psychology" size={24} color="#666666" />
                <Text style={styles.insightText}>
                  Enhanced focus and creativity
                </Text>
              </View>
              <View style={styles.insightRow}>
                <MaterialIcons
                  name="battery-charging-full"
                  size={24}
                  color="#666666"
                />
                <Text style={styles.insightText}>Energy levels peaking</Text>
              </View>
              <View style={styles.insightRow}>
                <MaterialIcons name="favorite" size={24} color="#666666" />
                <Text style={styles.insightText}>
                  Great day for social activities
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* <TouchableOpacity
        style={[styles.addButton, isRecording && styles.recordingButton]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {isRecording ? (
          <View style={styles.recordingContainer}>
            <MaterialIcons name="mic" size={24} color="#FFFFFF" />
            <Text style={styles.recordingTimer}>
              {Math.floor(recordingDuration)}s
            </Text>
          </View>
        ) : (
          <MaterialIcons name="mic-none" size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity> */}
    </View>
  );
}

const sendAudioQuery = async (audioUri: string) => {
  try {
    const formData = new FormData();
    formData.append("audio", {
      uri: audioUri,
      type: "audio/m4a",
      name: "recording.m4a",
    } as any);

    formData.append("timestamp", new Date().toISOString());
    formData.append("deviceInfo", Platform.OS);

    // Replace with your actual API endpoint
    const response = await fetch("YOUR_API_ENDPOINT", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const result = await response.json();
    console.log("Audio query result:", result);
  } catch (error) {
    console.error("Error sending audio query:", error);
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#FFFFFF",
  },
  calendarContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  dayButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    width: 48,
  },
  selectedDay: {
    backgroundColor: "#002AFF",
  },
  dayText: {
    fontSize: 12,
    marginBottom: 5,
    color: "#000000",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  selectedDayText: {
    color: "white",
  },
  scheduleContainer: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#000000",
  },
  scheduleItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  scheduleTime: {
    width: 80,
    fontSize: 14,
    color: "#666",
  },
  scheduleContent: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    padding: 15,
    borderRadius: 10,
  },
  scheduleText: {
    fontSize: 16,
    color: "#000000",
  },
  phaseIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    opacity: 0.2,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#002AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: "white",
    fontSize: 32,
    marginTop: -2,
  },
  insightsContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000000",
  },
  insightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  phaseIndicator: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    textAlign: "center",
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
  },
  insightText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 12,
    flex: 1,
  },
  recordingButton: {
    backgroundColor: "#FF4136",
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  recordingTimer: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
