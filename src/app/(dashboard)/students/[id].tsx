import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useMemo, useState } from "react";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useStudent,
  useDeleteStudent,
  useUpdateStudent,
} from "@/hooks/useStudents";
import { useExpenses, useIncome } from "@/hooks/useExpenses";
import { useProfiles } from "@/hooks/useProfiles";
import ThemedView from "@/components/ThemedView";
import ThemedCard from "@/components/ThemedCard";
import ThemedTitle from "@/components/ThemedTitle";
import ThemedText from "@/components/ThemedText";
import MonthlyTransactions from "@/components/MonthlyTransactions";
import AddStudent from "@/components/AddStudent";
import ConfirmModal from "@/components/ConfirmModal";

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(isoDate: string | null) {
  if (!isoDate) return "not set";
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const StudentDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: student } = useStudent(id);
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: income, isLoading: incomeLoading } = useIncome();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteStudent = useDeleteStudent();
  const updateStudent = useUpdateStudent();

  const studentExpenses = useMemo(
    () => (expenses ?? []).filter((e) => e.student_id === id),
    [expenses, id],
  );
  const studentIncome = useMemo(
    () => (income ?? []).filter((i) => i.student_id === id),
    [income, id],
  );

  const transactions = useMemo(() => {
    const tagged = [
      ...studentExpenses.map((e) => ({ ...e, type: "expense" as const })),
      ...studentIncome.map((i) => ({ ...i, type: "income" as const })),
    ];
    return tagged.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [studentExpenses, studentIncome]);

  const profileMap = useMemo(() => {
    if (!profiles) return {};
    return profiles.reduce(
      (acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      },
      {} as Record<string, (typeof profiles)[number]>,
    );
  }, [profiles]);

  if (!student) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const totalIncome = studentIncome.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = studentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalIncome - totalExpenses;
  const profitColor =
    profit > 0 ? "text-blue-600" : profit < 0 ? "text-orange-600" : "text-text";
  const profitSign = profit > 0 ? "+" : profit < 0 ? "-" : "";
  const initials = student.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const transactionCount = studentExpenses.length + studentIncome.length;

  async function handleDelete() {
    try {
      await deleteStudent.mutateAsync(student!.id);
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Couldn't delete student", "Please try again.");
    } finally {
      setConfirmOpen(false);
    }
  }

  async function handleArchive() {
    try {
      await updateStudent.mutateAsync({
        id: student!.id,
        name: student!.name,
        notes: student!.notes,
        city: student!.city,
        household_id: student!.household_id,
        arrival_date: student!.arrival_date,
        departure_date: student!.departure_date,
        is_active: false,
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Couldn't archive student", "Please try again.");
    } finally {
      setConfirmOpen(false);
    }
  }

  return (
    <ThemedView>
      <Tabs.Screen options={{ title: student.name }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <ThemedCard>
          <View className="flex-row justify-between items-center">
            <View className="flex-1 flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
                <Text className="text-white font-bold">{initials}</Text>
              </View>
              <View>
                <ThemedTitle>{student.name}</ThemedTitle>
                <ThemedText>{student.city}</ThemedText>
                <ThemedText className="text-xs">
                  {student.is_active ? "Active" : "Inactive"}
                </ThemedText>
              </View>
            </View>
            <View className="flex-row gap-4">
              <Pressable onPress={() => setEditOpen(true)}>
                <Ionicons name="pencil" size={20} />
              </Pressable>
              <Pressable onPress={() => setConfirmOpen(true)}>
                <Ionicons name="trash-outline" size={20} />
              </Pressable>
            </View>
          </View>
          <View className="flex-row justify-between mt-4">
            <View>
              <ThemedText className="text-xs">Arrives</ThemedText>
              <ThemedText>{formatDate(student.arrival_date)}</ThemedText>
            </View>
            <View>
              <ThemedText className="text-xs">Departs</ThemedText>
              <ThemedText>{formatDate(student.departure_date)}</ThemedText>
            </View>
          </View>
          <View className="mt-4">
            <ThemedText className="text-xs">Notes</ThemedText>
            <ThemedText className={student.notes ? "" : "italic text-neutral"}>
              {student.notes ? student.notes : "No notes yet"}
            </ThemedText>
          </View>
        </ThemedCard>

        <ThemedCard className="gap-2 p-6">
          <ThemedTitle>TOTAL PROFIT</ThemedTitle>
          <Text className={`text-4xl ${profitColor}`}>
            {profitSign}
            {formatMoney(Math.abs(profit))}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-blue-600">↑ {formatMoney(totalIncome)}</Text>
            <Text className="text-neutral"> · </Text>
            <Text className="text-orange-600">↓ {formatMoney(totalExpenses)}</Text>
          </View>
        </ThemedCard>

        <View className="mt-8">
          {expensesLoading || incomeLoading || profilesLoading ? (
            <ActivityIndicator className="self-center py-8" />
          ) : (
            <>
              <ThemedText className="p-4">Transactions</ThemedText>
              <MonthlyTransactions
                transactions={transactions}
                studentMap={{ [student.id]: student }}
                profileMap={profileMap}
                showStudent={false}
              />
            </>
          )}
        </View>
      </ScrollView>

      {editOpen && (
        <AddStudent
          setIsOpen={setEditOpen}
          visible={editOpen}
          onCancel={() => setEditOpen(false)}
          isEdit={true}
          student={student}
        />
      )}

      {transactionCount === 0 ? (
        <ConfirmModal
          visible={confirmOpen}
          title="Delete student?"
          message={`This will permanently remove ${student.name}.`}
          confirmText="Delete"
          loading={deleteStudent.isPending}
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      ) : (
        <ConfirmModal
          visible={confirmOpen}
          title="Can't delete student"
          message={`${student.name} has ${transactionCount} transaction${transactionCount === 1 ? "" : "s"}. ${
            student.is_active
              ? "Archive them instead to keep your records."
              : "Delete their transactions first to remove them."
          }`}
          confirmText="Archive Instead"
          cancelText={student.is_active ? "Cancel" : "OK"}
          loading={updateStudent.isPending}
          onConfirm={student.is_active ? handleArchive : undefined}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </ThemedView>
  );
};

export default StudentDetails;
