"use client";

import { useAuth } from "@/context/AuthContext";
import api from "@/src/lib/axios";
import { BookingType, DEPARTMENTS, TicketType } from "@/src/lib/types";
import { useEffect, useMemo, useState } from "react";

const AdminHomePage = () => {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [bookings, setBookings] = useState<BookingType[]>([]);

  useEffect(() => {
    const getTickets = async (): Promise<void> => {
      try {
        const response = await api.get("/tickets");
        setTickets(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const getBookings = async (): Promise<void> => {
      try {
        const response = await api.get("/bookings");
        setBookings(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getTickets();
    getBookings();
  }, []);

  const departmentCounts = useMemo(() => {
    return DEPARTMENTS.map((department) => ({
      department,
      count: tickets.filter((ticket) => ticket.department === department)
        .length,
    }));
  }, [tickets]);

  const maxCount = Math.max(...departmentCounts.map((item) => item.count), 1);

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  return (
    <div>
      <h1>
        {greeting} {user?.user_metadata?.username}
      </h1>
      <div>
        <h3>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </h3>
        <p>{user?.user_metadata?.department}</p>
      </div>

      <div>
        <div>
          <h1>
            {tickets.filter((ticket) => ticket.status !== "Resolved").length}
          </h1>
          <p>Open tickets</p>
        </div>

        <div>
          <h1>
            {bookings.filter((booking) => booking.status === "Pending").length}
          </h1>
          <p>Bookings awaiting approval</p>
        </div>
      </div>

      <div>
        <h1>Tickets by department</h1>
        {departmentCounts.map(({ department, count }) => (
          <div key={department} className="flex items-center gap-4">
            <span className="w-40">{department}</span>

            <div className="flex-1 h-3 rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#B17A27]"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>

            <span className="w-6">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHomePage;
