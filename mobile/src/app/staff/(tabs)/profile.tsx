import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import api from "@/utils/axios";
import { DEPARTMENTS, UserType } from "@/utils/helpers";
import { Picker } from "@react-native-picker/picker";
import { Image } from "expo-image";
import { Eye, EyeOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = { type: "error" | "success"; text: string };

const StaffProfile = () => {
  const { avatar, initials, handleSignout } = useAuthContext();

  const [initialProfile, setInitialProfile] = useState<UserType | null>(null);

  const [username, setUsername] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileMessage, setProfileMessage] = useState<Message | null>(null);

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [passwordMessage, setPasswordMessage] = useState<Message | null>(null);

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const response = await api.get("/user/profile");
        const profileData: UserType = response.data;

        setInitialProfile(profileData);
        setUsername(profileData?.username || "");
        setDepartment(
          profileData?.department === "Unassigned"
            ? ""
            : profileData?.department || "",
        );
      } catch (error) {
        console.error("Failed to fetch profile");
      }
    };

    fetchProfile();
  }, []);

  const memberSince = initialProfile?.created_at
    ? new Date(initialProfile.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const handleProfileSubmit = async (): Promise<void> => {
    setProfileMessage(null);
    setIsSavingProfile(true);

    try {
      await api.patch("/user/update-profile", { username, department });

      const { error: supabaseError } = await supabase.auth.updateUser({
        data: {
          username: username,
          department: department,
        },
      });

      if (supabaseError) {
        console.error("Failed to update metadata:", supabaseError);
      }

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
    <SafeAreaView>
      <View>
        <View>
          <Text>Profile</Text>
          <Text>Manage your account details and password.</Text>
        </View>

        <View>
          <View>
            <View>
              {avatar ? (
                <Image
                  source={avatar}
                  alt={initialProfile?.username || "Avatar"}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                  contentFit="cover"
                />
              ) : (
                <Text>{initials}</Text>
              )}

              <View>
                <Text>{initialProfile?.username}</Text>
                <View>
                  <Text>{initialProfile?.role_name}</Text>
                  <Text>
                    <Text />
                    {initialProfile?.status}
                  </Text>
                </View>
                {memberSince && <Text>Member since {memberSince}</Text>}
                <View>
                  <TouchableOpacity onPress={handleSignout}>
                    <Text>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View>
              <Text>Username</Text>
              <TextInput
                value={username}
                placeholder="Famuyiwa Emmanuel"
                onChangeText={setUsername}
              />
            </View>

            <View>
              <Text>Email</Text>
              <TextInput
                value={initialProfile?.email}
                placeholder="email@address.com"
                editable={false}
              />
            </View>

            <View>
              <Text>Department</Text>
              <Picker onValueChange={setDepartment} selectedValue={department}>
                <Picker.Item
                  label="Select a department"
                  value=""
                  enabled={false}
                />
                {DEPARTMENTS.map((dept) => (
                  <Picker.Item label={dept} value={dept} key={dept} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              onPress={handleProfileSubmit}
              disabled={isSavingProfile}
            >
              <Text>{isSavingProfile ? "Saving..." : "Save changes"}</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Text>Change password</Text>

            <View>
              <Text>New password</Text>
              <View className="relative">
                <TextInput
                  value={newPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                />
                <Pressable onPress={() => setShowNewPassword((show) => !show)}>
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Pressable>
              </View>
            </View>

            <View>
              <Text>Confirm new password</Text>
              <View className="relative">
                <TextInput
                  value={confirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                />
                <Pressable onPress={() => setShowNewPassword((show) => !show)}>
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Pressable>
              </View>
            </View>

            <TouchableOpacity
              onPress={handlePasswordSubmit}
              disabled={isSavingPassword}
            >
              <Text>
                {isSavingPassword ? "Updating..." : "Update password"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StaffProfile;
