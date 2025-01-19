import formatTime from "@/constants/FormatTime";
import React from "react";
import { View, Text, Dimensions } from "react-native";

export const CourseCard = React.memo(({ course }) => {
  const { width } = Dimensions.get("window");

  return (
    <View
      style={{
        backgroundColor: "#8B0000",
        alignItems: "flex-start",
        padding: 20,
        borderRadius: 15,
        margin: 6,
        marginHorizontal: 40,
      }}
    >
      <Text style={{ color: "#fff" }}>{course.getName()}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {course.getStartTime() !== undefined &&
          course.getEndTime() !== undefined && (
            <Text style={{ color: "#fff" }}>
              {formatTime(course.getStartTime())} -{" "}
              {formatTime(course.getEndTime())}
            </Text>
          )}
        <Text style={{ color: "#fff" }}>
          {course.getTeacherName()?.replace(/,/g, "").trim().split(/\s+/)[0]}
        </Text>
        {course.getRoom() !== undefined && course.getRoom() !== "" && (
          <Text style={{ color: "#fff" }}> • RM: {course.getRoom()}</Text>
        )}
      </View>
    </View>
  );
});
