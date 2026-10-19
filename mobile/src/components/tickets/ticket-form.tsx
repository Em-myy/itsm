import { colors, DEPARTMENTS, TicketType } from "@/utils/helpers";
import { Image } from "expo-image";
import { Camera, ImageIcon, X } from "lucide-react-native";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import SelectField, { FieldLabel } from "../layout/select-field";
import FormMessage from "../layout/form-message";

export interface SelectedImage {
  uri: string;
  name: string;
  type: string;
}

export interface TicketFormValues {
  ticketId: number;
  title: string;
  category: string;
  department: string;
  priority: string;
  relatedAsset: string;
  description: string;
  file: SelectedImage | null;
}

interface TicketFormType {
  ticketId: number | string;
  title: string;
  category: string;
  department: string;
  priority: string;
  relatedAsset: string;
  description: string;
}

interface TicketFormProps {
  relatedTickets: TicketType[] | null;
  initialValues?: Partial<Omit<TicketFormValues, "file">>;
  showFileUpload?: boolean;
  submitLabel: string;
  submittingLabel: string;
  cancelLabel?: string;
  onSubmit: (values: TicketFormValues) => Promise<void>;
  onCancel?: () => void;
}

const NO_ASSET = "None - not tied to a registered asset";
const PRIORITIES = ["Low", "Normal", "Urgent"] as const;
const CATEGORIES = [
  "Hardware",
  "Network",
  "Software",
  "Printing",
  "Power / UPS",
];

const inputClass =
  "rounded-control border border-line bg-input-bg px-4 font-sans text-base text-heading focus:border-sage";

const TicketForm = ({
  relatedTickets,
  initialValues,
  showFileUpload = false,
  submitLabel,
  submittingLabel,
  cancelLabel,
  onSubmit,
  onCancel,
}: TicketFormProps) => {
  const [formData, setFormData] = useState<TicketFormType>({
    ticketId: initialValues?.ticketId ?? "",
    title: initialValues?.title ?? "",
    category: initialValues?.category ?? "",
    department: initialValues?.department ?? "",
    priority: initialValues?.priority ?? "",
    relatedAsset: initialValues?.relatedAsset ?? NO_ASSET,
    description: initialValues?.description ?? "",
  });

  const [file, setFile] = useState<SelectedImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    formData.title.trim().length > 0 &&
    formData.category !== "" &&
    formData.department !== "" &&
    formData.priority !== "" &&
    formData.description.trim().length > 0 &&
    !isSubmitting;

  const handleFormChange = (
    field: keyof TicketFormType,
    value: string,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async (source: "camera" | "library"): Promise<void> => {
    setError(null);

    if (source === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        setError("Permission to use the camera is required.");
        return;
      }
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    };

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    setFile({
      uri: asset.uri,
      name: asset.fileName ?? `ticket-image-${Date.now()}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit) {
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        ticketId: Number(formData.ticketId),
        title: formData.title,
        category: formData.category,
        department: formData.department,
        priority: formData.priority,
        relatedAsset: formData.relatedAsset,
        description: formData.description,
        file,
      });
    } catch (error: any) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const assetOptions = [
    { label: NO_ASSET, value: NO_ASSET },
    ...(relatedTickets ?? []).map((ticket) => ({
      label: `${ticket.reference} - ${ticket.title}`,
      value: ticket.reference,
    })),
  ];

  return (
    <View>
      <View className="mb-4">
        <FieldLabel>What&apos;s wrong?</FieldLabel>
        <TextInput
          placeholder="e.g. Laptop won't turn on"
          placeholderTextColor={colors.muted}
          value={formData.title}
          onChangeText={(text) => handleFormChange("title", text)}
          className={`h-12 ${inputClass}`}
        />
      </View>

      <SelectField
        label="Category"
        placeholder="Select a category"
        options={CATEGORIES}
        value={formData.category}
        onChange={(v) => handleFormChange("category", v)}
      />

      <SelectField
        label="Department"
        placeholder="Select a department"
        options={DEPARTMENTS}
        value={formData.department}
        onChange={(v) => handleFormChange("department", v)}
      />

      <View className="mb-4">
        <FieldLabel>Priority</FieldLabel>
        <View className="flex-row gap-2">
          {PRIORITIES.map((level) => {
            const selected = formData.priority === level;
            return (
              <Pressable
                key={level}
                onPress={() => handleFormChange("priority", level)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={`h-12 flex-1 items-center justify-center rounded-control border ${
                  selected
                    ? "border-button bg-button"
                    : "border-line bg-input-bg"
                }`}
              >
                <Text
                  className={`font-sans-semibold text-sm ${
                    selected ? "text-cream" : "text-body"
                  }`}
                >
                  {level}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <SelectField
        label="Related asset"
        optional
        options={assetOptions}
        value={formData.relatedAsset}
        onChange={(v) => handleFormChange("relatedAsset", v)}
      />

      <View className="mb-4">
        <FieldLabel>Describe what&apos;s happening</FieldLabel>
        <TextInput
          placeholder="What did you expect to happen, and what happened instead?"
          placeholderTextColor={colors.muted}
          value={formData.description}
          onChangeText={(text) => handleFormChange("description", text)}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className={`min-h-[120px] py-3 ${inputClass}`}
        />
      </View>

      {showFileUpload && (
        <View className="mb-4">
          <FieldLabel optional>Attach a picture</FieldLabel>

          {file ? (
            <View className="overflow-hidden rounded-control border border-line bg-input-bg">
              <Image
                source={{ uri: file.uri }}
                style={{ width: "100%", height: 180 }}
                contentFit="cover"
              />
              <View className="flex-row items-center justify-between px-3 py-2">
                <Text
                  className="mr-2 flex-1 font-sans text-xs text-muted"
                  numberOfLines={1}
                >
                  {file.name}
                </Text>
                <Pressable
                  onPress={() => setFile(null)}
                  hitSlop={8}
                  className="flex-row items-center active:opacity-70"
                  accessibilityLabel="Remove image"
                >
                  <X size={16} className={colors.danger} />
                  <Text className="ml-1 font-sans-medium text-xs text-danger">
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => pickImage("camera")}
                className="h-12 flex-1 flex-row items-center justify-center rounded-control border border-line bg-input-bg active:opacity-80"
              >
                <Camera size={18} color={colors.button} />
                <Text className="ml-2 font-sans-medium text-sm text-heading">
                  Take Photo
                </Text>
              </Pressable>
              <Pressable
                onPress={() => pickImage("library")}
                className="h-12 flex-1 flex-row items-center justify-center rounded-control border border-line bg-input-bg active:opacity-80"
              >
                <ImageIcon size={18} color={colors.button} />
                <Text className="ml-2 font-sans-medium text-sm text-heading">
                  Gallery
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {error && <FormMessage message={{ type: "error", text: error }} />}

      <View className="flex-row gap-3">
        {cancelLabel && (
          <Pressable
            onPress={onCancel}
            disabled={isSubmitting}
            className="min-h-[48px] py-2 px-3 flex-1 items-center justify-center rounded-control border border-line bg-surface-hover active:opacity-80"
          >
            <Text className="text-center font-sans-semibold text-base text-heading">
              {cancelLabel}
            </Text>
          </Pressable>
        )}

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

export default TicketForm;
