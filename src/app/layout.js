import { Inter } from "next/font/google";
import "./globals.css";
import ToastProvider from "./components/toastify";
import "react-toastify/dist/ReactToastify.css";
import TruckPageTransition from "./components/TruckPageTransition";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Micara IMS",
  description: "Inventory Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.className}`}>
      <body className="min-h-full flex flex-col bg-slate-50">

          {children}

      {/* ✅ mount loader separately */}
        <TruckPageTransition />
        <ToastProvider />
      </body>
    </html>
  );
}