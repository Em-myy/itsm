import FullScreenLoader from "@/components/layout/full-screen-loader";
import { useAuthContext } from "@/hooks/use-auth-context";
import { colors } from "@/utils/helpers";
import { Redirect, Tabs } from "expo-router";
import { CalendarDays, House, Ticket, UserRound } from "lucide-react-native";

const StaffLayout = () => {
  const { profile, isLoggedIn, isLoading } = useAuthContext();

  if (isLoading || (isLoggedIn && !profile)) {
    return <FullScreenLoader />;
  }

  if (!isLoggedIn) {
    return <Redirect href="/sign-in" />;
  }

  if (profile?.role_name === "IT Admin") {
    return <Redirect href="/admin" />;
  }

  if (profile?.role_name !== "Staff") {
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
        name="tickets"
        options={{
          title: "Tickets",
          tabBarIcon: ({ color, size, focused }) => (
            <Ticket size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size, focused }) => (
            <CalendarDays
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

export default StaffLayout;
