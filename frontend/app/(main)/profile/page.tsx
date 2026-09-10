import { fetchFromGo } from "@/lib/api-server";
import { ProfileType } from "@/lib/types";
import ProfileClient from "./ProfileClient";
import { createClient } from "@/utils/supabase/server";

const ProfilePage = async () => {
  const supabase = await createClient();

  const [
    profileResponse,
    {
      data: { user },
    },
  ] = await Promise.all([
    fetchFromGo("/user/profile"),
    supabase.auth.getUser(),
  ]);

  const profile = profileResponse as ProfileType;
  const email = user?.email || "";
  const avatar =
    user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null;

  return (
    <ProfileClient initialProfile={profile} email={email} avatar={avatar} />
  );
};

export default ProfilePage;
