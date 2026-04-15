
import React from 'react';
import { Clapperboard } from 'lucide-react';

interface CinemaHallProps {
  children: React.ReactNode;
  isResult?: boolean;
}

const CinemaHall: React.FC<CinemaHallProps> = ({ children, isResult }) => {
  return (
    <div className="relative w-full max-w-6xl mx-auto min-h-[600px] flex flex-col items-center overflow-hidden">
      {/* Dynamic Background Lighting */}
      <div className={`absolute top-0 inset-x-0 h-[500px] spotlight pointer-events-none z-0 transition-opacity duration-1000 ${isResult ? 'opacity-40' : 'opacity-20'}`}></div>
      
      {/* Upper Header */}
      <div className="relative z-10 w-full pt-6 px-4">
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-red-600/10 rounded-full border border-red-600/20">
              <Clapperboard className="text-red-600 w-8 h-8 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter text-center">
              سينما <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">كاشف الأفلام</span>
            </h1>
          </div>
          <p className="text-gray-400 text-lg md:text-xl font-medium tracking-wide">
            مستقبلك السينمائي يبدأ بلقطة أو وصف
          </p>
        </div>

        {/* The Main Stage (Screen) */}
        <div className={`relative w-full transition-all duration-700 ease-out 
          ${isResult ? 'scale-105 shadow-[0_0_100px_rgba(220,38,38,0.1)]' : 'scale-100'}`}>
          
          {/* Cinema Curtains (Decorative edges) */}
          <div className="absolute top-0 left-0 w-8 md:w-16 h-full bg-gradient-to-r from-black via-red-950/20 to-transparent z-30 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-8 md:w-16 h-full bg-gradient-to-l from-black via-red-950/20 to-transparent z-30 pointer-events-none"></div>

          <div className="relative w-full bg-black/80 backdrop-blur-md border-y-2 border-red-900/50 rounded-2xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center p-6 md:p-12 transition-all">
            {/* Screen Reflection Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-40 shadow-[0_0_20px_rgba(239,68,68,0.4)]"></div>
            
            <div className="w-full max-w-3xl relative z-20">
              {children}
            </div>
          </div>
        </div>

        {/* Cinema Seats (Visual Flair) */}
        <div className="mt-16 w-full flex justify-center gap-2 md:gap-4 opacity-10 select-none pointer-events-none px-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 max-w-[40px] h-6 bg-red-900 rounded-t-lg border-b-4 border-black"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CinemaHall;