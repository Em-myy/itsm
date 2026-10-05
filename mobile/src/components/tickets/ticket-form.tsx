import { DEPARTMENTS, TicketType } from "@/utils/helpers";
import { Picker } from "@react-native-picker/picker";
import { Image } from "expo-image";
import { AlertCircle } from "lucide-react-native";
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

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

interface SelectedImage {
  uri: string;
  name: string;
  type: string;
}

const PRIORITIES = ["Low", "Normal", "Urgent"];

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
    relatedAsset:
      initialValues?.relatedAsset ?? "None - not tied to a registered asset",
    description: initialValues?.description ?? "",
  });

  const [file, setFile] = useState<SelectedImage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (
    field: keyof TicketFormType,
    value: string,
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePickImage = async (): Promise<void> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError("Permission to access your photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

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

  const handleTakePhoto = async (): Promise<void> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setError("Permission to use the camera is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

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

  const handleChooseImage = (): void => {
    Alert.alert("Add Image", "How would you like to add an image?", [
      {
        text: "Take Photo",
        onPress: handleTakePhoto,
      },
      {
        text: "Choose from Gallery",
        onPress: handlePickImage,
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleClearImage = (): void => {
    setFile(null);
  };

  const handleSubmit = async (): Promise<void> => {
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

  return (
    <View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <View>
            <Text>What&apos;s wrong?</Text>
            <TextInput
              placeholder="e.g. Laptop won't turn on"
              value={formData.title}
              onChangeText={(text) => handleFormChange("title", text)}
            />
          </View>

          <View>
            <View>
              <Text className="mb-2 block text-sm font-medium text-heading">
                Category
              </Text>
              <Picker
                selectedValue={formData.category}
                onValueChange={(text) => handleFormChange("category", text)}
              >
                <Picker.Item
                  label="Select the category of the ticket"
                  value=""
                  enabled={false}
                />

                <Picker.Item label="Hardware" value="Hardware" />
                <Picker.Item label="Network" value="Network" />
                <Picker.Item label="Software" value="Software" />
                <Picker.Item label="Printing" value="Printing" />
                <Picker.Item label="Power / UPS" value="Power / UPS" />
              </Picker>
            </View>

            <View>
              <Text>Department</Text>
              <Picker
                selectedValue={formData.department}
                onValueChange={(text) => handleFormChange("department", text)}
              >
                <Picker.Item
                  label="Select a department"
                  value=""
                  enabled={false}
                />

                {DEPARTMENTS.map((dept) => (
                  <Picker.Item label={dept} value={dept} key={dept} />
                ))}
              </Picker>
            </View>
          </View>

          <View>
            <Text>Priority</Text>
            <View>
              {PRIORITIES.map((level) => (
                <Pressable
                  key={level}
                  onPress={() => handleFormChange("priority", level)}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor:
                        formData.priority === level ? "#4F6F52" : "#9CA3AF",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {formData.priority === level && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "#4F6F52",
                        }}
                      />
                    )}
                  </View>
                  <Text>{level}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text>
              Related Asset <Text>(optional)</Text>
            </Text>

            <Picker
              selectedValue={formData.relatedAsset}
              onValueChange={(text) => handleFormChange("relatedAsset", text)}
            >
              <Picker.Item
                label="None - not tied to a registered asset"
                value="None - not tied to a registered asset"
              />

              {relatedTickets?.map((ticket) => (
                <Picker.Item
                  label={ticket.reference + " - " + ticket.title}
                  value={`${ticket.reference}`}
                  key={ticket.reference}
                />
              ))}
            </Picker>
          </View>

          <View>
            <Text>Describe what&apos;s happening</Text>
            <TextInput
              placeholder="What did you expect to happen, and what happened instead?"
              value={formData.description}
              onChangeText={(text) => handleFormChange("description", text)}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {showFileUpload && (
            <View>
              <Text>
                Attach a picture <Text>(optional)</Text>
              </Text>
              <Pressable onPress={handleChooseImage}>
                <Text>Add Image</Text>
              </Pressable>

              {file && (
                <View>
                  <Image source={{ uri: file.uri }} />
                  <Text>{file.name}</Text>
                  <Pressable onPress={handleClearImage}>
                    <Text>Remove Image</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {error && (
            <View>
              <AlertCircle />
              <Text>{error}</Text>
            </View>
          )}

          <View>
            {cancelLabel && (
              <Pressable onPress={onCancel}>{cancelLabel}</Pressable>
            )}

            <Pressable onPress={handleSubmit} disabled={isSubmitting}>
              <Text> {isSubmitting ? submittingLabel : submitLabel}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default TicketForm;
