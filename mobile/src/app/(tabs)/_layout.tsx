import { Tabs } from "expo-router";

const TabsLayout = () => (
  <Tabs>
    <Tabs.Screen name="index" options={{ title: "Home" }} />
    <Tabs.Screen name="tickets" options={{ title: "Tickets" }} />
  </Tabs>
);

export default TabsLayout;
