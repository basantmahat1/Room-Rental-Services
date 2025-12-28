import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
      {/* ===================== Scoped Styles ===================== */}
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes radarPulse {
            0% { transform: scale(0.6); opacity: 0.7; }
            70% { transform: scale(2.5); opacity: 0; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          @keyframes dotPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.4); opacity: 0.6; }
          }

          .bg-animated-gradient {
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, #1A2B3C, #0D1F2C, #12344F, #1A2B3C);
            background-size: 400% 400%;
            animation: gradientBG 20s ease infinite;
            z-index: -1;
          }
          .radar-pulse { 
            animation: radarPulse 2.5s infinite; 
            border-width: 2px;
          }
          .animate-float { 
            animation: float 2s ease-in-out infinite; 
          }
          .glow {
            filter: drop-shadow(0 0 10px #00BFA5) drop-shadow(0 0 20px #00FFE0);
          }
        `}
      </style>

      {/* Background Layer */}
      <div className="bg-animated-gradient"></div>

      {/* ====================== ROOM FINDER LOADER ====================== */}
      <div className="relative flex flex-col items-center justify-center">

        {/* Radar Circle */}
        <div className="relative w-64 h-40 flex items-center justify-center">
          <span className="absolute w-36 h-36 rounded-full border border-[#00BFA5]/50 radar-pulse"></span>
          <span className="absolute w-36 h-36 rounded-full border border-[#00BFA5]/30 radar-pulse" style={{ animationDelay: '0.5s' }}></span>
          <span className="absolute w-36 h-36 rounded-full border border-[#00FFE0]/20 radar-pulse" style={{ animationDelay: '1s' }}></span>

          {/* Center Home Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-[#00BFA5] animate-float glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l7-7 7 7v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7z" />
          </svg>
        </div>

        {/* Floating Location Pins (around home icon) */}
        <div className="absolute w-64 h-64">
          <div className="absolute top-1/4 left-1/4 w-4 h-4 text-[#00FFE0] animate-float glow">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4.5 8-10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 5.5 8 10 8 10z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3z" />
            </svg>
          </div>
          <div className="absolute top-1/3 right-1/4 w-4 h-4 text-[#00BFA5] animate-float glow" style={{ animationDelay: '0.3s' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4.5 8-10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 5.5 8 10 8 10z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3z" />
            </svg>
          </div>
          <div className="absolute bottom-1/4 left-1/2 w-4 h-4 text-[#00FFA5] animate-float glow" style={{ animationDelay: '0.6s' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4.5 8-10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 5.5 8 10 8 10z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.656 0 3-1.344 3-3s-1.344-3-3-3-3 1.344-3 3 1.344 3 3 3z" />
            </svg>
          </div>
        </div>

        {/* Loading Text */}
        <p className="mt-8 text-white/80 text-sm font-semibold animate-pulse text-center tracking-wide">
          Searching rooms near you...
        </p>
      </div>
    </div>
  );
};

export default Loader;