"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
// --- SVG Icons ---
const Icons = {
<<<<<<< Updated upstream
  Dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  Gradations: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>,
  Products: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
  Purchase: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3.75 0h2.25m-2.25 0c0 .414.336.75.75.75s.75-.336.75-.75m-1.5 0c0-.414.336-.75.75-.75s.75.336.75.75m2.25 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-8.25-3h12a2.25 2.25 0 002.19-2.82l-1.5-6A2.25 2.25 0 0017.3 5.25H6.7a2.25 2.25 0 00-2.18 1.68l-1.5 6A2.25 2.25 0 005.21 15.75h3.04z" /></svg>,
  Sales: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
  Members: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  Setup: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
=======
  Dashboard: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  ),
  Gradations: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
      />
    </svg>
  ),
  Products: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
      />
    </svg>
  ),
  Purchase: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3.75 0h2.25m-2.25 0c0 .414.336.75.75.75s.75-.336.75-.75m-1.5 0c0-.414.336-.75.75-.75s.75.336.75.75m2.25 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-8.25-3h12a2.25 2.25 0 002.19-2.82l-1.5-6A2.25 2.25 0 0017.3 5.25H6.7a2.25 2.25 0 00-2.18 1.68l-1.5 6A2.25 2.25 0 005.21 15.75h3.04z"
      />
    </svg>
  ),
  Sales: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
      />
    </svg>
  ),
  Members: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  ),
>>>>>>> Stashed changes
};

// --- Reusable Navigation Link Component ---
function NavItem({ href, currentPath, onClick, icon, label }) {
  const isActive = currentPath === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-3 rounded-xl transition flex items-center gap-3 font-semibold ${
        isActive
          ? "bg-[#212121] text-white shadow-md shadow-orange-500/20"
          : "hover:bg-slate-200 hover:text-slate-900 text-slate-600"
      }`}
    >
      <div
        className={`w-5 h-5 flex items-center justify-center ${isActive ? "opacity-100" : "opacity-70"}`}
      >
        {icon}
      </div>
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("");

  // Decode JWT to get role and name on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role || "user");
        setUserName(
          payload.name || payload.username || payload.email || "User",
        );
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  return (
    <>
      {/* Mobile Hamburger Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Background Overlay (Mobile Only) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-slate-50 text-slate-700 border-r border-slate-200 p-5 z-50 shadow-sm transition-transform duration-300 md:translate-x-0 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-8 md:mb-6">
          <div className="flex justify-center items-center w-full">
            <img
              src="/FINAL_MICARA_LOGO_OPEN black.png"
              alt="Micara Logo"
              className="w-36 object-contain"
            />
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-slate-500 hover:text-red-500 bg-slate-200 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* --- STATIC MENU FOR BETTER PERFORMANCE --- */}
        <nav className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 pb-4">
          {/* Dashboard - Visible to admin, sales, purchase, user */}
          {(role === "admin" ||
            role === "sales" ||
            role === "purchase" ||
            role === "user") && (
            <NavItem
              href="/dashboard"
              currentPath={pathname}
              onClick={() => setIsOpen(false)}
              icon={Icons.Dashboard}
              label="Dashboard"
            />
          )}

          {/* Gradations - Visible to admin only */}
          {role === "admin" && (
            <NavItem
              href="/gradations"
              currentPath={pathname}
              onClick={() => setIsOpen(false)}
              icon={Icons.Gradations}
              label="Gradations"
            />
          )}

          {/* Products - Visible to admin, sales, purchase */}
          {(role === "admin" || role === "sales" || role === "purchase") && (
            <NavItem
              href="/products"
              currentPath={pathname}
              onClick={() => setIsOpen(false)}
              icon={Icons.Products}
              label="Products"
            />
          )}

          {/* Purchase - Visible to admin, purchase */}
          {(role === "admin" || role === "purchase") && (
            <NavItem
              href="/purchase"
              currentPath={pathname}
              onClick={() => setIsOpen(false)}
              icon={Icons.Purchase}
              label="Purchase"
            />
          )}

          {/* Sales - Visible to admin, sales */}
          {(role === "admin" || role === "sales") && (
            <NavItem
              href="/sales"
              currentPath={pathname}
              onClick={() => setIsOpen(false)}
              icon={Icons.Sales}
              label="Sales"
            />
          )}

          {/* Members - Visible to admin only */}
          {role === "admin" && (
            <NavItem
              href="/members"
              currentPath={pathname}
              onClick={() => setIsOpen(false)}
              icon={Icons.Members}
              label="Members"
            />
          )}
<<<<<<< Updated upstream
          {/* Setup - Visible to admin only */}
          {role === "admin" && (
            <NavItem href="/setup/parties" currentPath={pathname} onClick={() => setIsOpen(false)} icon={Icons.Setup} label="Setup" />
          )}
=======
>>>>>>> Stashed changes
        </nav>

        {/* User Details & Logout */}
        <div className="mt-auto pt-4 border-t border-slate-200">
          <div className="px-4 mb-4">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
              Logged in as
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center uppercase shrink-0">
                {userName ? userName.charAt(0) : "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-700 truncate">
                  {userName}
                </p>
                <p className="text-xs font-semibold text-orange-500 capitalize">
                  {role}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-semibold flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
<<<<<<< Updated upstream

// "use client";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useState, useEffect } from "react";

// // --- SVG Icons ---
// const Icons = {
//   Dashboard: (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth={1.5}
//       stroke="currentColor"
//       className="w-5 h-5"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
//       />
//     </svg>
//   ),
//   Gradations: (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth={1.5}
//       stroke="currentColor"
//       className="w-5 h-5"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
//       />
//     </svg>
//   ),
//   Products: (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth={1.5}
//       stroke="currentColor"
//       className="w-5 h-5"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
//       />
//     </svg>
//   ),
//   Purchase: (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth={1.5}
//       stroke="currentColor"
//       className="w-5 h-5"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3.75 0h2.25m-2.25 0c0 .414.336.75.75.75s.75-.336.75-.75m-1.5 0c0-.414.336-.75.75-.75s.75.336.75.75m2.25 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-8.25-3h12a2.25 2.25 0 002.19-2.82l-1.5-6A2.25 2.25 0 0017.3 5.25H6.7a2.25 2.25 0 00-2.18 1.68l-1.5 6A2.25 2.25 0 005.21 15.75h3.04z"
//       />
//     </svg>
//   ),
//   Sales: (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth={1.5}
//       stroke="currentColor"
//       className="w-5 h-5"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
//       />
//     </svg>
//   ),
//   Members: (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth={1.5}
//       stroke="currentColor"
//       className="w-5 h-5"
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
//       />
//     </svg>
//   ),
// };

// // --- Reusable Navigation Link Component ---
// function NavItem({ href, currentPath, onClick, icon, label }) {
//   const isActive = currentPath === href;
//   return (
//     <Link
//       href={href}
//       onClick={onClick}
//       className={`px-4 py-3 rounded-xl transition flex items-center gap-3 font-semibold ${
//         isActive
//           ? "bg-[#212121] text-white shadow-md shadow-orange-500/20"
//           : "hover:bg-slate-200 hover:text-slate-900 text-slate-600"
//       }`}
//     >
//       <div
//         className={`w-5 h-5 flex items-center justify-center ${isActive ? "opacity-100" : "opacity-70"}`}
//       >
//         {icon}
//       </div>
//       {label}
//     </Link>
//   );
// }

// export default function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const [isOpen, setIsOpen] = useState(false);
//   const [role, setRole] = useState(null);
//   const [userName, setUserName] = useState("");

//   // Decode JWT to get role and name on mount
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const payload = JSON.parse(atob(token.split(".")[1]));
//         setRole(payload.role || "user");
//         setUserName(
//           payload.name || payload.username || payload.email || "User",
//         );
//       } catch (e) {
//         console.error("Invalid token");
//       }
//     }
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("isLoggedIn");
//     router.push("/");
//   };

//   return (
//     <>
//       {/* Mobile Hamburger Trigger */}
//       <button
//         onClick={() => setIsOpen(true)}
//         className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
//       >
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           fill="none"
//           viewBox="0 0 24 24"
//           strokeWidth={2.5}
//           stroke="currentColor"
//           className="w-6 h-6"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
//           />
//         </svg>
//       </button>

//       {/* Background Overlay (Mobile Only) */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
//           onClick={() => setIsOpen(false)}
//         />
//       )}

//       {/* Sidebar Panel */}
//       <div
//         className={`fixed top-0 left-0 h-full w-64 bg-slate-50 text-slate-700 border-r border-slate-200 p-5 z-50 shadow-sm transition-transform duration-300 md:translate-x-0 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
//       >
//         <div className="flex justify-between items-center mb-8 md:mb-6">
//           <div className="flex justify-center items-center w-full">
//             <img
//               src="/FINAL_MICARA_LOGO_OPEN black.png"
//               alt="Micara Logo"
//               className="w-36 object-contain"
//             />
//           </div>

//           <button
//             onClick={() => setIsOpen(false)}
//             className="md:hidden p-2 text-slate-500 hover:text-red-500 bg-slate-200 rounded-md"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={2}
//               stroke="currentColor"
//               className="w-5 h-5"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M6 18L18 6M6 6l12 12"
//               />
//             </svg>
//           </button>
//         </div>

//         {/* --- STATIC MENU FOR BETTER PERFORMANCE --- */}
//         <nav className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 pb-4">
//           {/* Dashboard - Visible to admin, sales, purchase, user */}
//           {(role === "admin" ||
//             role === "sales" ||
//             role === "purchase" ||
//             role === "user") && (
//             <NavItem
//               href="/dashboard"
//               currentPath={pathname}
//               onClick={() => setIsOpen(false)}
//               icon={Icons.Dashboard}
//               label="Dashboard"
//             />
//           )}

//           {/* Gradations - Visible to admin only */}
//           {role === "admin" && (
//             <NavItem
//               href="/gradations"
//               currentPath={pathname}
//               onClick={() => setIsOpen(false)}
//               icon={Icons.Gradations}
//               label="Gradations"
//             />
//           )}

//           {/* Products - Visible to admin, sales, purchase */}
//           {(role === "admin" || role === "sales" || role === "purchase") && (
//             <NavItem
//               href="/products"
//               currentPath={pathname}
//               onClick={() => setIsOpen(false)}
//               icon={Icons.Products}
//               label="Products"
//             />
//           )}

//           {/* Purchase - Visible to admin, purchase */}
//           {(role === "admin" || role === "purchase") && (
//             <NavItem
//               href="/purchase"
//               currentPath={pathname}
//               onClick={() => setIsOpen(false)}
//               icon={Icons.Purchase}
//               label="Purchase"
//             />
//           )}

//           {/* Sales - Visible to admin, sales */}
//           {(role === "admin" || role === "sales") && (
//             <NavItem
//               href="/sales"
//               currentPath={pathname}
//               onClick={() => setIsOpen(false)}
//               icon={Icons.Sales}
//               label="Sales"
//             />
//           )}

//           {/* Members - Visible to admin only */}
//           {role === "admin" && (
//             <NavItem
//               href="/members"
//               currentPath={pathname}
//               onClick={() => setIsOpen(false)}
//               icon={Icons.Members}
//               label="Members"
//             />
//           )}
//         </nav>

//         {/* User Details & Logout */}
//         <div className="mt-auto pt-4 border-t border-slate-200">
//           <div className="px-4 mb-4">
//             <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">
//               Logged in as
//             </p>
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center uppercase shrink-0">
//                 {userName ? userName.charAt(0) : "U"}
//               </div>
//               <div className="overflow-hidden">
//                 <p className="text-sm font-bold text-slate-700 truncate">
//                   {userName}
//                 </p>
//                 <p className="text-xs font-semibold text-orange-500 capitalize">
//                   {role}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={handleLogout}
//             className="w-full text-left px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-semibold flex items-center justify-center gap-2"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={2}
//               stroke="currentColor"
//               className="w-5 h-5"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
//               />
//             </svg>
//             Logout
//           </button>
//         </div>
//       </div>
//     </>
//   );
// }
=======
>>>>>>> Stashed changes
