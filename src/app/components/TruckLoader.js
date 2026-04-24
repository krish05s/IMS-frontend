import React from 'react';

const TruckLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/10 backdrop-blur-md transition-all duration-300 pointer-events-none">
      {/* Small Truck Animation Wrapper */}
      <div className="relative flex justify-center items-end mb-2" style={{ width: '120px', height: '64px' }}>
        {/* The actual realistic truck art scaled down and perfectly centered */}
        <div className="absolute bottom-0 left-1/2 w-[300px] h-[160px] -translate-x-1/2 scale-[0.4] origin-bottom">
          {/* Ground Line / Path */}
          <div className="absolute bottom-0 w-full h-2 bg-slate-800/60 overflow-hidden rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            <div className="w-1/3 h-full bg-slate-300 rounded-full animate-[roadMove_0.8s_linear_infinite]" />
            <div className="absolute top-0 w-1/4 h-full bg-slate-400 rounded-full animate-[roadMove_0.8s_linear_infinite_0.4s]" />
          </div>

          {/* The Truck */}
          <div className="absolute bottom-2 left-[45px] flex items-end animate-[truckBounce_0.4s_ease-in-out_infinite]">
            {/* Back Trailer */}
            <div className="relative w-[150px] h-[100px] bg-slate-800 rounded-tl-2xl rounded-tr-md border-b-8 border-slate-900 shadow-2xl overflow-hidden flex flex-col justify-end">
              {/* Filling Animation inside trailer */}
              <div className="w-full bg-gradient-to-t from-orange-600 to-orange-400 animate-[fillUp_2.5s_ease-in-out_infinite] origin-bottom opacity-90 shadow-inner"></div>

              {/* Trailer details */}
              <div className="absolute top-0 left-0 w-full h-full border-2 border-slate-700 opacity-20 rounded-tl-xl"></div>
              <div className="absolute top-3 left-3 w-2 h-20 bg-slate-700 rounded-full shadow-inner"></div>
              <div className="absolute top-3 left-8 w-2 h-20 bg-slate-700 rounded-full shadow-inner"></div>
              <div className="absolute top-3 left-13 w-2 h-20 bg-slate-700 rounded-full shadow-inner"></div>

              {/* Wheels inside Trailer context */}
              <div className="absolute -bottom-3 left-4 w-10 h-10 bg-slate-200 rounded-full border-[5px] border-slate-900 animate-[spin_0.6s_linear_infinite] flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 rounded-full border-[4px] border-slate-700 border-dashed"></div>
              </div>
              <div className="absolute -bottom-3 left-20 w-10 h-10 bg-slate-200 rounded-full border-[5px] border-slate-900 animate-[spin_0.6s_linear_infinite] flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 rounded-full border-[4px] border-slate-700 border-dashed"></div>
              </div>
            </div>

            {/* Front Cab */}
            <div className="relative w-[60px] h-[85px] bg-gradient-to-b from-orange-500 to-orange-700 rounded-tr-[1.5rem] rounded-br-lg border-b-8 border-orange-900 shadow-xl z-10">
              {/* Window */}
              <div className="absolute top-3 right-1 w-8 h-12 bg-gradient-to-tr from-sky-300 to-sky-100 rounded-tr-xl rounded-bl-sm border-2 border-orange-800 shadow-inner overflow-hidden">
                {/* Window reflection */}
                <div className="absolute top-1 right-2 w-3 h-12 bg-white/40 rounded-full transform rotate-12"></div>
              </div>
              {/* Headlight */}
              <div className="absolute bottom-4 right-[-3px] w-4 h-5 bg-yellow-300 rounded-r-md shadow-[5px_0_20px_rgba(253,224,71,0.9)] animate-pulse"></div>
              {/* Front Bumper */}
              <div className="absolute bottom-[-8px] right-[-5px] w-8 h-4 bg-slate-700 rounded-md shadow-md"></div>

              {/* Front Wheel */}
              <div className="absolute -bottom-3 right-2 w-10 h-10 bg-slate-200 rounded-full border-[5px] border-slate-900 animate-[spin_0.6s_linear_infinite] flex items-center justify-center shadow-lg">
                <div className="w-5 h-5 rounded-full border-[4px] border-slate-700 border-dashed"></div>
              </div>
            </div>
          </div>

          {/* Exhaust Fumes */}
          <div className="absolute bottom-10 left-[21px] w-5 h-5 bg-white/60 backdrop-blur-sm rounded-full animate-[smoke_1.5s_linear_infinite]"></div>
          <div className="absolute bottom-14 left-[29px] w-8 h-8 bg-white/50 backdrop-blur-sm rounded-full animate-[smoke_1.5s_linear_infinite_0.4s]"></div>
          <div className="absolute bottom-8 left-[6px] w-6 h-6 bg-white/40 backdrop-blur-sm rounded-full animate-[smoke_1.5s_linear_infinite_0.8s]"></div>
        </div>
      </div>

      {/* Message Box */}
      <div className="bg-blue-600/10 backdrop-blur-md px-6 py-2.5 rounded-full border border-blue-400/30 shadow-lg scale-90 flex items-center justify-center">
        <p className="text-blue-700 font-bold text-lg tracking-wide animate-pulse flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {message}
        </p>
      </div>

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
};

export default TruckLoader;
