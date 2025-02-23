import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from "react-native";
import { useState, useLayoutEffect, useRef, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

// Progress Goal Widget
const GoalProgressWidget = ({ goal }) => {
  const progress = (goal.current / goal.target) * 100;
  return (
    <View style={styles.widget}>
      <Text style={styles.widgetTitle}>{goal.title}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {goal.current} / {goal.target} {goal.unit}
        </Text>
      </View>
      <Text style={styles.goalDeadline}>Deadline: {goal.deadline}</Text>
    </View>
  );
};

// Pomodoro Timer Widget
const PomodoroWidget = () => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isWork, setIsWork] = useState(true);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => {
          if (timeLeft <= 1) {
            setIsActive(false);
            setIsWork(!isWork);
            return isWork ? 5 * 60 : 25 * 60; // Switch between work and break
          }
          return timeLeft - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isWork]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <View style={styles.widget}>
      <Text style={styles.widgetTitle}>Pomodoro Timer</Text>
      <Text style={styles.pomodoroStatus}>
        {isWork ? "Work Time" : "Break Time"}
      </Text>
      <Text style={styles.pomodoroTimer}>
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}
      </Text>
      <TouchableOpacity
        style={styles.pomodoroButton}
        onPress={() => setIsActive(!isActive)}
      >
        <Text style={styles.pomodoroButtonText}>
          {isActive ? "Pause" : "Start"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Habit Tracker Widget
const HabitTrackerWidget = ({ habits }) => {
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <View style={styles.widget}>
      <Text style={styles.widgetTitle}>Weekly Habits</Text>
      {habits.map((habit, index) => (
        <View key={index} style={styles.habitRow}>
          <Text style={styles.habitTitle}>{habit.name}</Text>
          <View style={styles.habitDays}>
            {days.map((day, dayIndex) => (
              <TouchableOpacity
                key={dayIndex}
                style={[
                  styles.habitDay,
                  habit.completedDays.includes(dayIndex) &&
                    styles.habitDayCompleted,
                ]}
              >
                <Text style={styles.habitDayText}>{day}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

// Daily Focus Widget
const DailyFocusWidget = ({ focus }) => (
  <View style={styles.widget}>
    <Text style={styles.widgetTitle}>Daily Focus</Text>
    <Text style={styles.focusQuote}>{focus.quote}</Text>
    <Text style={styles.focusAuthor}>- {focus.author}</Text>
    <View style={styles.focusPriorities}>
      <Text style={styles.focusSubtitle}>Top 3 Priorities:</Text>
      {focus.priorities.map((priority, index) => (
        <Text key={index} style={styles.focusPriority}>
          {index + 1}. {priority}
        </Text>
      ))}
    </View>
  </View>
);

export default function Dashboard() {
  const navigation = useNavigation();
  const [isEditing, setIsEditing] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState([
    "goals",
    "pomodoro",
    "habits",
    "focus",
  ]);

  // Sample data
  const sampleData = {
    goals: {
      title: "Read Books",
      current: 3,
      target: 12,
      unit: "books",
      deadline: "Dec 2024",
    },
    habits: [
      {
        name: "Morning Meditation",
        completedDays: [0, 1, 3, 4],
      },
      {
        name: "Exercise",
        completedDays: [0, 2, 4],
      },
      {
        name: "Reading",
        completedDays: [1, 2, 3, 5],
      },
    ],
    focus: {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      priorities: [
        "Complete project presentation",
        "30 minutes meditation",
        "Review weekly goals",
      ],
    },
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? "Done" : "Edit"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEditing]);

  const toggleWidget = (widgetId) => {
    if (activeWidgets.includes(widgetId)) {
      setActiveWidgets(activeWidgets.filter((id) => id !== widgetId));
    } else {
      setActiveWidgets([...activeWidgets, widgetId]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {isEditing ? (
        <View style={styles.widgetSelector}>
          <Text style={styles.sectionTitle}>Customize Dashboard</Text>
          {["goals", "pomodoro", "habits", "focus"].map((widget) => (
            <TouchableOpacity
              key={widget}
              style={[
                styles.widgetOption,
                activeWidgets.includes(widget) && styles.widgetOptionActive,
              ]}
              onPress={() => toggleWidget(widget)}
            >
              <Text>
                {widget.charAt(0).toUpperCase() + widget.slice(1)} Widget
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.dashboardGrid}>
          {activeWidgets.includes("goals") && (
            <GoalProgressWidget goal={sampleData.goals} />
          )}
          {activeWidgets.includes("pomodoro") && <PomodoroWidget />}
          {activeWidgets.includes("habits") && (
            <HabitTrackerWidget habits={sampleData.habits} />
          )}
          {activeWidgets.includes("focus") && (
            <DailyFocusWidget focus={sampleData.focus} />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  dashboardGrid: {
    padding: 10,
  },
  widget: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  progressContainer: {
    marginVertical: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  progressText: {
    marginTop: 5,
    textAlign: "right",
  },
  goalDeadline: {
    color: "#666",
    fontSize: 12,
  },
  pomodoroStatus: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
  pomodoroTimer: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: "bold",
    marginVertical: 10,
  },
  pomodoroButton: {
    backgroundColor: "#2196f3",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  pomodoroButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  habitRow: {
    marginBottom: 15,
  },
  habitTitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  habitDays: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  habitDay: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  habitDayCompleted: {
    backgroundColor: "#4CAF50",
  },
  habitDayText: {
    fontSize: 12,
  },
  focusQuote: {
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 5,
  },
  focusAuthor: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginBottom: 15,
  },
  focusSubtitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  focusPriority: {
    fontSize: 14,
    marginVertical: 3,
  },
  widgetSelector: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  widgetOption: {
    padding: 15,
    backgroundColor: "white",
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  widgetOptionActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#2196f3",
  },
});
