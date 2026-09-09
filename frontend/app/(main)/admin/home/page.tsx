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
import DOMPurify from "isomorphic-dompurify";

interface ActivityLog {
  id: number;
  action_message: string;
  created_at: string;
}

const StatCard = ({
  value,
  label,
  tone = "default",
}: {
  value: number;
  label: string;
  tone?: "default" | "danger";
}): React.ReactElement => {
  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <p
        className={`font-serif text-4xl font-bold ${
          tone === "danger" ? "text-red-700" : "text-heading"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-body">{label}</p>
    </div>
  );
};

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
    action: (
      <span
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(log.action_message),
        }}
      />
    ),
    time: formerTimeAgo(log.created_at),
  }));

  const openTickets = tickets.filter(
    (ticket) => ticket.status !== "Resolved" && ticket.status !== "Cancelled",
  );

  const maintenanceAssets = assets.filter(
    (asset) => asset.status === "Maintenance",
  );

  const activeVenues = venues.filter((venue) => venue.status === "Active");

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "Pending",
  );

  const departmentCounts = DEPARTMENTS.map((department) => ({
    department,
    count: tickets.filter((ticket) => ticket.department === department).length,
  })).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...departmentCounts.map((item) => item.count), 1);

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-heading sm:text-4xl">
          {greeting} {user?.user_metadata?.username}
        </h1>

        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-body">
          <span>
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
          <span className="text-muted">&middot;</span>
          <span>{user?.user_metadata?.department}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          value={openTickets.length}
          label={openTickets.length <= 1 ? "Open ticket" : "Open tickets"}
        />
        <StatCard
          value={maintenanceAssets.length}
          label={
            maintenanceAssets.length <= 1
              ? "Asset under maintenance"
              : "Assets under maintenance"
          }
          tone="danger"
        />
        <StatCard
          value={activeVenues.length}
          label={activeVenues.length <= 1 ? "Active venue" : "Active venues"}
        />
        <StatCard
          value={pendingBookings.length}
          label={
            pendingBookings.length <= 1
              ? "Booking awaiting approval"
              : "Bookings awaiting approval"
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 h-fit">
          <h1 className="font-serif text-xl text-heading">
            Tickets by department
          </h1>

          <div className="mt-5 space-y-4">
            {departmentCounts.map(({ department, count }) => (
              <div key={department} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-sm text-body sm:w-32 md:w-36">
                  {department}
                </span>

                <div className="h-3 flex-1 rounded-full bg-input-bg">
                  <div
                    className="h-full rounded-full bg-chart-amber"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>

                <span className="w-6 shrink-0 text-right text-sm font-medium text-heading">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-heading">Recent activity</h2>
            <span className="text-xs text-muted">Live</span>
          </div>

          <div className="mt-5">
            <RealTimeActivityLog
              activities={formattedActivities}
              emptyFallback={
                <div className="rounded-xl border border-dashed border-line px-4 py-8 text-center">
                  <p className="text-sm text-body">
                    No activities recorded yet.
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
