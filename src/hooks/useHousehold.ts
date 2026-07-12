import { useQuery } from "@tanstack/react-query";
import { getHousehold } from "@/lib/data-services";
import useUser from "./useUser";

export function useHousehold() {
  const { householdId } = useUser();
  return useQuery({
    queryKey: ["household", householdId],
    queryFn: () => getHousehold(householdId!),
    enabled: !!householdId,
  });
}
