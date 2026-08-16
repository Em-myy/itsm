"use client";

import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { avatar, initials } = useAuth();
  return (
    <div className="w-5xl">
      <div className="flex justify-between">
        <div>Search Tickets</div>
        <div className="flex gap-1">
          <h2>Role</h2>
          <div>{avatar ? <div>{avatar}</div> : <div>{initials}</div>}</div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
