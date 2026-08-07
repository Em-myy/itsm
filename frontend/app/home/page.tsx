"use client";

import { useAuth } from "@/context/AuthContext";

const HomePage = () => {
  const { handleSignout, user } = useAuth();
  return (
    <div>
      <h1>This is the home page</h1>
      <h2>Welcome {user?.email}</h2>
      <button type="button" onClick={handleSignout}>
        Sign Out
      </button>
    </div>
  );
};

export default HomePage;
