import { View, Text, ScrollView, ActivityIndicator, useWindowDimensions } from "react-native";
import { useMemo } from "react";
import { BarChart, PieChart } from "react-native-gifted-charts";
import ThemedView from "@/components/ThemedView";
import ThemedCard from "@/components/ThemedCard";
import ThemedTitle from "@/components/ThemedTitle";
import ThemedText from "@/components/ThemedText";
import StudentCard from "@/components/StudentCard";
import { useStudents } from "@/hooks/useStudents";
import { useExpenses, useIncome } from "@/hooks/useExpenses";
import { expenseCategories } from "@/components/MoneyModal";

const INCOME_COLOR = "#2563EB"; // blue-600 (colorblind-safe pair)
const EXPENSE_COLOR = "#EA580C"; // orange-600 (colorblind-safe pair)
const CATEGORY_COLORS = ["#4F378A", "#C9A74D", "#7C7296", "#79767D"]; // primary, tertiary, secondary, neutral

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const monthKey = (isoDate: string) => {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${d.getMonth()}`;
};

const Reports = () => {
  const { width } = useWindowDimensions();
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: income, isLoading: incomeLoading } = useIncome();

  const activeStudents = useMemo(
    () => (students ?? []).filter((s) => s.is_active),
    [students],
  );

  const activeIds = useMemo(
    () => new Set(activeStudents.map((s) => s.id)),
    [activeStudents],
  );

  const activeExpenses = useMemo(
    () => (expenses ?? []).filter((e) => activeIds.has(e.student_id)),
    [expenses, activeIds],
  );

  const activeIncome = useMemo(
    () => (income ?? []).filter((i) => activeIds.has(i.student_id)),
    [income, activeIds],
  );

  // Grouped bars for the trailing 6 calendar months (oldest -> newest).
  const barData = useMemo(() => {
    const now = new Date();
    const buckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-US", { month: "short" }),
        income: 0,
        expense: 0,
      };
    });
    const byKey = new Map(buckets.map((b) => [b.key, b]));
    for (const i of activeIncome) {
      const b = byKey.get(monthKey(i.created_at));
      if (b) b.income += i.amount;
    }
    for (const e of activeExpenses) {
      const b = byKey.get(monthKey(e.created_at));
      if (b) b.expense += e.amount;
    }
    return buckets.flatMap((b) => [
      { value: b.income, label: b.label, spacing: 4, labelWidth: 40, frontColor: INCOME_COLOR },
      { value: b.expense, frontColor: EXPENSE_COLOR },
    ]);
  }, [activeIncome, activeExpenses]);

  // Expenses grouped by category for the pie chart.
  const pieData = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of activeExpenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    }
    return expenseCategories
      .map((c, i) => ({
        name: c.name,
        value: totals.get(c.name) ?? 0,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
      }))
      .filter((d) => d.value > 0);
  }, [activeExpenses]);

  const totalPieExpense = useMemo(
    () => pieData.reduce((sum, d) => sum + d.value, 0),
    [pieData],
  );

  // Per-student income/expense totals.
  const studentTotals = useMemo(() => {
    const map = new Map<
      string,
      { income: number; expenses: number; count: number }
    >();
    for (const s of activeStudents)
      map.set(s.id, { income: 0, expenses: 0, count: 0 });
    for (const i of activeIncome) {
      const t = map.get(i.student_id);
      if (t) {
        t.income += i.amount;
        t.count += 1;
      }
    }
    for (const e of activeExpenses) {
      const t = map.get(e.student_id);
      if (t) {
        t.expenses += e.amount;
        t.count += 1;
      }
    }
    return map;
  }, [activeStudents, activeIncome, activeExpenses]);

  const combined = useMemo(() => {
    let inc = 0;
    let exp = 0;
    studentTotals.forEach((t) => {
      inc += t.income;
      exp += t.expenses;
    });
    return { income: inc, expenses: exp, net: inc - exp };
  }, [studentTotals]);

  if (studentsLoading || expensesLoading || incomeLoading) {
    return (
      <ThemedView className="justify-center">
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (activeStudents.length === 0) {
    return (
      <ThemedView className="justify-center items-center">
        <ThemedText>No active students yet.</ThemedText>
      </ThemedView>
    );
  }

  const chartWidth = width - 96; // account for card + page horizontal padding
  const netColor = combined.net >= 0 ? "text-blue-600" : "text-orange-600";

  return (
    <ThemedView>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Monthly income vs. expenses */}
        <ThemedCard className="gap-4">
          <ThemedTitle>MONTHLY INCOME VS. EXPENSES</ThemedTitle>
          <View className="flex-row gap-4">
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: INCOME_COLOR }} />
              <ThemedText className="text-xs">Income</ThemedText>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: EXPENSE_COLOR }} />
              <ThemedText className="text-xs">Expenses</ThemedText>
            </View>
          </View>
          <BarChart
            data={barData}
            barWidth={14}
            spacing={28}
            roundedTop
            noOfSections={4}
            yAxisThickness={0}
            xAxisThickness={0}
            width={chartWidth}
            isAnimated
            scrollToEnd
            yAxisTextStyle={{ color: "#79767D", fontSize: 10 }}
            xAxisLabelTextStyle={{ color: "#79767D", fontSize: 10 }}
          />
        </ThemedCard>

        {/* Expenses by category */}
        <ThemedCard className="gap-4 items-center">
          <ThemedTitle className="self-start">EXPENSES BY CATEGORY</ThemedTitle>
          {pieData.length === 0 ? (
            <ThemedText className="py-6">No expenses recorded yet.</ThemedText>
          ) : (
            <>
              <PieChart data={pieData} radius={chartWidth / 3} donut innerRadius={chartWidth / 6} />
              <View className="self-stretch gap-2">
                {pieData.map((d) => (
                  <View key={d.name} className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                      <ThemedText>{d.name}</ThemedText>
                    </View>
                    <ThemedText className="text-neutral">
                      {formatMoney(d.value)} · {Math.round((d.value / totalPieExpense) * 100)}%
                    </ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}
        </ThemedCard>

        {/* Per-student breakdown */}
        <ThemedTitle className="px-4 pt-4 pb-2">STUDENTS</ThemedTitle>
        {activeStudents.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            totals={
              studentTotals.get(student.id) ?? {
                income: 0,
                expenses: 0,
                count: 0,
              }
            }
          />
        ))}

        {/* Combined total */}
        <ThemedCard className="gap-2 p-6">
          <ThemedTitle>COMBINED TOTAL</ThemedTitle>
          <Text className={`text-4xl ${netColor}`}>
            {combined.net >= 0 ? "+" : "-"}
            {formatMoney(Math.abs(combined.net))}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-blue-600">↑ {formatMoney(combined.income)}</Text>
            <Text className="text-neutral"> · </Text>
            <Text className="text-orange-600">↓ {formatMoney(combined.expenses)}</Text>
          </View>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  );
};

export default Reports;
