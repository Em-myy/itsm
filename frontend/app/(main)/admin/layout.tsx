import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IT Service Management",
  description: "A Web-App for the IT Department",
};

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-full flex">
      <div>{children}</div>
    </div>
  );
}
