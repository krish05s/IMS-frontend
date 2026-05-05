"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TruckPageTransition() {

  const pathname = usePathname();

  /* disable loader for some routes */
  const NO_LOADER_ROUTES = [
    "/",
    "/auth/login",
    "/signin"
  ];

  const disableLoader = NO_LOADER_ROUTES.includes(pathname);

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (disableLoader) {
      setLoading(false);
      document.body.style.overflow = "auto";
      return;
    }

    // ✅ START LOADING
    setLoading(true);
    document.body.style.overflow = "hidden";

    // ✅ STOP LOADING
    const timer = setTimeout(() => {
      setLoading(false);
      document.body.style.overflow = "auto";
    }, 600);

    return () => clearTimeout(timer);

  }, [pathname, disableLoader]);

  if (!loading || disableLoader) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-md transition-all duration-300 pointer-events-none">
      
      {/* Truck Animation */}
      <div className="relative flex justify-center items-end mb-2" style={{ width: '120px', height: '64px' }}>
        <div className="absolute bottom-0 left-1/2 w-[300px] h-[160px] -translate-x-1/2 scale-[0.4] origin-bottom">

          {/* Road */}
          <div className="absolute bottom-0 w-full h-2 bg-slate-800/60 overflow-hidden rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            <div className="w-1/3 h-full bg-slate-300 rounded-full animate-[roadMove_0.8s_linear_infinite]" />
            <div className="absolute top-0 w-1/4 h-full bg-slate-400 rounded-full animate-[roadMove_0.8s_linear_infinite_0.4s]" />
          </div>

          {/* Truck */}
          <div className="absolute bottom-2 left-[45px] flex items-end animate-[truckBounce_0.4s_ease-in-out_infinite]">

            {/* Trailer */}
            <div className="relative w-[150px] h-[100px] bg-slate-800 rounded-tl-2xl rounded-tr-md border-b-8 border-slate-900 shadow-2xl overflow-hidden flex flex-col justify-end">
              <div className="w-full bg-gradient-to-t from-orange-600 to-orange-400 animate-[fillUp_2.5s_ease-in-out_infinite] origin-bottom opacity-90 shadow-inner"></div>

              <div className="absolute top-0 left-0 w-full h-full border-2 border-slate-700 opacity-20 rounded-tl-xl"></div>

              {/* Wheels */}
              <div className="absolute -bottom-3 left-4 w-10 h-10 bg-slate-200 rounded-full border-[5px] border-slate-900 animate-[spin_0.6s_linear_infinite] flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 rounded-full border-[4px] border-slate-700 border-dashed"></div>
              </div>
              <div className="absolute -bottom-3 left-20 w-10 h-10 bg-slate-200 rounded-full border-[5px] border-slate-900 animate-[spin_0.6s_linear_infinite] flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 rounded-full border-[4px] border-slate-700 border-dashed"></div>
              </div>
            </div>

            {/* Cab */}
            <div className="relative w-[60px] h-[85px] bg-gradient-to-b from-orange-500 to-orange-700 rounded-tr-[1.5rem] rounded-br-lg border-b-8 border-orange-900 shadow-xl z-10">

              {/* Window */}
              <div className="absolute top-3 right-1 w-8 h-12 bg-gradient-to-tr from-sky-300 to-sky-100 rounded-tr-xl rounded-bl-sm border-2 border-orange-800 shadow-inner"></div>

              {/* Headlight */}
              <div className="absolute bottom-4 right-[-3px] w-4 h-5 bg-yellow-300 rounded-r-md shadow-[5px_0_20px_rgba(253,224,71,0.9)] animate-pulse"></div>

              {/* Wheel */}
              <div className="absolute -bottom-3 right-2 w-10 h-10 bg-slate-200 rounded-full border-[5px] border-slate-900 animate-[spin_0.6s_linear_infinite] flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 rounded-full border-[4px] border-slate-700 border-dashed"></div>
              </div>
            </div>

          </div>

          {/* Smoke */}
          <div className="absolute bottom-10 left-[21px] w-5 h-5 bg-white/60 rounded-full animate-[smoke_1.5s_linear_infinite]"></div>
          <div className="absolute bottom-14 left-[29px] w-8 h-8 bg-white/50 rounded-full animate-[smoke_1.5s_linear_infinite_0.4s]"></div>
          <div className="absolute bottom-8 left-[6px] w-6 h-6 bg-white/40 rounded-full animate-[smoke_1.5s_linear_infinite_0.8s]"></div>

        </div>
      </div>

      {/* Message */}
      <div className="bg-blue-600/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-blue-400/30 shadow-lg scale-90">
        <p className="text-blue-700 font-bold text-lg tracking-wide animate-pulse">
          Loading...
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes roadMove {
          0% { transform: translateX(300px); }
          100% { transform: translateX(-150px); }
        }
        @keyframes fillUp {
          0% { height: 0%; opacity: 0.5; }
          40% { height: 85%; opacity: 1; }
          60% { height: 85%; opacity: 1; }
          100% { height: 0%; opacity: 0.5; }
        }
        @keyframes smoke {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50px, -50px) scale(3.5); opacity: 0; }
        }
        @keyframes truckBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

    </div>
  );
}