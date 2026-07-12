import { View, Text } from "react-native";
import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import ThemedText from "./ThemedText";
import ThemedTitle from "./ThemedTitle";
import TransactionCard from "./TransactionCard";
import EmptyState from "./EmptyState";
import { Profile, Student, Transaction } from "@/types/types";

type MonthlyTransactionsProps = {
  transactions: Transaction[];
  studentMap: Record<string, Student>;
  profileMap: Record<string, Profile>;
  showStudent?: boolean;
};

const monthKey = (isoDate: string) => {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${d.getMonth()}`;
};

const MonthlyTransactions = ({
  transactions,
  studentMap,
  profileMap,
  showStudent = true,
}: MonthlyTransactionsProps) => {
  // Distinct months that have transactions, newest first.
  // Input is already sorted desc, so deduping in order preserves that.
  const months = useMemo(() => {
    const seen = new Set<string>();
    const keys: string[] = [];
    for (const t of transactions) {
      const key = monthKey(t.created_at);
      if (!seen.has(key)) {
        seen.add(key);
        keys.push(key);
      }
    }
    return keys;
  }, [transactions]);

  const [index, setIndex] = useState(0);
  const selectedMonth = months[index];

  const monthTransactions = useMemo(
    () => transactions.filter((t) => monthKey(t.created_at) === selectedMonth),
    [transactions, selectedMonth],
  );

  const summary = useMemo(
    () =>
      monthTransactions.reduce(
        (acc, t) => {
          if (t.type === "income") acc.income += t.amount;
          else acc.expense += t.amount;
          acc.count += 1;
          return acc;
        },
        { income: 0, expense: 0, count: 0 },
      ),
    [monthTransactions],
  );

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon="receipt-outline"
        title="No transactions yet"
        subtitle={
          showStudent
            ? "Transactions from your students will show up here"
            : "Transactions for this student will show up here"
        }
      />
    );
  }

  const [year, month] = selectedMonth.split("-").map(Number);
  const label = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const net = summary.income - summary.expense;

  return (
    <View>
      <View className="flex-row items-center justify-between px-4 py-2">
        <Ionicons
          name="chevron-back"
          size={24}
          color={index === months.length - 1 ? "#CAC5CC" : undefined}
          onPress={() => index < months.length - 1 && setIndex((i) => i + 1)}
        />
        <ThemedTitle>{label}</ThemedTitle>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={index === 0 ? "#CAC5CC" : undefined}
          onPress={() => index > 0 && setIndex((i) => i - 1)}
        />
      </View>

      <View className="flex-row justify-between px-4 py-3">
        <View>
          <ThemedText>Income</ThemedText>
          <Text className="text-blue-600">+${summary.income.toFixed(2)}</Text>
        </View>
        <View>
          <ThemedText>Expenses</ThemedText>
          <Text className="text-orange-600">-${summary.expense.toFixed(2)}</Text>
        </View>
        <View>
          <ThemedText className="font-bold">Profit</ThemedText>
          <Text className={net >= 0 ? "text-blue-600" : "text-orange-600"}>
            {net >= 0 ? "+" : "-"}${Math.abs(net).toFixed(2)}
          </Text>
        </View>
        <View className="items-center justify-center w-10 h-10 rounded-full bg-primary">
          <Text className="text-white">{summary.count}</Text>
        </View>
      </View>

      {monthTransactions.map((transaction) => {
        const student = studentMap[transaction.student_id];
        const profile = profileMap[transaction.created_by];
        if (!student || !profile) return null;
        return (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            student={student}
            profile={profile}
            showStudent={showStudent}
          />
        );
      })}
    </View>
  );
};

export default MonthlyTransactions;
