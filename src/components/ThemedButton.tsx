import { View, Text, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

type ButtonVariant = "primary" | "caution" | "transparent";

type ThemedButtonProps = {
  text: string;
  icon?: keyof typeof Ionicons.glyphMap;
  press: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
};

const variants = {
  primary: {
    button: "bg-primary",
    text: "text-white",
  },
  caution: {
    button: "bg-red-500",
    text: "text-white",
  },
  transparent: {
    button: "bg-transparent border border-primary/20",
    text: "text-primary",
  },
};

const ThemedButton = ({
  text,
  icon,
  press,
  disabled = false,
  variant = "primary",
}: ThemedButtonProps) => {
  const style = variants[variant];

  return (
    <Pressable
      className={`flex-row items-center justify-center gap-2 px-6 py-3 rounded-lg ${
        style.button
      } ${disabled ? "opacity-50" : ""}`}
      onPress={() => press()}
      disabled={disabled}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={variant === "transparent" ? "#2563EB" : "white"}
        />
      )}
      <Text className={`text-lg font-bold ${style.text}`}>{text}</Text>
    </Pressable>
  );
};

export default ThemedButton;
