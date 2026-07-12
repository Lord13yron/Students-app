import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useUser, { getProfiles } from "./useUser";
import { updateProfile } from "@/lib/data-services";

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { refreshProfile } = useUser();
  return useMutation({
    mutationFn: ({ id, username }: { id: string; username: string }) =>
      updateProfile(id, username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      refreshProfile();
    },
  });
}
