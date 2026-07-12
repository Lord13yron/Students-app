import AddStudent from "@/components/AddStudent";
import EmptyState from "@/components/EmptyState";
import MonthlyTransactions from "@/components/MonthlyTransactions";
import StudentCard from "@/components/StudentCard";
import ThemedButton from "@/components/ThemedButton";
import ThemedText from "@/components/ThemedText";
import ThemedTitle from "@/components/ThemedTitle";
import ThemedView from "@/components/ThemedView";
import { useExpenses, useIncome } from "@/hooks/useExpenses";
import { useProfiles } from "@/hooks/useProfiles";
import { useStudents } from "@/hooks/useStudents";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

const students = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inactiveOpen, setInactiveOpen] = useState(false);
  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const activeStudents = (students ?? []).filter((s) => s.is_active);
  const inactiveStudents = (students ?? []).filter((s) => !s.is_active);
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: income, isLoading: incomeLoading } = useIncome();

  const transactions = useMemo(() => {
    const tagged = [
      ...(expenses ?? []).map((e) => ({ ...e, type: "expense" as const })),
      ...(income ?? []).map((i) => ({ ...i, type: "income" as const })),
    ];
    return tagged.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [expenses, income]);

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

  const totalsByStudent = useMemo(() => {
    const map: Record<
      string,
      { income: number; expenses: number; count: number }
    > = {};
    for (const entry of income ?? []) {
      if (!entry.student_id) continue;
      map[entry.student_id] ??= { income: 0, expenses: 0, count: 0 };
      map[entry.student_id].income += entry.amount;
      map[entry.student_id].count += 1;
    }
    for (const expense of expenses ?? []) {
      if (!expense.student_id) continue;
      map[expense.student_id] ??= { income: 0, expenses: 0, count: 0 };
      map[expense.student_id].expenses += expense.amount;
      map[expense.student_id].count += 1;
    }
    return map;
  }, [income, expenses]);

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
    <ThemedView>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="flex-row justify-between gap-1 px-4 pt-16 pb-8">
          <View>
            <ThemedTitle className="text-4xl">Active Students</ThemedTitle>

            <ThemedText>Click on a student to view details</ThemedText>
          </View>
          <ThemedButton
            text="Add"
            icon="person-add-outline"
            press={() => setIsOpen(!isOpen)}
          />
        </View>
        {isOpen && (
          <AddStudent
            setIsOpen={setIsOpen}
            visible={isOpen}
            onCancel={() => setIsOpen(false)}
          />
        )}

        {!studentsLoading && activeStudents.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No students yet"
            subtitle="Tap Add to create your first student"
          />
        ) : (
          activeStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              totals={totalsByStudent[student.id]}
            />
          ))
        )}

        {inactiveStudents.length > 0 && (
          <View className="mt-8">
            <Pressable
              className="flex-row items-center gap-2 px-4"
              onPress={() => setInactiveOpen((open) => !open)}
            >
              <ThemedTitle className="text-2xl">Past Students</ThemedTitle>
              <View className="h-7 min-w-7 items-center justify-center rounded-full bg-primary px-2">
                <ThemedText className="text-sm font-semibold text-white">
                  {inactiveStudents.length}
                </ThemedText>
              </View>
              <Ionicons
                name={inactiveOpen ? "chevron-down" : "chevron-forward"}
                size={24}
              />
            </Pressable>
            {inactiveOpen &&
              inactiveStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  totals={totalsByStudent[student.id]}
                />
              ))}
          </View>
        )}

        <View className="mt-8">
          {expensesLoading ||
          incomeLoading ||
          studentsLoading ||
          profilesLoading ? (
            <ActivityIndicator className="self-center py-8" />
          ) : (
            <>
              <ThemedText className="p-4">All Transactions</ThemedText>
              <MonthlyTransactions
                transactions={transactions}
                studentMap={studentMap}
                profileMap={profileMap}
              />
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

export default students;
