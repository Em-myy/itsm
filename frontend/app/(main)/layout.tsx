import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { SidebarProvider } from "@/context/SidebarContext";

export const metadata: Metadata = {
  title: "IT Service Management",
  description: "A Web-App for the IT Department",
};

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
