import { Tabs } from "expo-router";

const TabsLayout = () => (
  <Tabs>
    <Tabs.Screen name="index" options={{ title: "Home" }} />
  </Tabs>
);

export default TabsLayout;
