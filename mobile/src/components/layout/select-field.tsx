import { colors } from "@/utils/helpers";
import { Picker } from "@react-native-picker/picker";
import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Option = string | { label: string; value: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly Option[];
  placeholder?: string;
  optional?: boolean;
};

const toItem = (o: Option) =>
  typeof o === "string" ? { label: o, value: o } : o;

export const FieldLabel = ({
  children,
  optional,
}: {
  children: string;
  optional?: boolean;
}) => (
  <Text className="mb-1.5 font-sans-medium text-sm text-heading">
    {children}
    {optional && (
      <Text className="font-sans text-sm text-muted"> (optional)</Text>
    )}
  </Text>
);

const AndroidSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  optional,
}: Props) => (
  <View className="mb-4">
    <FieldLabel optional={optional}>{label}</FieldLabel>
    <View className="overflow-hidden rounded-control border border-line bg-input-bg">
      <Picker
        mode="dropdown"
        selectedValue={value}
        onValueChange={onChange}
        dropdownIconColor={colors.muted}
        style={{ color: value ? colors.heading : colors.muted }}
      >
        {placeholder && (
          <Picker.Item label={placeholder} value="" color={colors.muted} />
        )}
        {options.map(toItem).map((o) => (
          <Picker.Item
            key={o.value}
            label={o.label}
            value={o.value}
            color={colors.heading}
          />
        ))}
      </Picker>
    </View>
  </View>
);

const SheetSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  optional,
}: Props) => {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const [open, setOpen] = useState<boolean>(false);

  const items = options.map(toItem);
  const selected = items.find((i) => i.value === value);

  return (
    <View className="mb-4">
      <FieldLabel optional={optional}>{label}</FieldLabel>
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          setOpen(true);
        }}
        className="h-12 flex-row items-center justify-between rounded-control border border-line bg-input-bg px-4 active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel={`Select ${label.toLowerCase()}`}
      >
        <Text
          className={`mr-2 flex-1 font-sans text-base ${selected ? "text-heading" : "text-muted"}`}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder ?? "Select"}
        </Text>
        <ChevronDown size={20} color={colors.muted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: colors.overlay,
          }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={() => {}}
            className="rounded-t-card bg-cream px-5 pt-5 web:mx-auto web:w-full web:max-w-md"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="font-sans-bold text-lg text-heading">
                {label}
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Text className="font-sans-medium text-sm text-button">
                  Cancel
                </Text>
              </Pressable>
            </View>

            <ScrollView
              style={{ maxHeight: height * 0.55 }}
              showsVerticalScrollIndicator={false}
            >
              {items.map((item) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    key={item.value}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className={`mb-2 min-h-12 flex-row items-center justify-between rounded-control border px-4 py-3 active:bg-surface-hover ${
                      isSelected
                        ? "border-button bg-surface-hover"
                        : "border-line bg-input-bg"
                    }`}
                  >
                    <Text
                      className={`mr-2 flex-1 text-base ${
                        isSelected
                          ? "font-sans-semibold text-heading"
                          : "font-sans text-body"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Check size={20} color={colors.button} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default function SelectField(props: Props) {
  return Platform.OS === "android" ? (
    <AndroidSelect {...props} />
  ) : (
    <SheetSelect {...props} />
  );
}
