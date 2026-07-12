import { View, Text } from "react-native";
import React from "react";

type ThemedTitleProps = React.ComponentProps<typeof Text> & {
  className?: string;
};

const ThemedTitle = ({ className, ...props }: ThemedTitleProps) => {
  return (
    <Text
      className={`text-title font-bold text-lg tracking-widest ${className || ""}`}
      {...props}
    />
  );
};

export default ThemedTitle;
