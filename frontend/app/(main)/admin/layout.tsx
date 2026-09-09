import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal - IT Service Management",
  description: "A Web-App for the IT Department",
};

export default function MainLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div>{children}</div>
    </div>
  );
}
