"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const supabase = createClient();
  const router = useRouter();

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log(error);
    }
    router.push("/");
  };
  return (
    <div>
      <h1>This is the home page</h1>
      <button type="button" onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
};

export default HomePage;
