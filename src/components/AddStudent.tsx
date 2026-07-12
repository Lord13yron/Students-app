import { View, Text, Pressable, Modal, Switch, Keyboard } from "react-native";
import React, { useState } from "react";
import { useCreateStudent, useUpdateStudent } from "@/hooks/useStudents";
import useUser from "@/hooks/useUser";
import { Student } from "@/types/types";
import ThemedTitle from "@/components/ThemedTitle";
import ThemedButton from "@/components/ThemedButton";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import ThemedTextInput from "./ThemedTextInput";

type AddStudentProps = {
  setIsOpen: (isOpen: boolean) => void;
  visible: boolean;
  onCancel: () => void;
  isEdit?: boolean;
  student?: Student;
};

const AddStudent = ({
  setIsOpen,
  visible,
  onCancel,
  isEdit = false,
  student,
}: AddStudentProps) => {
  const [name, setName] = useState(isEdit && student ? student.name : "");
  const [notes, setNotes] = useState(isEdit && student ? student.notes : "");
  const [city, setCity] = useState(isEdit && student ? student.city : "");
  const [arrivalDate, setArrivalDate] = useState(
    isEdit && student ? new Date(student.arrival_date) : new Date(),
  );
  const [departureDate, setDepartureDate] = useState(
    isEdit && student ? new Date(student.departure_date) : new Date(),
  );
  const [showArrivalPicker, setShowArrivalPicker] = useState(false);
  const [showDeparturePicker, setShowDeparturePicker] = useState(false);
  // The iOS inline picker has a fixed intrinsic size (~330pt) that ignores
  // layout width, so measure and scale it down to fit the modal card.
  const [availableWidth, setAvailableWidth] = useState(0);
  const [pickerSize, setPickerSize] = useState({ width: 0, height: 0 });
  const pickerScale =
    availableWidth && pickerSize.width
      ? Math.min(1, availableWidth / pickerSize.width)
      : 1;
  const pickerMargin = -(pickerSize.height * (1 - pickerScale)) / 2;
  const [isActive, setIsActive] = useState(
    isEdit && student ? student.is_active : true,
  );
  const [errors, setErrors] = useState<{ name?: string; city?: string }>({});
  const { householdId } = useUser();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const loading = createStudent.isPending || updateStudent.isPending;

  const validate = () => {
    const newErrors: { name?: string; city?: string } = {};
    if (!name.trim()) newErrors.name = "Enter a name";
    if (!city.trim()) newErrors.city = "Enter a city";
    setErrors(newErrors);
    return !newErrors.name && !newErrors.city;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const fields = {
      name,
      notes,
      city,
      household_id: householdId,
      arrival_date: arrivalDate.toISOString(),
      departure_date: departureDate.toISOString(),
      is_active: isActive,
    };

    if (isEdit && student) {
      await updateStudent.mutateAsync({ id: student.id, ...fields });
    } else {
      await createStudent.mutateAsync(fields);
    }

    setIsOpen(false);
    setName("");
    setNotes("");
    setCity("");
    setArrivalDate(new Date());
    setDepartureDate(new Date());
    setErrors({});
  };

  const handleCancel = () => {
    setErrors({});
    onCancel();
  };

  const handleArrivalChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (selectedDate) {
      setArrivalDate(selectedDate);
      // keep departure valid if arrival moves past it
      if (selectedDate > departureDate) {
        setDepartureDate(selectedDate);
      }
    }
  };

  const handleDepartureChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (selectedDate) {
      setDepartureDate(selectedDate);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Pressable
        className="items-center justify-center flex-1 px-8 bg-black/50"
        onPress={Keyboard.dismiss}
      >
        <View className="w-full gap-2 p-6 rounded-lg bg-card">
          <ThemedTitle className="text-2xl">
            {isEdit && student
              ? `Edit Student ${student.name}`
              : "Add new student"}
          </ThemedTitle>
          <ThemedTextInput
            placeholder="Student Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors((e) => ({ ...e, name: undefined }));
            }}
          />
          {errors.name && (
            <Text className="text-sm text-red-500">{errors.name}</Text>
          )}
          <ThemedTextInput
            placeholder="City, Country"
            value={city}
            onChangeText={(text) => {
              setCity(text);
              setErrors((e) => ({ ...e, city: undefined }));
            }}
          />
          {errors.city && (
            <Text className="text-sm text-red-500">{errors.city}</Text>
          )}
          <ThemedTextInput
            className="h-24"
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline={true}
          />

          <Pressable
            className="p-3 border border-gray-300 rounded-lg"
            onPress={() => setShowArrivalPicker(true)}
            onLayout={(e) => setAvailableWidth(e.nativeEvent.layout.width)}
          >
            <Text>Arrival: {arrivalDate.toLocaleDateString()}</Text>
          </Pressable>
          {showArrivalPicker && (
            <>
              <View className="flex-row justify-center">
                <View
                  onLayout={(e) =>
                    setPickerSize({
                      width: e.nativeEvent.layout.width,
                      height: e.nativeEvent.layout.height,
                    })
                  }
                  style={{
                    transform: [{ scale: pickerScale }],
                    marginVertical: pickerMargin,
                  }}
                >
                  <DateTimePicker
                    value={arrivalDate}
                    mode="date"
                    display="spinner"
                    onChange={handleArrivalChange}
                    themeVariant="light"
                  />
                </View>
              </View>
              <ThemedButton
                text="Confirm arrival"
                variant="transparent"
                press={() => setShowArrivalPicker(false)}
              />
            </>
          )}
          <Pressable
            className="p-3 border border-gray-300 rounded-lg"
            onPress={() => setShowDeparturePicker(true)}
          >
            <Text>Departure: {departureDate.toLocaleDateString()}</Text>
          </Pressable>
          {showDeparturePicker && (
            <>
              <View className="flex-row justify-center">
                <View
                  onLayout={(e) =>
                    setPickerSize({
                      width: e.nativeEvent.layout.width,
                      height: e.nativeEvent.layout.height,
                    })
                  }
                  style={{
                    transform: [{ scale: pickerScale }],
                    marginVertical: pickerMargin,
                  }}
                >
                  <DateTimePicker
                    value={departureDate}
                    mode="date"
                    display="spinner"
                    minimumDate={arrivalDate}
                    onChange={handleDepartureChange}
                    themeVariant="light"
                  />
                </View>
              </View>
              <ThemedButton
                text="Confirm departure"
                variant="transparent"
                press={() => setShowDeparturePicker(false)}
              />
            </>
          )}
          {isEdit && student && (
            <View className="flex-row items-center justify-between p-3 border border-gray-300 rounded-lg">
              <Text>Active</Text>
              <Switch value={isActive} onValueChange={setIsActive} />
            </View>
          )}
          <View className="flex-row justify-end gap-3 mt-6">
            <ThemedButton
              text="Cancel"
              press={handleCancel}
              disabled={loading}
              variant="transparent"
            />
            <ThemedButton
              text={
                loading
                  ? "Saving..."
                  : isEdit
                    ? "Edit Student"
                    : "Create Student"
              }
              press={handleSubmit}
              disabled={loading}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default AddStudent;
