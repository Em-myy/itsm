"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/src/lib/axios";
import { useEffect, useState } from "react";

interface RoleType {
  id: Number;
  name: string;
  description: string;
}

const Navbar = () => {
  const [role, setRole] = useState<RoleType | null>(null);
  const { avatar, initials } = useAuth();

  useEffect(() => {
    const fetchRoles = async (): Promise<void> => {
      try {
        const response = await api.get("/role");
        setRole(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchRoles();
  }, []);
  return (
    <div className="w-5xl">
      <div className="flex justify-between">
        <div>Search Tickets</div>
        <div className="flex gap-1">
          <h2>{role?.name}</h2>
          <div>{avatar ? <div>{avatar}</div> : <div>{initials}</div>}</div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
