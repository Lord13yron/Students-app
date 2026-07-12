import { View, Text } from "react-native";
import React from "react";

type ThemedCardProps = React.ComponentProps<typeof View> & {
  className?: string;
};

const ThemedCard = ({ className, ...props }: ThemedCardProps) => {
  return (
    <View
      className={`p-4 mx-4 my-2 bg-white border border-gray-200 rounded-lg ${className || ""}`}
      {...props}
    />
  );
};

export default ThemedCard;
