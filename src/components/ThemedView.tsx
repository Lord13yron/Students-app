import { View, Text } from "react-native";
import React from "react";

type ThemedViewProps = React.ComponentProps<typeof View> & {
  className?: string;
};

const ThemedView = ({ className, ...props }: ThemedViewProps) => {
  return (
    <View className={`flex-1 bg-background ${className || ""}`} {...props} />
  );
};

export default ThemedView;
