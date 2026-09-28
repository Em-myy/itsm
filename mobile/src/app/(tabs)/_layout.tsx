import { Tabs } from "expo-router";

const TabsLayout = () => (
  <Tabs screenOptions={{ headerShown: false }}>
    <Tabs.Screen name="index" options={{ title: "Home" }} />
    <Tabs.Screen name="tickets" options={{ title: "Tickets" }} />
    <Tabs.Screen name="bookings" options={{ title: "Bookings" }} />
    <Tabs.Screen name="profile" options={{ title: "Profile" }} />
  </Tabs>
);

export default TabsLayout;
