import { View, Text, Pressable, Alert } from "react-native";
import { useState } from "react";
import { Student } from "@/types/types";
import { useRouter } from "expo-router";
import ThemedCard from "@/components/ThemedCard";
import ConfirmModal from "@/components/ConfirmModal";
import { Ionicons } from "@expo/vector-icons";
import { useDeleteStudent, useUpdateStudent } from "@/hooks/useStudents";
import ThemedTitle from "@/components/ThemedTitle";
import ThemedText from "@/components/ThemedText";
import AddStudent from "@/components/AddStudent";

type StudentCardProps = {
  student: Student;
  title?: boolean;
  totals?: { income: number; expenses: number; count: number };
};

function formatMoney(value: number) {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const StudentCard = ({ student, title = false, totals }: StudentCardProps) => {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const deleteStudent = useDeleteStudent();
  const updateStudent = useUpdateStudent();

  const { income, expenses } = totals ?? { income: 0, expenses: 0 };
  const transactionCount = totals?.count ?? 0;
  const profit = income - expenses;
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

  async function handleDelete() {
    try {
      await deleteStudent.mutateAsync(student.id);
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
        id: student.id,
        name: student.name,
        notes: student.notes,
        city: student.city,
        household_id: student.household_id,
        arrival_date: student.arrival_date,
        departure_date: student.departure_date,
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
    <ThemedCard className="flex-row justify-between items-center">
      <Pressable
        className="flex-1 flex-row items-center"
        onPress={() =>
          router.push({
            pathname: "/students/[id]",
            params: { id: student.id },
          })
        }
      >
        {!title && (
          <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
            <Text className="text-white font-bold">{initials}</Text>
          </View>
        )}
        <View>
          <ThemedTitle>{student.name}</ThemedTitle>
          <ThemedText>{student.city}</ThemedText>
          {!title && (
            <View className="flex-row items-center mt-1">
              <Text className="text-blue-600 text-xs">
                ↑ {formatMoney(income)}
              </Text>
              <Text className="text-neutral text-xs"> · </Text>
              <Text className="text-orange-600 text-xs">
                ↓ {formatMoney(expenses)}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
      {!title && (
        <View className="items-end ml-2">
          <Text className={`font-bold text-lg ${profitColor}`}>
            {profitSign}
            {formatMoney(Math.abs(profit))}
          </Text>
          <Text className="text-neutral text-xs">profit</Text>
          <View className="flex-row gap-4 mt-2">
            <Pressable onPress={() => setEditOpen(true)}>
              <Ionicons name="pencil" size={20} />
            </Pressable>
            <Pressable onPress={() => setConfirmOpen(true)}>
              <Ionicons name="trash-outline" size={20} />
            </Pressable>
          </View>
        </View>
      )}

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
    </ThemedCard>
  );
};

export default StudentCard;
