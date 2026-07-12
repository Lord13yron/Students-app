import { useState } from "react";
import { View, Alert } from "react-native";
import useUser from "@/hooks/useUser";
import { useUpdateProfile } from "@/hooks/useProfiles";
import { useHousehold } from "@/hooks/useHousehold";
import ThemedTitle from "@/components/ThemedTitle";
import ThemedText from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import ThemedButton from "@/components/ThemedButton";
import ThemedCard from "@/components/ThemedCard";

export default function Account() {
  const { profile, logout } = useUser();
  const { data: household } = useHousehold();
  const updateProfile = useUpdateProfile();
  const [username, setUsername] = useState(profile?.username ?? "");

  function handleUpdate() {
    if (!profile) return;
    updateProfile.mutate(
      { id: profile.id, username },
      { onError: (error) => Alert.alert(error.message) },
    );
  }

  return (
    <View>
      <View className="px-4 pt-16 pb-8">
        <ThemedTitle className="text-4xl">Settings</ThemedTitle>
        <ThemedText>Manage your account and household</ThemedText>
      </View>

      <ThemedCard className="gap-2">
        <ThemedText className="text-lg">Username</ThemedText>
        <ThemedTextInput value={username} onChangeText={setUsername} />
        <ThemedButton
          text={updateProfile.isPending ? "Updating..." : "Update"}
          press={handleUpdate}
          disabled={updateProfile.isPending}
        />
      </ThemedCard>

      {household && (
        <ThemedCard className="gap-2">
          <ThemedText className="text-lg">Household</ThemedText>
          <ThemedTitle>{household.name}</ThemedTitle>
        </ThemedCard>
      )}

      <View className="p-4">
        <ThemedButton text="Sign Out" variant="caution" press={logout} />
      </View>
    </View>
  );
}
