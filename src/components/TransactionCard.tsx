import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import ThemedTitle from "./ThemedTitle";
import ThemedText from "./ThemedText";
import { Profile, Student, Transaction } from "@/types/types";
import { Ionicons } from "@expo/vector-icons";
import MoneyModal, { expenseCategories, incomeCategories } from "./MoneyModal";
import ConfirmModal from "./ConfirmModal";
import { useDeleteExpense, useDeleteIncome } from "@/hooks/useExpenses";

type TransactionCardProps = {
  transaction: Transaction;
  student: Student;
  profile: Profile;
  showStudent?: boolean;
};

const TransactionCard = ({
  transaction,
  student,
  profile,
  showStudent = true,
}: TransactionCardProps) => {
  const formattedDate = new Date(transaction.created_at).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );

  const categories =
    transaction.type === "income" ? incomeCategories : expenseCategories;
  const icon = categories.find((c) => c.name === transaction.category)?.icon;
  const isIncome = transaction.type === "income";

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const deleteExpense = useDeleteExpense();
  const deleteIncome = useDeleteIncome();
  const isDeleting = deleteExpense.isPending || deleteIncome.isPending;

  async function handleDelete() {
    try {
      if (transaction.type === "income") {
        await deleteIncome.mutateAsync(transaction.id);
      } else {
        await deleteExpense.mutateAsync(transaction.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmOpen(false);
    }
  }

  return (
    <View className="flex-row items-center justify-between p-4">
      <View className="flex-row items-center justify-between gap-4">
        {icon && (
          <Ionicons
            className={`${isIncome ? "bg-blue-300" : "bg-orange-500"} rounded-full p-4`}
            name={icon}
            size={24}
          />
        )}
        <View>
          {showStudent && <ThemedTitle>{student.name}</ThemedTitle>}
          <ThemedText>{transaction.note}</ThemedText>
          <ThemedText>
            {formattedDate} - {profile.username}
          </ThemedText>
        </View>
      </View>
      <View className="items-end gap-2">
        <Text className={isIncome ? "text-blue-600" : "text-orange-600"}>
          {isIncome ? "+" : "-"}${transaction.amount.toFixed(2)}
        </Text>
        <View className="flex-row gap-4">
          <Pressable onPress={() => setEditOpen(true)}>
            <Ionicons name="pencil" size={18} />
          </Pressable>
          <Pressable onPress={() => setConfirmOpen(true)}>
            <Ionicons name="trash-outline" size={18} />
          </Pressable>
        </View>
      </View>

      {editOpen && (
        <MoneyModal
          visible={editOpen}
          onCancel={() => setEditOpen(false)}
          setMoneyModalVisible={setEditOpen}
          isEdit={true}
          transaction={transaction}
        />
      )}

      <ConfirmModal
        visible={confirmOpen}
        title="Delete transaction?"
        message="This will permanently remove this transaction."
        confirmText="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </View>
  );
};

export default TransactionCard;
