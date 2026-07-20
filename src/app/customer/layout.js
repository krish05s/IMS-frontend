"use client";
import CustomerSidebar from "./components/CustomerSidebar";
import Topbar from "../components/Topbar";

export default function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 h-screen overflow-y-auto overflow-x-hidden scrollbar-hide">
        <Topbar />
        <div className="p-3 sm:p-4 md:p-8 pt-20 md:pt-24 min-h-screen w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
