import { fetchFromGo } from "@/lib/api-server";
import ProfileClient from "./ProfileClient";
import { UserType } from "@/lib/types";

const ProfilePage = async () => {
  const profile = (await fetchFromGo("/user/profile")) as UserType;

  return <ProfileClient initialProfile={profile} />;
};

export default ProfilePage;
