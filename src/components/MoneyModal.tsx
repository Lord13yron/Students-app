import { useStudents } from "@/hooks/useStudents";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Text,
  Modal,
  Pressable,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import ThemedText from "./ThemedText";
import ThemedTextInput from "./ThemedTextInput";
import ThemedButton from "./ThemedButton";
import EmptyState from "./EmptyState";
import useUser from "@/hooks/useUser";
import {
  useCreateExpense,
  useCreateExpenses,
  useCreateIncome,
  useCreateIncomeEntries,
  useUpdateExpense,
  useUpdateIncome,
} from "@/hooks/useExpenses";
import { Transaction } from "@/types/types";

type MoneyModalProps = {
  visible: boolean;
  onCancel: () => void;
  setMoneyModalVisible: (moneyModalvisible: boolean) => void;
  isEdit?: boolean;
  transaction?: Transaction;
  initialStudentId?: string;
};

type Category = {
  name: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

const cleanAmount = (text: string) => {
  const [whole, ...decimals] = text.replace(/[^0-9.]/g, "").split(".");
  return decimals.length > 0
    ? whole + "." + decimals.join("").slice(0, 2)
    : whole;
};

const SPLIT_ID = "__split__";

// Splits in whole cents so the shares always sum to the entered amount;
// leftover pennies go to the first student(s).
const splitShares = (amount: number, n: number): number[] => {
  const cents = Math.round(amount * 100);
  const base = Math.floor(cents / n);
  return Array.from(
    { length: n },
    (_, i) => (base + (i < cents - base * n ? 1 : 0)) / 100,
  );
};

const formatAmount = (value: string) => {
  if (!value) return "";
  const [whole, decimal] = value.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return "$ " + withCommas + (decimal !== undefined ? "." + decimal : "");
};

export const expenseCategories: Category[] = [
  { name: "Food", icon: "fast-food-outline" },
  { name: "Activities", icon: "ticket-outline" },
  { name: "Transport", icon: "car-outline" },
  { name: "Other", icon: "apps-outline" },
];

export const incomeCategories: Category[] = [
  { name: "Monthly Deposit", icon: "calendar-number-outline" },
  { name: "Other", icon: "apps-outline" },
];

const MoneyModal = ({
  visible,
  onCancel,
  setMoneyModalVisible,
  isEdit = false,
  transaction,
  initialStudentId,
}: MoneyModalProps) => {
  const { data } = useStudents();
  const activeStudents = (data ?? []).filter((s) => s.is_active);
  const studentOptions: { id: string; name: string }[] =
    activeStudents.length >= 2
      ? [...activeStudents, { id: SPLIT_ID, name: "Split" }]
      : activeStudents;
  const [selectedStudent, setSelectedStudent] = useState<string>(
    isEdit && transaction
      ? transaction.student_id
      : initialStudentId &&
          activeStudents.some((s) => s.id === initialStudentId)
        ? initialStudentId
        : "",
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    isEdit && transaction ? transaction.category : "Food",
  );
  const [amount, setAmount] = useState<string>(
    isEdit && transaction ? transaction.amount.toString() : "",
  );
  const [note, setNote] = useState<string>(
    isEdit && transaction ? transaction.note : "",
  );
  const [expenseType, setExpenseType] = useState<"expense" | "payment">(
    isEdit && transaction?.type === "income" ? "payment" : "expense",
  );
  const [errors, setErrors] = useState<{ student?: string; amount?: string }>(
    {},
  );
  const router = useRouter();
  const { profile, householdId } = useUser();
  const createExpense = useCreateExpense();
  const createExpenses = useCreateExpenses();
  const createIncome = useCreateIncome();
  const createIncomeEntries = useCreateIncomeEntries();
  const updateExpense = useUpdateExpense();
  const updateIncome = useUpdateIncome();
  const loading =
    createExpense.isPending ||
    createExpenses.isPending ||
    createIncome.isPending ||
    createIncomeEntries.isPending ||
    updateExpense.isPending ||
    updateIncome.isPending;

  const validate = () => {
    const newErrors: { student?: string; amount?: string } = {};
    if (!isEdit && !selectedStudent) newErrors.student = "Select a student";
    if (!(parseFloat(amount) > 0)) newErrors.amount = "Enter an amount";
    setErrors(newErrors);
    return !newErrors.student && !newErrors.amount;
  };

  const handleSubmitExpense = async () => {
    if (!validate()) return;
    if (!householdId || !selectedCategory || !profile) return;

    if (selectedStudent === SPLIT_ID) {
      const shares = splitShares(
        parseFloat(amount) || 0,
        activeStudents.length,
      );
      await createExpenses.mutateAsync(
        activeStudents.map((student, i) => ({
          household_id: householdId,
          student_id: student.id,
          amount: shares[i],
          category: selectedCategory,
          note,
          created_by: profile.id,
        })),
      );
    } else {
      const newExpense = {
        household_id: householdId,
        student_id: selectedStudent,
        amount: parseFloat(amount) || 0,
        category: selectedCategory,
        note,
        created_by: profile?.id,
      };

      await createExpense.mutateAsync(newExpense);
    }
    console.log("expense submitted");

    setMoneyModalVisible(false);
    setSelectedStudent("");
    setSelectedCategory("Food");
    setAmount("");
    setNote("");
    setErrors({});
  };

  const handleSubmitPayment = async () => {
    if (!validate()) return;
    if (!householdId || !profile) return;

    if (selectedStudent === SPLIT_ID) {
      const shares = splitShares(
        parseFloat(amount) || 0,
        activeStudents.length,
      );
      await createIncomeEntries.mutateAsync(
        activeStudents.map((student, i) => ({
          household_id: householdId,
          student_id: student.id,
          amount: shares[i],
          created_by: profile.id,
          note,
          category: selectedCategory,
        })),
      );
    } else {
      const newIncome = {
        household_id: householdId,
        student_id: selectedStudent,
        amount: parseFloat(amount) || 0,
        created_by: profile?.id,
        note,
        category: selectedCategory,
      };

      await createIncome.mutateAsync(newIncome);
    }
    console.log("income submitted");

    setMoneyModalVisible(false);
    setSelectedStudent("");
    setSelectedCategory("Food");
    setAmount("");
    setNote("");
    setErrors({});
  };

  const handleSubmitEdit = async () => {
    if (!validate()) return;
    if (!transaction || !selectedCategory) return;

    const fields = {
      id: transaction.id,
      amount: parseFloat(amount) || 0,
      category: selectedCategory,
      note,
    };

    if (transaction.type === "income") {
      await updateIncome.mutateAsync(fields);
    } else {
      await updateExpense.mutateAsync(fields);
    }

    setMoneyModalVisible(false);
    setErrors({});
  };

  const handleCancel = () => {
    setErrors({});
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable
          className="items-center justify-center flex-1 px-8 bg-black/50"
          onPress={Keyboard.dismiss}
        >
          <View className="w-full max-h-full overflow-hidden rounded-lg bg-card">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-400">
              <ThemedText>
                {isEdit ? "Edit Transaction" : "Record Transaction"}
              </ThemedText>
              <Ionicons name="close" size={24} onPress={handleCancel} />
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
            >
              {!isEdit && activeStudents.length === 0 ? (
                <>
                  <EmptyState
                    icon="people-outline"
                    title="No Active Students"
                    subtitle="There are no active students. Add a student before adding a transaction."
                  />
                  <View className="flex-row justify-center gap-3 px-4 py-6 mt-6 bg-gray-50">
                    <ThemedButton
                      text="Close"
                      press={handleCancel}
                      variant="transparent"
                    />
                    <ThemedButton
                      text="Add Student"
                      press={() => {
                        setMoneyModalVisible(false);
                        router.push("/students");
                      }}
                    />
                  </View>
                </>
              ) : (
                <>
                  {!isEdit && (
                    <View className="flex-row items-center justify-center gap-2 p-1 mx-4 my-6 bg-gray-100 rounded-lg">
                      <Pressable
                        onPress={() => setExpenseType("expense")}
                        className="flex-1"
                      >
                        <View
                          className={`p-2  rounded-lg ${expenseType === "expense" ? "bg-white" : ""}`}
                        >
                          <Text
                            className={`text-sm text-center ${expenseType === "expense" && "text-primary"}`}
                          >
                            Add Expense
                          </Text>
                        </View>
                      </Pressable>
                      <Pressable
                        onPress={() => setExpenseType("payment")}
                        className="flex-1"
                      >
                        <View
                          className={`p-2  rounded-lg ${expenseType === "payment" ? "bg-white" : ""}`}
                        >
                          <Text
                            className={`text-sm text-center ${expenseType === "payment" && "text-primary"}`}
                          >
                            Record Payment
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  )}

                  {!isEdit && (
                    <View className="px-4 py-6">
                      <ThemedText>Select Student</ThemedText>
                      <View className="flex-row flex-wrap">
                        {studentOptions.map((item) => (
                          <Pressable
                            key={item.id}
                            onPress={() => {
                              setSelectedStudent(item.id);
                              setErrors((e) => ({ ...e, student: undefined }));
                            }}
                          >
                            <View className="items-center justify-center gap-2 my-3 mr-3">
                              <Ionicons
                                className={`p-5 rounded-full ${selectedStudent === item.id ? "bg-primary" : "bg-gray-100"}`}
                                name={
                                  item.id === SPLIT_ID
                                    ? "people-outline"
                                    : "person-outline"
                                }
                                size={20}
                                color={`${selectedStudent === item.id ? "white" : "#CAC5CC"}`}
                              />
                              <Text>{item.name}</Text>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                      {errors.student && (
                        <Text className="text-sm text-red-500">
                          {errors.student}
                        </Text>
                      )}
                    </View>
                  )}

                  <View className="px-4">
                    <ThemedText>Category</ThemedText>
                    <View className="flex-row flex-wrap gap-3 mt-4">
                      {expenseType === "payment" &&
                        incomeCategories.map((item) => (
                          <Pressable
                            key={item.name}
                            onPress={() => setSelectedCategory(item.name)}
                          >
                            <View
                              className={`flex-row items-center gap-2 px-5 py-2 rounded-full border border-gray-200 ${
                                selectedCategory === item.name
                                  ? "bg-primary"
                                  : "bg-gray-50"
                              }`}
                            >
                              <Ionicons
                                name={item.icon}
                                size={20}
                                color={
                                  selectedCategory === item.name
                                    ? "white"
                                    : "#CAC5CC"
                                }
                              />
                              <Text
                                className={`text-sm
                        ${selectedCategory === item.name ? "text-white" : ""}
                      `}
                              >
                                {item.name}
                              </Text>
                            </View>
                          </Pressable>
                        ))}
                      {expenseType === "expense" &&
                        expenseCategories.map((item) => (
                          <Pressable
                            key={item.name}
                            onPress={() => setSelectedCategory(item.name)}
                          >
                            <View
                              className={`flex-row items-center gap-2 px-5 py-2 rounded-full border border-gray-200 ${
                                selectedCategory === item.name
                                  ? "bg-primary"
                                  : "bg-gray-50"
                              }`}
                            >
                              <Ionicons
                                name={item.icon}
                                size={20}
                                color={
                                  selectedCategory === item.name
                                    ? "white"
                                    : "#CAC5CC"
                                }
                              />
                              <Text
                                className={`text-sm
                        ${selectedCategory === item.name ? "text-white" : ""}
                      `}
                              >
                                {item.name}
                              </Text>
                            </View>
                          </Pressable>
                        ))}
                    </View>
                  </View>

                  <ThemedText className="px-4 py-6">Amount</ThemedText>
                  <ThemedTextInput
                    className="px-6 mx-4 "
                    placeholder="$ 0.00"
                    keyboardType="decimal-pad"
                    value={formatAmount(amount)}
                    onChangeText={(text) => {
                      setAmount(cleanAmount(text));
                      setErrors((e) => ({ ...e, amount: undefined }));
                    }}
                  />
                  {errors.amount && (
                    <Text className="px-4 mt-2 text-sm text-red-500">
                      {errors.amount}
                    </Text>
                  )}
                  {selectedStudent === SPLIT_ID && parseFloat(amount) > 0 && (
                    <Text className="px-4 mt-2 text-sm text-gray-500">
                      {`Splits across ${activeStudents.length} students: ${splitShares(
                        parseFloat(amount),
                        activeStudents.length,
                      )
                        .map((share) => formatAmount(share.toFixed(2)))
                        .join(", ")}`}
                    </Text>
                  )}

                  <ThemedText className="px-4 py-6">Description</ThemedText>
                  <ThemedTextInput
                    value={note}
                    onChangeText={setNote}
                    className="px-6 mx-4 "
                    placeholder="e.g Groceries, Hockey game, etc."
                  />

                  <View className="flex-row justify-center gap-3 px-4 py-6 mt-6 bg-gray-50">
                    <ThemedButton
                      text="Cancel"
                      press={handleCancel}
                      disabled={loading}
                      variant="transparent"
                    />
                    <ThemedButton
                      text={loading ? "Saving..." : "Save Transaction"}
                      press={
                        isEdit
                          ? handleSubmitEdit
                          : expenseType === "expense"
                            ? handleSubmitExpense
                            : handleSubmitPayment
                      }
                      disabled={loading}
                    />
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default MoneyModal;
