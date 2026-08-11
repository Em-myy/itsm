"use client";

import { useAuth } from "@/context/AuthContext";

const HomePage = () => {
  const { user } = useAuth();
  return (
    <div>
      <h1>This is the home page</h1>
      <h2>Welcome {user?.user_metadata?.username}</h2>
      <p>{user?.user_metadata?.department}</p>
    </div>
  );
};

export default HomePage;
