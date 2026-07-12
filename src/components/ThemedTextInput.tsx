import { useId } from "react";
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ThemedTextInputProps = TextInputProps;

// iOS keypads without a return key — the only case needing a Done bar
const keyboardsWithoutReturnKey = [
  "decimal-pad",
  "number-pad",
  "numeric",
  "phone-pad",
];

const ThemedTextInput = ({
  className,
  keyboardType,
  multiline,
  ...props
}: ThemedTextInputProps) => {
  const accessoryViewID = useId();
  const needsDoneBar =
    Platform.OS === "ios" &&
    keyboardsWithoutReturnKey.includes(keyboardType ?? "");

  return (
    <>
      <TextInput
        className={`p-4 text-lg  bg-gray-50 rounded-lg ${className ?? ""}`}
        placeholderTextColor="#6B7280"
        keyboardType={keyboardType}
        multiline={multiline}
        returnKeyType={multiline ? undefined : "done"}
        inputAccessoryViewID={needsDoneBar ? accessoryViewID : undefined}
        {...props}
      />
      {needsDoneBar && (
        <InputAccessoryView nativeID={accessoryViewID}>
          <View className="flex-row justify-end bg-gray-100 border-t border-gray-200">
            <Pressable className="px-5 py-2" onPress={Keyboard.dismiss}>
              <Ionicons name="checkmark" size={24} color="#4F378A" />
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </>
  );
};

export default ThemedTextInput;
