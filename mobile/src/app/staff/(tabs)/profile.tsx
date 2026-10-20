import { StatusBadge, Tag } from "@/components/layout/badges";
import FormMessage from "@/components/layout/form-message";
import SelectField, { FieldLabel } from "@/components/layout/select-field";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";
import {
  colors,
  DEPARTMENTS,
  FormMessageData,
  UserType,
} from "@/utils/helpers";
import { isValid } from "date-fns";
import { Image } from "expo-image";
import { Eye, EyeOff, LogOut } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const inputClass =
  "h-12 rounded-control border border-line bg-input-bg px-4 font-sans text-base text-heading focus:border-sage";

const PasswordField = ({
  label,
  value,
  onChangeText,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  onToggle: () => void;
}) => (
  <View className="mb-4">
    <FieldLabel>{label}</FieldLabel>
    <View className="h-12 flex-row items-center rounded-control border border-line bg-input-bg pl-4 pr-2">
      <TextInput
        className="flex-1 font-sans text-base text-heading"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoComplete="new-password"
        placeholder="••••••••"
        placeholderTextColor={colors.muted}
      />
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        className="p-2"
        accessibilityLabel={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <EyeOff size={20} color={colors.muted} />
        ) : (
          <Eye size={20} color={colors.muted} />
        )}
      </Pressable>
    </View>
  </View>
);

const StaffProfile = () => {
  const { avatar, initials, handleSignout } = useAuthContext();

  const [initialProfile, setInitialProfile] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [username, setUsername] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileMessage, setProfileMessage] = useState<FormMessageData>(null);

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<FormMessageData>(null);

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const response = await api.get("/user/profile");
        const profileData = response.data;

        setInitialProfile(profileData);
        setUsername(profileData?.username || "");
        setDepartment(
          profileData?.department === "Unassigned"
            ? ""
            : profileData?.department || "",
        );
      } catch (error) {
        console.error("Failed to fetch profile");
        setProfileMessage({
          type: "error",
          text: "Couldn't load your profile. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const memberSinceDate = initialProfile?.created_at
    ? new Date(initialProfile.created_at)
    : null;

  const memberSince =
    memberSinceDate && isValid(memberSinceDate)
      ? memberSinceDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  const savedDepartment =
    initialProfile?.department === "Unassigned"
      ? ""
      : (initialProfile?.department ?? "");

  const hasProfileChanges =
    username.trim() !== (initialProfile?.username ?? "") ||
    department !== savedDepartment;

  const canSaveProfile =
    !!initialProfile &&
    username.trim().length > 0 &&
    hasProfileChanges &&
    !isSavingProfile;

  const canSavePassword =
    newPassword.length >= 6 && confirmPassword.length > 0 && !isSavingPassword;

  const handleProfileSubmit = async (): Promise<void> => {
    if (!canSaveProfile) {
      return;
    }

    setProfileMessage(null);
    setIsSavingProfile(true);

    try {
      const trimmed = username.trim();
      await api.patch("/user/update-profile", {
        username: trimmed,
        department,
      });

      const { error: supabaseError } = await supabase.auth.updateUser({
        data: {
          username: trimmed,
          department: department,
        },
      });

      if (supabaseError) {
        console.error("Failed to update metadata:", supabaseError);
      }

      setInitialProfile((prev) =>
        prev ? { ...prev, username: trimmed, department } : prev,
      );
      setUsername(trimmed);
      setProfileMessage({ type: "success", text: "Profile updated." });
    } catch (error: any) {
      console.error(error);
      setProfileMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Couldn't update your profile. Please try again.",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (): Promise<void> => {
    if (!canSavePassword) {
      return;
    }

    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords don't match." });
      return;
    }

    setIsSavingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage({ type: "success", text: "Password updated." });
    } catch (error: any) {
      console.error(error);
      setPasswordMessage({
        type: "error",
        text:
          error.message || "Couldn't update your password. Please try again.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#f3eee1" }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-5">
            <Text className="font-sans-extrabold text-2xl text-heading">
              Profile
            </Text>
            <Text className="mt-1 font-sans text-sm text-body">
              Manage your account details and password.
            </Text>
          </View>

          {isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color={colors.button} />
            </View>
          ) : (
            <>
              <View className="mb-4 flex-row items-center rounded-card border border-line bg-surface-hover p-4">
                {avatar ? (
                  <Image
                    source={avatar}
                    alt={initialProfile?.username || "Avatar"}
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="h-16 w-16 items-center justify-center rounded-full bg-button">
                    <Text className="font-sans-bold text-xl uppercase text-cream">
                      {initials}
                    </Text>
                  </View>
                )}

                <View className="ml-4 flex-1">
                  <Text
                    className="font-sans-bold text-lg text-heading"
                    numberOfLines={1}
                  >
                    {initialProfile?.username}
                  </Text>
                  <View className="mt-1.5 flex-row flex-wrap items-center gap-2">
                    {initialProfile?.role_name ? (
                      <Tag label={initialProfile.role_name} />
                    ) : null}
                    <StatusBadge status={initialProfile?.status} />
                  </View>
                  {memberSince && (
                    <Text className="mt-2 font-sans text-xs text-muted">
                      Member since {memberSince}
                    </Text>
                  )}
                </View>
              </View>

              <View className="mb-4 rounded-card border border-line bg-surface-hover p-5">
                <Text className="mb-4 font-sans-bold text-lg text-heading">
                  Account details
                </Text>

                <FormMessage message={profileMessage} />

                <View className="mb-4">
                  <FieldLabel>Username</FieldLabel>
                  <TextInput
                    className={inputClass}
                    value={username}
                    placeholder="Your name"
                    placeholderTextColor={colors.muted}
                    onChangeText={(v) => {
                      setUsername(v);
                      setProfileMessage(null);
                    }}
                  />
                </View>

                <View className="mb-4">
                  <FieldLabel>Email</FieldLabel>
                  <TextInput
                    className={`${inputClass} text-muted opacity-70`}
                    value={initialProfile?.email ?? ""}
                    editable={false}
                  />
                </View>

                <SelectField
                  label="Department"
                  placeholder="Select a department"
                  options={DEPARTMENTS}
                  value={department}
                  onChange={(v) => {
                    setDepartment(v);
                    setProfileMessage(null);
                  }}
                />

                <Pressable
                  onPress={handleProfileSubmit}
                  disabled={!canSaveProfile}
                  className={`h-12 flex-row items-center justify-center rounded-control bg-button active:bg-button-hover ${
                    canSaveProfile ? "" : "opacity-50"
                  }`}
                >
                  {isSavingPassword && (
                    <ActivityIndicator color={colors.cream} className="mr-2" />
                  )}
                  <Text className="font-sans-semibold text-base text-cream">
                    {isSavingProfile ? "Saving..." : "Save changes"}
                  </Text>
                </Pressable>
              </View>

              <View className="mb-6 rounded-card border border-line bg-surface-hover p-5">
                <Text className="mb-4 font-sans-bold text-lg text-heading">
                  Change passsword
                </Text>

                <FormMessage message={passwordMessage} />

                <PasswordField
                  label="New password"
                  value={newPassword}
                  onChangeText={(v) => {
                    setNewPassword(v);
                    setPasswordMessage(null);
                  }}
                  show={showNewPassword}
                  onToggle={() => setShowNewPassword((s) => !s)}
                />

                <PasswordField
                  label="Confirm new password"
                  value={confirmPassword}
                  onChangeText={(v) => {
                    setConfirmPassword(v);
                    setPasswordMessage(null);
                  }}
                  show={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((s) => !s)}
                />

                <Pressable
                  onPress={handlePasswordSubmit}
                  disabled={!canSavePassword}
                  className={`h-12 flex-row items-center justify-center rounded-control bg-button active:bg-button-hover ${
                    canSavePassword ? "" : "opacity-50"
                  }`}
                >
                  {isSavingPassword && (
                    <ActivityIndicator color={colors.cream} className="mr-2" />
                  )}
                  <Text className="font-sans-semibold text-base text-cream">
                    {isSavingPassword ? "Updating..." : "Update password"}
                  </Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleSignout}
                className="h-12 flex-row items-center justify-center rounded-control border border-danger bg-danger-bg active:opacity-80"
                accessibilityRole="button"
              >
                <LogOut size={18} color={colors.danger} />
                <Text className="ml-2 font-sans-semibold text-base text-danger">
                  Sign Out
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default StaffProfile;
