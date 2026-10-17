import { getEquipmentLabel, VenueType } from "@/utils/helpers";
import { AlertCircle, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface VenueDetailsProps {
  venue: VenueType;
  onClose: () => void;
}

const VenueDetails = ({ venue, onClose }: VenueDetailsProps) => {
  const [error, setError] = useState<string | null>(null);

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          <View className="flex items-start justify-between">
            <Text className="font-serif text-2xl text-heading">
              Venue Details
            </Text>
            <Pressable
              onPress={onClose}
              className="text-muted transition hover:text-heading cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Pressable>
          </View>

          <Text className="mt-1 font-mono text-xs text-muted">
            {venue.reference}
          </Text>

          {error && (
            <View className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <Text>{error}</Text>
            </View>
          )}

          <View className="mt-6 space-y-3 text-sm">
            <View className="flex justify-between border-b border-line pb-3">
              <Text className="font-medium text-body">Name</Text>
              <Text className="text-heading">{venue.name}</Text>
            </View>

            <View className="flex justify-between border-b border-line pb-3">
              <Text className="font-medium text-body">Capacity</Text>
              <Text className="text-heading">{venue.capacity}</Text>
            </View>

            <View className="flex items-center justify-between border-b border-line pb-3">
              <Text className="font-medium text-body">Status</Text>
              <Text>{venue.status}</Text>
            </View>

            <View className="pt-1">
              <Text className="mb-2 block font-medium text-body">
                Equipment
              </Text>
              {venue.equipments?.length ? (
                <View className="flex flex-wrap gap-1.5">
                  {venue.equipments.map((eq) => (
                    <Text
                      key={eq}
                      className="rounded-full bg-input-bg px-2.5 py-1 text-xs text-body"
                    >
                      {getEquipmentLabel(eq)}
                    </Text>
                  ))}
                </View>
              ) : (
                <p className="text-muted">None</p>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VenueDetails;
