"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { ProfileType, UserType } from "@/lib/types";
import { useEffect } from "react";

const UserClientPage = ({ initialUsers }: { initialUsers: UserType[] }) => {
  return (
    <div>
      <h1>This is the users page</h1>
      {initialUsers.map((profile) => (
        <div key={profile.id}>
          <div>{profile.username}</div>
          <div>{profile.department}</div>
          <div>{profile.role_name}</div>
        </div>
      ))}
    </div>
  );
};

export default UserClientPage;
