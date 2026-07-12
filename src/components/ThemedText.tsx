import { View, Text } from "react-native";
import React from "react";

type ThemedTextProps = React.ComponentProps<typeof Text> & {
  className?: string;
};

const ThemedText = ({ className, ...props }: ThemedTextProps) => {
  return (
    <Text
      className={`text-text tracking-widest ${className || ""}`}
      {...props}
    />
  );
};

export default ThemedText;
