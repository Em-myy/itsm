import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "IT Service Management",
  description: "A Web-App for the IT Department",
};

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-full flex">
      <AuthProvider>
        <Sidebar />
        {children}
      </AuthProvider>
    </div>
  );
}
