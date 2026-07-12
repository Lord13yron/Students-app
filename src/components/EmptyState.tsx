import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
};

const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => (
  <View className="items-center gap-2 px-4 py-12">
    <Ionicons name={icon} size={48} color="#79767D" />
    <Text className="font-bold text-title tracking-widest">{title}</Text>
    {subtitle && (
      <Text className="text-center text-neutral tracking-widest">
        {subtitle}
      </Text>
    )}
  </View>
);

export default EmptyState;
