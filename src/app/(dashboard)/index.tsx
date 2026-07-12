import { Link } from "expo-router";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import useUser from "@/hooks/useUser";
import ThemedView from "@/components/ThemedView";
import ThemedTitle from "@/components/ThemedTitle";
import { Ionicons } from "@expo/vector-icons";
import ThemedCard from "@/components/ThemedCard";
import ThemedText from "@/components/ThemedText";
import { useStudents } from "@/hooks/useStudents";
import { useMemo } from "react";
import { useExpenses, useIncome } from "@/hooks/useExpenses";
import TransactionCard from "@/components/TransactionCard";
import EmptyState from "@/components/EmptyState";
import { useProfiles } from "@/hooks/useProfiles";
import StudentCard from "@/components/StudentCard";

export default function Index() {
  const { profile } = useUser();
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const activeStudents = useMemo(
    () => (students ?? []).filter((s) => s.is_active),
    [students],
  );
  const activeIds = useMemo(
    () => new Set(activeStudents.map((s) => s.id)),
    [activeStudents],
  );
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: income, isLoading: incomeLoading } = useIncome();

  const transactions = useMemo(() => {
    const tagged = [
      ...(expenses ?? []).map((e) => ({ ...e, type: "expense" as const })),
      ...(income ?? []).map((i) => ({ ...i, type: "income" as const })),
    ];
    return tagged
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 10);
  }, [expenses, income]);

  const totalIncome = (income ?? [])
    .filter((i) => activeIds.has(i.student_id))
    .reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = (expenses ?? [])
    .filter((e) => activeIds.has(e.student_id))
    .reduce((sum, e) => sum + e.amount, 0);
  const totalProfit = totalIncome - totalExpenses;

  const studentMap = useMemo(() => {
    if (!students) return {};

    return students.reduce(
      (acc, student) => {
        acc[student.id] = student;
        return acc;
      },
      {} as Record<string, (typeof students)[number]>,
    );
  }, [students]);

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

  return (
    <ThemedView className="relative">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="mt-8 mb-4">
          <Link href="/login">
            <Text className="text-3xl text-center text-primary">
              {profile ? `Welcome, ${profile.username}` : "Login"}
            </Text>
          </Link>
        </View>
        <ThemedCard className="gap-2 p-6">
          <ThemedTitle className="">TOTAL PROFIT</ThemedTitle>
          <Text
            className={`mb-2 text-4xl ${totalProfit >= 0 ? "text-blue-600" : "text-orange-600"}`}
          >
            ${totalProfit.toFixed(2)}
          </Text>
          <ThemedText>Calculated for the current students</ThemedText>
        </ThemedCard>
        <View className="flex-row gap-2 p-4 m-4 rounded-lg bg-light">
          <View className="gap-3 p-4 rounded-lg ">
            <Ionicons name="people-outline" size={35} />
            <ThemedText className="text-lg">Active Students</ThemedText>
            <ThemedText className="text-3xl">
              {activeStudents.length}
            </ThemedText>
          </View>
          {students && (
            <View className="flex-1">
              {activeStudents.map((student) => (
                <StudentCard key={student.id} student={student} title={true} />
              ))}
            </View>
          )}
        </View>

        <View className="flex-row justify-between p-4">
          <ThemedText>Recent Transactions</ThemedText>
        </View>
        <View>
          {expensesLoading ||
          incomeLoading ||
          studentsLoading ||
          profilesLoading ? (
            <ActivityIndicator className="self-center py-8" />
          ) : transactions.length > 0 ? (
            transactions.map((transaction) => {
              const student = studentMap[transaction.student_id];
              const profile = profileMap[transaction.created_by];
              if (!student || !profile) return null;
              return (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  student={student}
                  profile={profile}
                />
              );
            })
          ) : (
            <EmptyState
              icon="receipt-outline"
              title="No transactions yet"
              subtitle="Tap Add Transaction to add your first one"
            />
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
