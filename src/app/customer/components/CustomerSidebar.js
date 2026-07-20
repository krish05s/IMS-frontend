"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Icons = {
  Dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  Products: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a2.25 2.25 0 012.25 2.25v6a2.25 2.25 0 01-2.25 2.25h-3a.75.75 0 01-.75-.75zM13.5 21v-7.5a.75.75 0 00-.75-.75h-3A2.25 2.25 0 007.5 15v6a2.25 2.25 0 002.25 2.25h3a.75.75 0 00.75-.75zM2.25 15A2.25 2.25 0 000 17.25v3.5A2.25 2.25 0 002.25 23h21A2.25 2.25 0 0025.5 20.75v-3.5A2.25 2.25 0 0023.25 15H2.25z" />
    </svg>
  ),
  Orders: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Cart: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
};

function NavItem({ href, currentPath, onClick, icon, label }) {
  const isActive = currentPath === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-3 rounded-xl transition flex items-center gap-3 font-semibold ${
        isActive
          ? "bg-[#212121] text-[#EADBC8] shadow-lg shadow-black/20"
          : "hover:bg-slate-200 hover:text-slate-900 text-slate-600"
      }`}
    >
      <div className={`w-5 h-5 flex items-center justify-center ${isActive ? "opacity-100" : "opacity-70"}`}>
        {icon}
      </div>
      {label}
    </Link>
  );
}

export default function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserName(payload.name || payload.email || "Customer");
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  useEffect(() => {
    const toggleSidebar = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggleSidebarToggle", toggleSidebar);
    return () => window.removeEventListener("toggleSidebarToggle", toggleSidebar);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-50 text-slate-700 border-r border-slate-200 p-5 z-50 shadow-sm flex flex-col
          transition-transform duration-300
          md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex justify-between items-center mb-8 md:mb-6">
          <div className="flex justify-center items-center w-full">
            <img src="/FINAL_MICARA_LOGO_OPEN black.png" alt="Micara Logo" className="w-36 object-contain" />
          </div>

          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-slate-500 hover:text-red-500 bg-slate-200 rounded-md">
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-3 flex-1 overflow-y-auto hide-scrollbar pr-2 pb-4">
          <NavItem href="/customer/dashboard" currentPath={pathname} onClick={() => setIsOpen(false)} icon={Icons.Dashboard} label="Dashboard" />
          <NavItem href="/customer/products" currentPath={pathname} onClick={() => setIsOpen(false)} icon={Icons.Products} label="Product Catalog" />

          <NavItem href="/customer/orders" currentPath={pathname} onClick={() => setIsOpen(false)} icon={Icons.Orders} label="My Orders" />
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-200">
          <div className="px-4 mb-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Logged in as</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full text-[#EADBC8] bg-[#212121] font-bold flex items-center justify-center uppercase shrink-0">
                {userName ? userName.charAt(0) : "C"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-700 truncate">{userName}</p>
                <p className="text-xs font-semibold text-[#C19A6B] capitalize">B2B Partner</p>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="w-full text-left px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-semibold flex items-center justify-center gap-2 cursor-pointer">
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
