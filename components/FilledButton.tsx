import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  Text,
  TextStyle,
  View,
} from "react-native";
import tw from "twrnc";

export type FilledButtonProps = PressableProps & {
  color?: string;
  textStyle?: StyleProp<TextStyle>;
  loading?: boolean;
};

const FilledButton = ({
  color = "red",
  loading = false,
  disabled,
  textStyle,
  children,
  ...props
}: FilledButtonProps) => {
  return (
    <Pressable disabled={disabled} {...props}>
      {({ pressed }) => (
        <View
          style={[
            tw`justify-center bg-${color}-600 px-3 py-2 border border-transparent rounded shadow-md`,
            pressed && tw`bg-${color}-700`,
            disabled && tw`opacity-50`,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={[
                tw`text-white text-base font-medium text-center`,
                textStyle,
              ]}
            >
              {children}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

export default FilledButton;
