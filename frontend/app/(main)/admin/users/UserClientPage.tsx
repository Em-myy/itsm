"use client";

import { UserType } from "@/lib/types";

const UserClientPage = ({ initialUsers }: { initialUsers: UserType[] }) => {
  return (
    <div>
      <h1>This is the users page</h1>
      {initialUsers.map((user) => (
        <div key={user.id}>
          <div>{user.username}</div>
          <div>{user.email}</div>
          <div>{user.department}</div>
          <div>{user.role_name}</div>
        </div>
      ))}
    </div>
  );
};

export default UserClientPage;
