import { colors, getEquipmentLabel, VenueType } from "@/utils/helpers";
import { X } from "lucide-react-native";
import { ReactNode } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBadge, Tag } from "../layout/badges";

interface VenueDetailsProps {
  venue: VenueType;
  onClose: () => void;
}

const Row = ({
  label,
  children,
  last,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) => (
  <View className={`py-3 ${last ? "" : "border-b border-line"}`}>
    <Text className="mb-1 font-sans-medium text-xs uppercase text-muted">
      {label}
    </Text>
    {children}
  </View>
);

const VenueDetails = ({ venue, onClose }: VenueDetailsProps) => {
  const equipments = venue.equipments ?? [];

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#f3eee1" }}
          edges={Platform.OS === "ios" ? ["bottom"] : ["top", "bottom"]}
        >
          <View className="flex-row items-start justify-between border-b border-line px-5 py-4">
            <View className="mr-3 flex-1">
              {venue.reference ? (
                <Text className="mb-1 font-sans-medium text-xs text-muted">
                  {venue.reference}
                </Text>
              ) : null}
              <Text className="font-sans-extrabold text-xl text-heading">
                {venue.name}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-hover active:opacity-80"
              accessibilityLabel="Close"
            >
              <X size={20} color={colors.heading} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="rounded-card border border-line bg-surface-hover px-4">
              <Row label="Capacity">
                <Text className="font-sans-semibold text-base text-heading">
                  {venue.capacity} seats
                </Text>
              </Row>

              <Row label="Status" last={false}>
                <View className="flex-row">
                  <StatusBadge status={venue.status} />
                </View>
              </Row>

              <Row label="Equipment" last>
                {equipments.length > 0 ? (
                  <View className="flex-row flex-wrap gap-2">
                    {equipments.map((eq) => (
                      <Tag key={eq} label={getEquipmentLabel(eq)} />
                    ))}
                  </View>
                ) : (
                  <Text className="font-sans text-sm text-muted">
                    No equipment listed
                  </Text>
                )}
              </Row>
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};

export default VenueDetails;
