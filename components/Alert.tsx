import { Ionicons } from "@expo/vector-icons";
import React, { PropsWithChildren } from "react";
import { Text, View, ViewProps } from "react-native";
import tw from "twrnc";

type Status = "success" | "info" | "warning" | "error";

const STATUSES: {
  [key in Status]: [string, keyof typeof Ionicons.glyphMap];
} = {
  success: ["green", "checkmark"],
  info: ["red", "information-circle"], // Changed to red and information-circle
  warning: ["yellow", "warning"],
  error: ["red", "warning"],
};

export type AlertProps = PropsWithChildren<ViewProps> & {
  title: string;
  description: string;
  status?: keyof typeof STATUSES;
};

const Alert = ({
  title,
  description,
  status = "success",
  style,
  children,
  ...props
}: AlertProps) => {
  const [color, icon] = STATUSES[status];

  return (
    <View
      style={[
        tw`border-l-4 p-4 rounded-md bg-${color}-100 border-${color}-500`,
        style,
      ]}
      {...props}
    >
      <View style={tw`flex-row items-center`}>
        <Ionicons name={icon} style={tw`text-xl text-${color}-500 mr-2`} />
        <Text style={tw`text-base font-medium text-${color}-800`}>
          {title}
        </Text>
      </View>
      <Text style={tw`text-sm text-${color}-700 mt-1 ml-6`}>
        {description}
      </Text>
      {children && <View style={tw`mt-2`}>{children}</View>}
    </View>
  );
};

export default Alert;
