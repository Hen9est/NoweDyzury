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
  const [timer, setTimer] = useState({ label: '', countdown: '00:00', progress: 0, visible: false, isLesson: false, currentTime: '' });

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
    const interval = setInterval(fetchDuties, 30000);
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
      const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let activeFound = false;
      let previousBreakEnd: number | null = null;

      if (filteredDuties.length === 0) {
        setTimer(prev => ({ ...prev, visible: false, currentTime: currentTimeStr }));
        return;
      }

      const firstRow = filteredDuties[0];
      const [firstStartStr] = (firstRow.time || "08:00-08:10").split('-');
      const firstMatch = firstStartStr.match(/(\d{1,2}):(\d{2})/);
      let firstBreakStart = 8 * 60;
      if (firstMatch) {
        firstBreakStart = parseInt(firstMatch[1], 10) * 60 + parseInt(firstMatch[2], 10);
      }

      if (currentTimeInMinutes < firstBreakStart) {
        const lessonStart = 8 * 60;
        updateTimer(lessonStart, firstBreakStart, true, currentTimeStr);
        activeFound = true;
      } else {
        for (let i = 0; i < filteredDuties.length; i++) {
          const row = filteredDuties[i];
          const parts = (row.time || "").split('-');
          if (parts.length < 2) continue;

          const startMatch = parts[0].match(/(\d{1,2}):(\d{2})/);
          const endMatch = parts[1].match(/(\d{1,2}):(\d{2})/);

          if (startMatch && endMatch) {
            const startTimeInMinutes = parseInt(startMatch[1], 10) * 60 + parseInt(startMatch[2], 10);
            const endTimeInMinutes = parseInt(endMatch[1], 10) * 60 + parseInt(endMatch[2], 10);

            if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
              updateTimer(startTimeInMinutes, endTimeInMinutes, false, currentTimeStr);
              activeFound = true;
              break;
            }

            if (previousBreakEnd !== null) {
              if (currentTimeInMinutes >= previousBreakEnd && currentTimeInMinutes < startTimeInMinutes) {
                updateTimer(previousBreakEnd, startTimeInMinutes, true, currentTimeStr);
                activeFound = true;
                break;
              }
            }
            previousBreakEnd = endTimeInMinutes;
          }
        }
      }

      if (!activeFound) {
        setTimer(prev => ({ ...prev, visible: false, currentTime: currentTimeStr }));
      }
    };

    const updateTimer = (startTimeInMinutes: number, endTimeInMinutes: number, isLesson: boolean, currentTimeStr: string) => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      
      const startTotalSeconds = startTimeInMinutes * 60;
      const endTotalSeconds = endTimeInMinutes * 60;
      const currentTotalSeconds = currentMinutes * 60 + currentSeconds;
      
      const totalDurationSeconds = endTotalSeconds - startTotalSeconds;
      const elapsedSeconds = currentTotalSeconds - startTotalSeconds;
      const remainingSeconds = endTotalSeconds - currentTotalSeconds;

      const percentage = Math.min(100, Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100));
      const m = Math.floor(remainingSeconds / 60);
      const s = remainingSeconds % 60;
      
      setTimer({
        label: isLesson ? "LEKCJA TRWA" : "PRZERWA TRWA",
        countdown: `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`,
        progress: percentage,
        visible: true,
        isLesson,
        currentTime: currentTimeStr
      });
    };

    const timerInterval = setInterval(updateState, 1000);
    updateState();
    return () => clearInterval(timerInterval);
  }, [filteredDuties]);

  const highlightedRowId = useMemo(() => {
    const now = new Date();
    const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
    const firstRow = filteredDuties[0];
    if (!firstRow) return null;
    const [firstStartStr] = (firstRow.time || "08:00-08:10").split('-');
    const firstMatch = firstStartStr.match(/(\d{1,2}):(\d{2})/);
    let firstBreakStart = 8 * 60;
    if (firstMatch) {
      firstBreakStart = parseInt(firstMatch[1], 10) * 60 + parseInt(firstMatch[2], 10);
    }
    if (currentTimeInMinutes < firstBreakStart) return firstRow.id;
    let previousBreakEnd: number | null = null;
    let previousRowId: number | null = null;
    for (const row of filteredDuties) {
      const parts = (row.time || "").split('-');
      if (parts.length < 2) continue;
      const startMatch = parts[0].match(/(\d{1,2}):(\d{2})/);
      const endMatch = parts[1].match(/(\d{1,2}):(\d{2})/);
      if (startMatch && endMatch) {
        const startTimeInMinutes = parseInt(startMatch[1], 10) * 60 + parseInt(startMatch[2], 10);
        const endTimeInMinutes = parseInt(endMatch[1], 10) * 60 + parseInt(endMatch[2], 10);
        if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) return row.id;
        if (previousBreakEnd !== null && currentTimeInMinutes >= previousBreakEnd && currentTimeInMinutes < startTimeInMinutes) return previousRowId;
        previousBreakEnd = endTimeInMinutes;
        previousRowId = row.id;
      }
    }
    return null;
  }, [filteredDuties]);

  const formatTime = (time: string) => {
    const [start, end] = (time || "").split('-');
    return (
      <div className="leading-none text-tiny font-mono">
        {start}<br />{end}
      </div>
    );
  };

  const formatName = (name: string) => {
    if (name === "-" || !name || name === "—") return <span className="text-on-surface/20">—</span>;
    const parts = name.split(/[\/\s]+/);
    if (parts.length >= 2) {
        return <div className="leading-tight">{parts[0]}<br />{parts.slice(1).join(' ')}</div>;
    }
    return <div className="leading-tight">{name}</div>;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#121212] p-4">
      <div 
        className="flex flex-col bg-background overflow-hidden shadow-2xl rounded-3xl border-[12px] border-[#ccdbf3]" 
        style={{ width: '640px', height: '500px' }}
      >
        <main className="flex-1 flex flex-col p-4 overflow-hidden gap-3">
          {/* Countdown Section */}
          <section className="bg-[#1e293b] rounded-2xl p-4 flex flex-col gap-2 shadow-lg shrink-0">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-label-sm font-bold text-slate-400 uppercase tracking-widest">DYŻURY</span>
                <h2 className="text-2xl font-extrabold text-white tracking-tighter leading-none">
                  {timer.visible ? `${timer.label}: ${timer.currentTime}` : `DYŻURY: ${dayNameMap[currentDayId]?.toUpperCase()}`}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-label-sm font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  {dayNameMap[currentDayId]?.toUpperCase()}, {timer.currentTime}
                </div>
                <span className="text-label-sm font-semibold text-emerald-400">
                  {timer.visible ? `POZOSTAŁO: ${timer.countdown}` : 'BRAK LEKCJI'}
                </span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-linear"
                style={{ width: `${timer.progress}%` }}
              ></div>
            </div>
          </section>

          {/* Table Container */}
          <section className="flex-1 bg-surface-container-lowest rounded-2xl shadow-inner border border-outline-variant/20 overflow-hidden flex flex-col">
            <div className="overflow-auto h-full">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-surface-container-high sticky top-0 z-10 shadow-sm">
                  <tr className="text-tiny font-bold text-on-surface-variant uppercase tracking-tighter border-b border-outline-variant/20">
                    <th className="py-2 px-1 text-center w-[25px]">NR</th>
                    <th className="py-2 px-1 w-[55px]">CZAS</th>
                    <th className="py-2 px-0.5 text-emerald-800">ZIELONY</th>
                    <th className="py-2 px-0.5 text-indigo-800">FIOLET</th>
                    <th className="py-2 px-0.5 text-orange-800">POMA.</th>
                    <th className="py-2 px-0.5 text-slate-700">UNDRG.</th>
                    <th className="py-2 px-0.5 text-yellow-800">ŻÓŁTY</th>
                    <th className="py-2 px-0.5 text-red-800">CZERW.</th>
                    <th className="py-2 px-0.5 text-blue-800">NIEB.</th>
                    <th className="py-2 px-0.5">PARTER</th>
                    <th className="py-2 px-0.5">SG</th>
                    <th className="py-2 px-0.5">OBIAD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {filteredDuties.map((row, index) => {
                    const isActive = highlightedRowId === row.id;
                    const baseCellClass = isActive ? "py-1 px-0.5 font-bold text-white text-tiny" : "py-1 px-0.5 text-on-surface/80 text-tiny";
                    const greyCellClass = isActive ? "bg-slate-500 text-white" : "text-on-surface/50";
                    
                    return (
                      <tr key={row.id} className={`${isActive ? '' : (index % 2 === 1 ? 'bg-surface-container-low/30' : '')}`}>
                        <td className={`py-1 px-1 text-center font-mono font-bold text-tiny ${greyCellClass}`}>
                          {row.nr}
                        </td>
                        <td className={`py-1 px-1 ${greyCellClass}`}>
                          {formatTime(row.time)}
                        </td>
                        <td className={`${baseCellClass} ${isActive ? 'bg-emerald-600' : ''}`}>
                          {formatName(row.zielony)}
                        </td>
                        <td className={`${baseCellClass} ${isActive ? 'bg-indigo-600' : ''}`}>
                          {formatName(row.fiolet)}
                        </td>
                        <td className={`${baseCellClass} ${isActive ? 'bg-orange-600' : ''}`}>
                          {formatName(row.poma)}
                        </td>
                        <td className={`${baseCellClass} ${isActive ? 'bg-slate-500' : ''}`}>
                          {formatName(row.undrg)}
                        </td>
                        <td className={`${baseCellClass} ${isActive ? 'bg-yellow-500 text-slate-900' : ''}`}>
                          {formatName(row.zolty)}
                        </td>
                        <td className={`${baseCellClass} ${isActive ? 'bg-red-600' : ''}`}>
                          {formatName(row.czerw)}
                        </td>
                        <td className={`${baseCellClass} ${isActive ? 'bg-blue-600' : ''}`}>
                          {formatName(row.nieb)}
                        </td>
                        <td className={`${baseCellClass} ${isActive ? 'bg-slate-500' : ''}`}>
                          {formatName(row.parter)}
                        </td>
                        <td className={`${baseCellClass} ${isActive ? 'bg-slate-500' : ''}`}>
                          {formatName(row.sg)}
                        </td>
                        <td className={`${baseCellClass} ${isActive ? 'bg-slate-500 text-center' : 'text-center'}`}>
                          {formatName(row.obiad)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
