import { fetchFromGo } from "@/lib/api-server";
import { ProfileType } from "@/lib/types";
import ProfileClient from "./ProfileClient";
import { createClient } from "@/utils/supabase/server";

const ProfilePage = async () => {
  const supabase = createClient();

  const [
    profileResponse,
    {
      data: { user },
    },
  ] = await Promise.all([
    fetchFromGo("/profile"),
    (await supabase).auth.getUser(),
  ]);

  const profile = profileResponse as ProfileType;
  const email = user?.email || "";
  return <ProfileClient />;
};

export default ProfilePage;
