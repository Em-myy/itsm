"use client";

import { useAuth } from "@/context/AuthContext";

interface RoleType {
  id: Number;
  name: string;
  description: string;
}

const Navbar = () => {
  const { avatar, initials, displayName, role } = useAuth();

  return (
    <div className="w-5xl">
      <div className="flex justify-between">
        <div>Search Tickets</div>
        <div className="flex gap-1">
          <h2>{role?.name}</h2>
          <div>
            {avatar ? (
              <img src={avatar} alt={displayName} />
            ) : (
              <div>{initials}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
