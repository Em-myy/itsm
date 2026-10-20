import { colors, getEquipmentLabel, VenueType } from "@/utils/helpers";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { CalendarDays, Clock } from "lucide-react-native";
import Checkbox from "expo-checkbox";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import SelectField, { FieldLabel } from "../layout/select-field";
import FormMessage from "../layout/form-message";

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

const toDate = (date: string) => (date ? new Date(`${date}T12:00:00`) : null);
const toTime = (time: string) =>
  time ? new Date(`2000-01-01T${time}:00`) : null;

const DateTimeField = ({
  label,
  mode,
  date,
  text,
  placeholder,
  minimumDate,
  onPick,
  className = "",
}: {
  label: string;
  mode: "date" | "time";
  date: Date | null;
  text: string;
  placeholder: string;
  minimumDate?: Date;
  onPick: (date: Date) => void;
  className?: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const isIOS = Platform.OS === "ios";
  const Icon = mode === "date" ? CalendarDays : Clock;

  const toggle = () => {
    if (isIOS && !open && !date) {
      onPick(new Date());
    }

    setOpen((v) => !v);
  };

  return (
    <View className={`mb-4 ${className}`}>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        onPress={toggle}
        className="h-12 flex-row items-center justify-between rounded-control border border-line bg-input-bg px-4 active:opacity-80"
      >
        <Text
          className={`mr-2 flex-1 font-sans text-base ${text ? "text-heading" : "text-muted"}`}
          numberOfLines={1}
        >
          {text || placeholder}
        </Text>
        <Icon size={18} color={colors.muted} />
      </Pressable>

      {open && (
        <DateTimePicker
          value={date ?? new Date()}
          mode={mode}
          display={isIOS ? "spinner" : "default"}
          minimumDate={minimumDate}
          themeVariant="light"
          onValueChange={(_event, selected) => {
            if (!isIOS) setOpen(false);
            if (selected) onPick(selected);
          }}
          onDismiss={() => setOpen(false)}
        />
      )}

      {open && isIOS && (
        <Pressable
          onPress={() => setOpen(false)}
          className="mt-2 h-10 items-center justify-center rounded-control bg-surface-hover active:opacity-80"
        >
          <Text className="font-sans-semibold text-sm text-button">Done</Text>
        </Pressable>
      )}
    </View>
  );
};

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

  const canSubmit =
    formData.purpose.trim().length > 0 &&
    selectedVenue !== "" &&
    formData.date !== "" &&
    formData.startTime !== "" &&
    formData.endTime !== "" &&
    !isSubmitting;

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
    setError(null);
  };

  const toggleEquipment = (equipment: string): void => {
    setEquipmentNeeded((prev) =>
      prev.includes(equipment)
        ? prev.filter((item) => item !== equipment)
        : [...prev, equipment],
    );
  };

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit) {
      return;
    }

    setError(null);

    const start = new Date(`${formData.date}T${formData.startTime}:00`);
    const end = new Date(`${formData.date}T${formData.endTime}:00`);

    if (end <= start) {
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
  const equipments = selectedVenueData?.equipments ?? [];

  const startDate = toTime(formData.startTime);
  const endDate = toTime(formData.endTime);
  const pickedDate = toDate(formData.date);

  return (
    <View>
      <View className="mb-4">
        <FieldLabel>Purpose</FieldLabel>
        <TextInput
          placeholder="e.g. Q3 budget review"
          placeholderTextColor={colors.muted}
          value={formData.purpose}
          onChangeText={(text) => handleFormChange("purpose", text)}
          className="h-12 rounded-control border border-line bg-input-bg px-4 font-sans text-base text-heading focus:border-sage"
        />
      </View>

      <SelectField
        label="Venue"
        placeholder="Select a venue"
        options={(venues ?? []).map((v) => ({
          label: `${v.name} - seats ${v.capacity}`,
          value: String(v.id),
        }))}
        value={selectedVenue}
        onChange={handleVenueChange}
      />

      <DateTimeField
        label="Date"
        mode="date"
        date={pickedDate}
        text={pickedDate ? format(pickedDate, "EEE d MMM yyyy") : ""}
        placeholder="Select booking date"
        minimumDate={new Date()}
        onPick={(d) => handleFormChange("date", format(d, "yyyy-MM-dd"))}
      />

      <View className="flex-row gap-3">
        <DateTimeField
          className="flex-1"
          label="Start time"
          mode="time"
          date={startDate}
          text={startDate ? format(startDate, "h:mm a") : ""}
          placeholder="Start"
          onPick={(d) => handleFormChange("startTime", format(d, "HH:mm"))}
        />

        <DateTimeField
          className="flex-1"
          label="End time"
          mode="time"
          date={endDate}
          text={endDate ? format(endDate, "h:mm a") : ""}
          placeholder="End"
          onPick={(d) => handleFormChange("endTime", format(d, "HH:mm"))}
        />
      </View>

      {equipments.length > 0 && (
        <View className="mb-4">
          <FieldLabel optional>Equipment needed</FieldLabel>
          <View className=" gap-2">
            {equipments.map((eq) => {
              const checked = equipments.includes(eq);
              return (
                <Pressable
                  key={eq}
                  onPress={() => toggleEquipment(eq)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked }}
                  className={`min-h-12 flex-row items-center rounded-control border px-4 py-3 active:opacity-80 ${
                    checked
                      ? "border-button bg-surface-hover"
                      : "border-line bg-input-bg"
                  }`}
                >
                  <Checkbox
                    value={checked}
                    onValueChange={() => toggleEquipment(eq)}
                    color={checked ? colors.button : undefined}
                  />
                  <Text
                    className={`ml-3 flex-1 text-base ${
                      checked
                        ? "font-sans-semibold text-heading"
                        : "font-sans text-body"
                    }`}
                  >
                    {getEquipmentLabel(eq)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {error && <FormMessage message={{ type: "error", text: error }} />}

      <View className="flex-row gap-3">
        <Pressable
          onPress={onCancel}
          disabled={isSubmitting}
          className="h-12 flex-1 items-center justify-center rounded-control border border-line bg-surface-hover active:opacity-80"
        >
          <Text className="font-sans-semibold text-base text-heading">
            Cancel
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          className={`h-12 flex-[2] flex-row items-center justify-center rounded-control bg-button active:bg-button-hover ${
            canSubmit ? "" : "opacity-50"
          }`}
        >
          {isSubmitting && (
            <ActivityIndicator color={colors.cream} className="mr-2" />
          )}
          <Text className="font-sans-semibold text-base text-cream">
            {isSubmitting ? submittingLabel : submitLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default BookingForm;
