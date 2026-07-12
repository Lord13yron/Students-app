import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  StudentInput,
  updateStudent,
} from "@/lib/data-services";
import { Student } from "@/types/types";
import useUser from "./useUser";

export function useStudents() {
  const { user } = useUser();
  return useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
    enabled: !!user,
  });
}

export function useStudent(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => getStudentById(id),
    initialData: () =>
      queryClient
        .getQueryData<Student[]>(["students"])
        ?.find((s) => s.id === id),
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) => createStudent(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["students"] }),
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: StudentInput & { id: string }) =>
      updateStudent(id, input),
    onSuccess: (student) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students", student.id] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["students"] }),
  });
}
