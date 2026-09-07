import RealTimeActivityLog from "@/components/activity-log/RealTimeActivityLog";
import { fetchFromGo } from "@/lib/api-server";
import {
  AssetType,
  BookingType,
  DEPARTMENTS,
  TicketType,
  VenueType,
} from "@/lib/types";
import { formerTimeAgo } from "@/utils/format-date";
import { createClient } from "@/utils/supabase/server";

interface ActivityLog {
  id: number;
  action_message: string;
  created_at: string;
}

const AdminHomePage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    ticketResult,
    bookingResult,
    assetResult,
    venueResult,
    activityResult,
  ] = await Promise.allSettled([
    fetchFromGo("/tickets") as Promise<TicketType[]>,
    fetchFromGo("/bookings") as Promise<BookingType[]>,
    fetchFromGo("/assets") as Promise<AssetType[]>,
    fetchFromGo("/venues") as Promise<VenueType[]>,
    fetchFromGo("/activity") as Promise<ActivityLog[]>,
  ]);

  const tickets =
    ticketResult.status === "fulfilled" ? ticketResult.value || [] : [];

  const bookings =
    bookingResult.status === "fulfilled" ? bookingResult.value || [] : [];

  const assets =
    assetResult.status === "fulfilled" ? assetResult.value || [] : [];

  const venues =
    venueResult.status === "fulfilled" ? venueResult.value || [] : [];

  const activities =
    activityResult.status === "fulfilled" ? activityResult.value || [] : [];

  const formattedActivities = activities.map((log) => ({
    id: String(log.id),
    action: <span dangerouslySetInnerHTML={{ __html: log.action_message }} />,
    time: formerTimeAgo(log.created_at),
  }));

  const departmentCounts = DEPARTMENTS.map((department) => ({
    department,
    count: tickets.filter((ticket) => ticket.department === department).length,
  }));
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
            {
              tickets.filter(
                (ticket) =>
                  ticket.status !== "Resolved" && ticket.status !== "Cancelled",
              ).length
            }
          </h1>
          <p>Open tickets</p>
        </div>

        <div>
          <h1>
            {assets.filter((asset) => asset.status === "Maintenance").length}
          </h1>
          <p>Assets under maintenance</p>
        </div>

        <div>
          <h1>{venues.filter((venue) => venue.status === "Active").length}</h1>
          <p>Active venues</p>
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

      <div>
        <RealTimeActivityLog
          activities={formattedActivities}
          emptyFallback={
            <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center">
              <p className="text-sm text-body">No activities recorded yet.</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default AdminHomePage;
