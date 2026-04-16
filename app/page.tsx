'use client';

import { useEffect, useState, useMemo } from 'react';

interface Duty {
  id: number;
  day: string;
  nr: string;
  time: string;
  zielony: string;
  fiolet: string;
  poma: string;
  undrg: string;
  zolty: string;
  czerw: string;
  nieb: string;
  parter: string;
  sg: string;
  obiad: string;
}

const dayNameMap: Record<string, string> = {
  'poniedzialek': 'Poniedziałek',
  'wtorek': 'Wtorek',
  'sroda': 'Środa',
  'czwartek': 'Czwartek',
  'piatek': 'Piątek'
};

const dayIdMap = ['niedziela', 'poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek', 'sobota'];

export default function PublicPage() {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [currentDayId, setCurrentDayId] = useState<string>('poniedzialek');
  const [timer, setTimer] = useState({ label: '', countdown: '00:00', progress: 0, visible: false, isLesson: false });

  const fetchDuties = async () => {
    try {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      setDuties(data);
    } catch (error) {
      console.error('Failed to fetch duties:', error);
    }
  };

  useEffect(() => {
    fetchDuties();
    const interval = setInterval(fetchDuties, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const todayIndex = new Date().getDay();
    const defaultDayId = (todayIndex === 0 || todayIndex === 6) ? 'poniedzialek' : dayIdMap[todayIndex];
    setCurrentDayId(defaultDayId);
  }, []);

  const filteredDuties = useMemo(() => {
    return duties.filter(d => d.day === currentDayId);
  }, [duties, currentDayId]);

  useEffect(() => {
    const updateState = () => {
      const now = new Date();
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      
      let activeFound = false;
      let previousBreakEnd: number | null = null;

      if (filteredDuties.length === 0) {
        setTimer(prev => ({ ...prev, visible: false }));
        return;
      }

      // Check first break start
      const firstRow = filteredDuties[0];
      const [firstStartStr] = firstRow.time.split('-');
      const firstMatch = firstStartStr.match(/(\d{1,2}):(\d{2})/);
      let firstBreakStart = 8 * 60;
      if (firstMatch) {
        firstBreakStart = parseInt(firstMatch[1], 10) * 60 + parseInt(firstMatch[2], 10);
      }

      if (currentTimeInMinutes < firstBreakStart) {
        const lessonStart = 8 * 60;
        updateTimer(lessonStart, firstBreakStart, true);
        activeFound = true;
      } else {
        for (let i = 0; i < filteredDuties.length; i++) {
          const row = filteredDuties[i];
          const parts = row.time.split('-');
          if (parts.length < 2) continue;

          const startMatch = parts[0].match(/(\d{1,2}):(\d{2})/);
          const endMatch = parts[1].match(/(\d{1,2}):(\d{2})/);

          if (startMatch && endMatch) {
            const startTimeInMinutes = parseInt(startMatch[1], 10) * 60 + parseInt(startMatch[2], 10);
            const endTimeInMinutes = parseInt(endMatch[1], 10) * 60 + parseInt(endMatch[2], 10);

            if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
              updateTimer(startTimeInMinutes, endTimeInMinutes, false);
              activeFound = true;
              break;
            }

            if (previousBreakEnd !== null) {
              if (currentTimeInMinutes >= previousBreakEnd && currentTimeInMinutes < startTimeInMinutes) {
                updateTimer(previousBreakEnd, startTimeInMinutes, true);
                activeFound = true;
                break;
              }
            }
            previousBreakEnd = endTimeInMinutes;
          }
        }
      }

      if (!activeFound) {
        setTimer(prev => ({ ...prev, visible: false }));
      }
    };

    const updateTimer = (startTimeInMinutes: number, endTimeInMinutes: number, isLesson: boolean) => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      
      const startTotalSeconds = startTimeInMinutes * 60;
      const endTotalSeconds = endTimeInMinutes * 60;
      const currentTotalSeconds = currentMinutes * 60 + currentSeconds;
      
      const totalDurationSeconds = endTotalSeconds - startTotalSeconds;
      const elapsedSeconds = currentTotalSeconds - startTotalSeconds;
      const remainingSeconds = endTotalSeconds - currentTotalSeconds;

      if (remainingSeconds <= 0) {
        setTimer({
          label: isLesson ? "LEKCJA TRWA:" : "PRZERWA TRWA:",
          countdown: "00:00",
          progress: 100,
          visible: true,
          isLesson
        });
        return;
      }

      const percentage = Math.min(100, Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100));
      const m = Math.floor(remainingSeconds / 60);
      const s = remainingSeconds % 60;
      
      setTimer({
        label: isLesson ? "LEKCJA TRWA:" : "PRZERWA TRWA:",
        countdown: `${m}:${s < 10 ? '0' + s : s}`,
        progress: percentage,
        visible: true,
        isLesson
      });
    };

    const timerInterval = setInterval(updateState, 1000);
    updateState();
    return () => clearInterval(timerInterval);
  }, [filteredDuties]);

  // Determine which row is highlighted
  const highlightedRowId = useMemo(() => {
    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Logic similar to updateState but returns row ID
    const firstRow = filteredDuties[0];
    if (!firstRow) return null;
    const [firstStartStr] = firstRow.time.split('-');
    const firstMatch = firstStartStr.match(/(\d{1,2}):(\d{2})/);
    let firstBreakStart = 8 * 60;
    if (firstMatch) {
      firstBreakStart = parseInt(firstMatch[1], 10) * 60 + parseInt(firstMatch[2], 10);
    }

    if (currentTimeInMinutes < firstBreakStart) return firstRow.id;

    let previousBreakEnd: number | null = null;
    let previousRowId: number | null = null;

    for (const row of filteredDuties) {
      const parts = row.time.split('-');
      if (parts.length < 2) continue;
      const startMatch = parts[0].match(/(\d{1,2}):(\d{2})/);
      const endMatch = parts[1].match(/(\d{1,2}):(\d{2})/);

      if (startMatch && endMatch) {
        const startTimeInMinutes = parseInt(startMatch[1], 10) * 60 + parseInt(startMatch[2], 10);
        const endTimeInMinutes = parseInt(endMatch[1], 10) * 60 + parseInt(endMatch[2], 10);

        if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
          return row.id;
        }

        if (previousBreakEnd !== null && currentTimeInMinutes >= previousBreakEnd && currentTimeInMinutes < startTimeInMinutes) {
          return previousRowId;
        }
        previousBreakEnd = endTimeInMinutes;
        previousRowId = row.id;
      }
    }
    return null;
  }, [filteredDuties]);

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center p-5 font-inter bg-[radial-gradient(#bbf7d0_1px,transparent_1px)] bg-[length:30px_30px]">
      <div id="device-screen" className="w-[640px] h-[500px] bg-white relative flex flex-col overflow-hidden shadow-[0_10px_40px_rgba(34,197,94,0.2)] border-8 border-[#22c55e] rounded-xl shrink-0">
        <div id="content-area" className="w-full h-[470px] overflow-hidden p-[6px] flex flex-col z-10">
          
          <div className="flex items-center justify-between gap-2 mb-2 bg-white p-1 px-3 rounded-lg shadow-md border-2 border-green-100 min-h-[3rem] shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
                <path d="M12,7L14,12L19,14L14,16L12,21L10,16L5,14L10,12L12,7M12,3.5L9.5,9.5L3.5,12L9.5,14.5L12,20.5L14.5,14.5L20.5,12L14.5,9.5L12,3.5Z" />
              </svg>
            </div>

            <div className="flex items-center gap-2 z-10">
              <span className="text-2xl">🌸</span>
              <div id="current-day-title" className="uppercase tracking-wide whitespace-nowrap pt-1 font-impact text-[22px] font-bold text-[#15803d]">
                DYŻURY: {dayNameMap[currentDayId]?.toUpperCase() || 'ŁADOWANIE...'}
              </div>
            </div>

            {timer.visible && (
              <div id="timer-container" className="flex items-center gap-3 flex-grow justify-end z-10">
                <div className="flex flex-col items-end leading-none">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${timer.isLesson ? 'text-green-700' : 'text-orange-600'}`}>
                    {timer.label}
                  </span>
                  <span className="text-lg font-mono font-bold text-gray-800">{timer.countdown}</span>
                </div>
                
                <div className="w-28 bg-green-50 rounded-full h-3 overflow-hidden border border-green-100 shadow-inner">
                  <div 
                    className={`h-full rounded-full spring-stripe ${timer.isLesson ? 'bg-green-500' : 'bg-orange-400'}`} 
                    style={{ width: `${timer.progress}%`, transition: 'width 1s linear' }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <main className="bg-white/90 rounded-lg shadow-lg overflow-hidden border border-green-100 flex-grow relative backdrop-blur-sm">
            <div className="h-full w-full overflow-auto">
              <table className="w-full text-gray-700 border-collapse table-fixed">
                <thead className="text-white uppercase tracking-wider sticky top-0 z-10 shadow-sm text-[8px] bg-[#166534]">
                  <tr>
                    <th className="w-[18px] p-[1px_2px] bg-[#15803d] rounded-tl-lg">Nr</th>
                    <th className="w-[35px] p-[1px_2px] bg-[#166534]">Czas</th>
                    <th className="p-[1px_2px] bg-[#166534]">Zielony</th>
                    <th className="p-[1px_2px] bg-[#9333ea]">Fiolet</th>
                    <th className="p-[1px_2px] bg-[#ea580c]">Poma.</th>
                    <th className="p-[1px_2px] bg-gray-500">Undrg.</th>
                    <th className="p-[1px_2px] bg-[#eab308] text-[#422006] font-bold">Żółty</th>
                    <th className="p-[1px_2px] bg-[#dc2626]">Czerw.</th>
                    <th className="p-[1px_2px] bg-[#0284c7]">Nieb.</th>
                    <th className="p-[1px_2px] bg-gray-500">Parter</th>
                    <th className="p-[1px_2px] bg-gray-500">SG</th>
                    <th className="w-[45px] p-[1px_2px] bg-gray-600 rounded-tr-lg">Obiad</th>
                  </tr>
                </thead>
                <tbody className="text-[9px]">
                  {filteredDuties.map((row) => (
                    <tr 
                      key={row.id} 
                      className={`
                        ${highlightedRowId === row.id ? 'animate-[pulse-spring_3s_infinite_ease-in-out] font-bold border-l-4 border-[#22c55e] bg-[#dcfce7]' : 'odd:bg-[#f7fee7] even:bg-white'}
                        border-b border-[#f0fdf4]
                      `}
                    >
                      <td className={`p-[1px_2px] text-center ${highlightedRowId === row.id ? 'text-[#14532d]' : 'text-green-600 font-bold'}`}>{row.nr}</td>
                      <td className="p-[1px_2px] text-center font-medium">{row.time}</td>
                      <Cell text={row.zielony} highlighted={highlightedRowId === row.id} />
                      <Cell text={row.fiolet} highlighted={highlightedRowId === row.id} />
                      <Cell text={row.poma} highlighted={highlightedRowId === row.id} />
                      <Cell text={row.undrg} highlighted={highlightedRowId === row.id} />
                      <Cell text={row.zolty} highlighted={highlightedRowId === row.id} />
                      <Cell text={row.czerw} highlighted={highlightedRowId === row.id} />
                      <Cell text={row.nieb} highlighted={highlightedRowId === row.id} />
                      <Cell text={row.parter} highlighted={highlightedRowId === row.id} />
                      <Cell text={row.sg} highlighted={highlightedRowId === row.id} />
                      <Cell text={row.obiad} highlighted={highlightedRowId === row.id} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>

        <div id="safe-margin" className="h-[30px] w-full bg-[repeating-linear-gradient(45deg,#22c55e,#22c55e_10px,#86efac_10px,#86efac_20px)] opacity-90"></div>
      </div>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @font-face {
          font-family: 'Impact';
          src: local('Impact');
        }

        .font-impact {
          font-family: Impact, "Arial Black", sans-serif;
        }

        @keyframes pulse-spring {
          0%, 100% { background-color: #f0fdf4; border-left-color: #22c55e; box-shadow: inset 0 0 10px rgba(34, 197, 94, 0.1); }
          50% { background-color: #dcfce7; border-left-color: #16a34a; box-shadow: inset 0 0 15px rgba(34, 197, 94, 0.3); }
        }

        .spring-stripe {
          background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.4) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.4) 75%, transparent 75%, transparent);
          background-size: 20px 20px;
          animation: move-stripes 1.5s linear infinite;
        }

        @keyframes move-stripes {
          from { background-position: 0 0; }
          to { background-position: 20px 20px; }
        }
      `}</style>
    </div>
  );
}

function Cell({ text, highlighted }: { text: string; highlighted: boolean }) {
  const isEmpty = text === "-" || text.trim() === "";
  return (
    <td className={`p-[1px_2px] text-center break-words overflow-hidden ${isEmpty ? 'text-[#cbd5e1] text-[8px]' : highlighted ? 'text-[#14532d]' : ''}`}>
      {text}
    </td>
  );
}
