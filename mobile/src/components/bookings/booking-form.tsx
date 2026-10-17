import { getEquipmentLabel, VenueType } from "@/utils/helpers";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { AlertCircle } from "lucide-react-native";
import Checkbox from "expo-checkbox";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

export interface BookingFormValues {
  bookingId: number;
  purpose: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  equipmentNeeded: string[];
}

interface BookingFormType {
  bookingId: number | string;
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface BookingFormProps {
  venues: VenueType[] | null;
  initialValues?: Partial<BookingFormValues>;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (values: BookingFormValues) => Promise<void>;
  onCancel: () => void;
}

const BookingForm = ({
  venues,
  initialValues,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}: BookingFormProps) => {
  const [formData, setFormData] = useState<BookingFormType>({
    bookingId: initialValues?.bookingId ?? "",
    purpose: initialValues?.purpose ?? "",
    date: initialValues?.date ?? "",
    startTime: initialValues?.startTime ?? "",
    endTime: initialValues?.endTime ?? "",
  });

  const [selectedVenue, setSelectedVenue] = useState<string>(
    initialValues?.venueId ?? "",
  );
  const [equipmentNeeded, setEquipmentNeeded] = useState<string[]>(
    initialValues?.equipmentNeeded ?? [],
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showStartTimePicker, setShowStartTimePicker] =
    useState<boolean>(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState<boolean>(false);

  const handleFormChange = (
    field: keyof BookingFormType,
    value: string,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVenueChange = (venueId: string): void => {
    setSelectedVenue(venueId);
    setEquipmentNeeded([]);
  };

  const handleEquipmentChange = (equipment: string, checked: boolean): void => {
    setEquipmentNeeded((prev) =>
      checked
        ? prev.includes(equipment)
          ? prev
          : [...prev, equipment]
        : prev.filter((item) => item !== equipment),
    );
  };

  const handleSubmit = async (): Promise<void> => {
    setError(null);

    const finalStartDate = new Date(
      `${formData.date}T${formData.startTime}:00`,
    );
    const finalEndDate = new Date(`${formData.date}T${formData.endTime}:00`);

    if (finalEndDate <= finalStartDate) {
      setError("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        bookingId: Number(formData.bookingId),
        purpose: formData.purpose,
        venueId: selectedVenue,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        equipmentNeeded,
      });
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setError(
          "This venue is already booked for that time. Try a different slot.",
        );
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(
          "Something went wrong submitting your booking. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const selectedVenueData = venues?.find((v) => String(v.id) === selectedVenue);

  return (
    <View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <View>
            <Text>Purpose</Text>
            <TextInput
              placeholder="e.g. Q3 budget review"
              value={formData.purpose}
              onChangeText={(text) => handleFormChange("purpose", text)}
            />
          </View>

          <View>
            <Text className="mb-2 block text-sm font-medium text-heading">
              Venue
            </Text>
            <Picker
              selectedValue={selectedVenue}
              onValueChange={(venueId) => handleVenueChange(String(venueId))}
            >
              <Picker.Item label="Select a venue" value="" enabled={false} />

              {venues?.map((venue) => (
                <Picker.Item
                  key={venue.id}
                  value={String(venue.id)}
                  label={`${venue.name} - seats ${venue.capacity}`}
                />
              ))}
            </Picker>
          </View>

          <View>
            <Pressable onPress={() => setShowDatePicker(true)}>
              <Text>{formData.date || "Select booking date"}</Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={
                  formData.date
                    ? new Date(`${formData.date}T12:00:00`)
                    : new Date()
                }
                mode="date"
                minimumDate={new Date()}
                onValueChange={(_event, selectedDate) => {
                  setShowDatePicker(false);

                  if (selectedDate) {
                    handleFormChange(
                      "date",
                      format(selectedDate, "yyyy-MM-dd"),
                    );
                  }
                }}
                onDismiss={() => setShowDatePicker(false)}
              />
            )}
          </View>

          <View>
            <Pressable onPress={() => setShowStartTimePicker(true)}>
              <Text>{formData.startTime || "Select booking start time"}</Text>
            </Pressable>

            {showStartTimePicker && (
              <DateTimePicker
                value={
                  formData.startTime
                    ? new Date(`2000-01-01T${formData.startTime}:00`)
                    : new Date()
                }
                mode="time"
                is24Hour
                onValueChange={(_event, selectedStartTime) => {
                  setShowStartTimePicker(false);

                  if (selectedStartTime) {
                    handleFormChange(
                      "startTime",
                      format(selectedStartTime, "HH:MM"),
                    );
                  }
                }}
                onDismiss={() => setShowStartTimePicker(false)}
              />
            )}
          </View>

          <View>
            <Pressable onPress={() => setShowEndTimePicker(true)}>
              <Text>{formData.endTime || "Select booking end time"}</Text>
            </Pressable>

            {showEndTimePicker && (
              <DateTimePicker
                value={
                  formData.endTime
                    ? new Date(`2000-01-01T${formData.endTime}:00`)
                    : new Date()
                }
                mode="time"
                is24Hour
                onValueChange={(_event, selectedEndTime) => {
                  setShowEndTimePicker(false);

                  if (selectedEndTime) {
                    handleFormChange(
                      "endTime",
                      format(selectedEndTime, "HH:mm"),
                    );
                  }
                }}
                onDismiss={() => setShowEndTimePicker(false)}
              />
            )}
          </View>

          {selectedVenueData && selectedVenueData.equipments.length > 0 && (
            <View>
              <Text>Equipment needed</Text>
              <View className="flex flex-wrap gap-2">
                {selectedVenueData.equipments.map((eq) => (
                  <View key={eq}>
                    <Checkbox
                      value={equipmentNeeded.includes(eq)}
                      onValueChange={(checked) =>
                        handleEquipmentChange(eq, checked)
                      }
                    />
                    <Text key={eq}>{getEquipmentLabel(eq)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {error && (
            <View>
              <AlertCircle />
              <Text>{error}</Text>
            </View>
          )}

          <View>
            <Pressable onPress={onCancel}>
              <Text>Cancel</Text>
            </Pressable>

            <Pressable onPress={handleSubmit} disabled={isSubmitting}>
              <Text> {isSubmitting ? submittingLabel : submitLabel}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default BookingForm;
