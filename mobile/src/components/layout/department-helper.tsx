import { colors, DEPARTMENTS } from "@/utils/helpers";
import { Picker } from "@react-native-picker/picker";
import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Keyboard, Modal, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  value: string;
  onChange: (value: string) => void;
};
export const AndroidDepartmentHelper = ({ value, onChange }: Props) => {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 font-sans-medium text-sm text-heading">
        Department
      </Text>
      <View className="overflow-hidden rounded-control border border-line bg-input-bg">
        <Picker
          mode="dropdown"
          selectedValue={value}
          onValueChange={onChange}
          dropdownIconColor={colors.muted}
          style={{ color: value ? colors.heading : colors.muted }}
        >
          <Picker.Item
            label="Select a department"
            value=""
            color={colors.muted}
          />
          {DEPARTMENTS.map((dept) => (
            <Picker.Item
              label={dept}
              value={dept}
              key={dept}
              color={colors.heading}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export const IOSDepartmentHelper = ({ value, onChange }: Props) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<boolean>(false);

  return (
    <View className="mb-4">
      <Text className="mb-1.5 font-sans-medium text-sm text-heading">
        Department
      </Text>

      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          setOpen(true);
        }}
        className="h-12 flex-row items-center justify-between rounded-control border border-line bg-input-bg px-4 active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="Select department"
      >
        <Text
          className={`font-sans text-base ${
            value ? "text-heading" : "text-muted"
          }`}
        >
          {value || "Select a department"}
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
                Select department
              </Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Text className="font-sans-medium text-sm text-button">
                  Cancel
                </Text>
              </Pressable>
            </View>

            {DEPARTMENTS.map((dept) => {
              const selected = dept === value;

              return (
                <Pressable
                  key={dept}
                  onPress={() => {
                    onChange(dept);
                    setOpen(false);
                  }}
                  className={`mb-2 h-12 flex-row items-center justify-between rounded-control border px-4 active:bg-surface-hover ${
                    selected
                      ? "border-button bg-surface-hover"
                      : "border-line bg-input-bg"
                  }`}
                >
                  <Text
                    className={`text-base ${
                      selected
                        ? "font-sans-semibold text-heading"
                        : "font-sans text-body"
                    }`}
                  >
                    {dept}
                  </Text>
                  {selected && <Check size={20} color={colors.button} />}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
