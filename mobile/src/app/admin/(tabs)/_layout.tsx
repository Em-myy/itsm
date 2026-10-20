import { Redirect, Tabs } from "expo-router";
import { useAuthContext } from "@/hooks/use-auth-context";
import {
  CalendarCheck,
  ClipboardList,
  House,
  UserRound,
} from "lucide-react-native";
import FullScreenLoader from "@/components/layout/full-screen-loader";
import { colors } from "@/utils/helpers";

const AdminLayout = () => {
  const { profile, isLoggedIn, isLoading } = useAuthContext();

  if (isLoading || (isLoggedIn && !profile)) {
    return <FullScreenLoader />;
  }

  if (!isLoggedIn) {
    return <Redirect href="/sign-in" />;
  }

  if (profile?.role_name === "Staff") {
    return <Redirect href="/staff" />;
  }

  if (profile?.role_name !== "IT Admin") {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.cream },
        tabBarActiveTintColor: colors.button,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: "sans-medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <House size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="helpdesk"
        options={{
          title: "Helpdesk Board",
          tabBarIcon: ({ color, size, focused }) => (
            <ClipboardList
              size={size}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Approvals",
          tabBarIcon: ({ color, size, focused }) => (
            <CalendarCheck
              size={size}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <UserRound
              size={size}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default AdminLayout;
