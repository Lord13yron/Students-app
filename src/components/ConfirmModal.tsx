import { View, Text, Pressable, Modal } from "react-native";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
};

const ConfirmModal = ({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="items-center justify-center flex-1 px-8 bg-black/50"
        onPress={onCancel}
      >
        <Pressable className="w-full p-6 rounded-lg bg-card" onPress={() => {}}>
          <Text className="text-xl font-bold text-title">{title}</Text>
          {message && <Text className="mt-2 text-text">{message}</Text>}

          <View className="flex-row justify-end gap-3 mt-6">
            <Pressable
              className="px-6 py-3 rounded-full"
              onPress={onCancel}
              disabled={loading}
            >
              <Text className="font-bold text-text">{cancelText}</Text>
            </Pressable>
            {onConfirm && (
              <Pressable
                className="px-6 py-3 rounded-full bg-danger"
                onPress={onConfirm}
                disabled={loading}
              >
                <Text className="font-bold text-white">
                  {loading ? "..." : confirmText}
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ConfirmModal;
