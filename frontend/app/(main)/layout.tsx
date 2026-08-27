import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "IT Service Management",
  description: "A Web-App for the IT Department",
};

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-full flex">
      <Sidebar />
      <div>
        <Navbar />
        {children}
      </div>
    </div>
  );
}
