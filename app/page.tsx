'use client';

import { useEffect, useState, useMemo, useRef } from 'react';

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

const dayIdMap = ['niedziela', 'poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek', 'sobota'];

const dayNameMap: Record<string, string> = {
  poniedzialek: 'Poniedziałek',
  wtorek:       'Wtorek',
  sroda:        'Środa',
  czwartek:     'Czwartek',
  piatek:       'Piątek',
};

const ZONES: {
  key: keyof Duty;
  label: string;
  shortLabel: string;
  color: string;
  activeText: string;
  activeBg: string;
  activeBorder: string;
}[] = [
  { key: 'zielony', label: 'Zielone',      shortLabel: 'ZI', color: '#34d068', activeText: '#6ee896', activeBg: 'rgba(52,208,104,0.13)',    activeBorder: 'rgba(52,208,104,0.5)'   },
  { key: 'fiolet',  label: 'Fioletowe',    shortLabel: 'FI', color: '#a855f7', activeText: '#c084fc', activeBg: 'rgba(168,85,247,0.13)',    activeBorder: 'rgba(168,85,247,0.5)'   },
  { key: 'poma',    label: 'Pomarańczowe', shortLabel: 'PO', color: '#f97316', activeText: '#fb923c', activeBg: 'rgba(249,115,22,0.13)',    activeBorder: 'rgba(249,115,22,0.5)'   },
  { key: 'undrg',   label: 'Underground',  shortLabel: 'UG', color: '#64748b', activeText: '#94a3b8', activeBg: 'rgba(100,116,139,0.08)',   activeBorder: 'rgba(100,116,139,0.25)' },
  { key: 'zolty',   label: 'Żółty',        shortLabel: 'ŻÓ', color: '#eab308', activeText: '#fde047', activeBg: 'rgba(234,179,8,0.13)',     activeBorder: 'rgba(234,179,8,0.5)'    },
  { key: 'czerw',   label: 'Czerwony',     shortLabel: 'CZ', color: '#ef4444', activeText: '#fc8080', activeBg: 'rgba(239,68,68,0.13)',     activeBorder: 'rgba(239,68,68,0.5)'    },
  { key: 'nieb',    label: 'Niebieski',    shortLabel: 'NI', color: '#3b82f6', activeText: '#7eb8fc', activeBg: 'rgba(59,130,246,0.13)',    activeBorder: 'rgba(59,130,246,0.5)'   },
  { key: 'parter',  label: 'Parter',       shortLabel: 'PA', color: '#64748b', activeText: '#94a3b8', activeBg: 'rgba(100,116,139,0.08)',   activeBorder: 'rgba(100,116,139,0.25)' },
  { key: 'sg',      label: 'SG',           shortLabel: 'SG', color: '#64748b', activeText: '#94a3b8', activeBg: 'rgba(100,116,139,0.08)',   activeBorder: 'rgba(100,116,139,0.25)' },
  { key: 'obiad',   label: 'Obiad',        shortLabel: 'OB', color: '#64748b', activeText: '#94a3b8', activeBg: 'rgba(100,116,139,0.08)',   activeBorder: 'rgba(100,116,139,0.25)' },
];

const C = {
  bg:       '#0d0f14',
  surface:  '#14171f',
  border:   'rgba(255,255,255,0.07)',
  text:     '#eceef4',
  muted:    '#5a6070',
  accent:   '#00c9a0',
  headerBg: '#0f1118',
  sans:     "var(--font-ibm-plex-sans, 'IBM Plex Sans', sans-serif)",
  mono:     "var(--font-ibm-plex-mono, 'IBM Plex Mono', monospace)",
} as const;

function parseMinutes(s: string): number {
  const m = s.match(/(\d{1,2}):(\d{2})/);
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 0;
}

interface TimerState {
  label: string;
  countdown: string;
  progress: number;
  visible: boolean;
  isDuty: boolean;
  highlightedRowId: number | null;
}

type CombinedRow =
  | { type: 'lesson'; nr: string; start: string; end: string; breakId: number }
  | { type: 'break'; duty: Duty };

const LESSON_DAY_START = '8:00';
const LESSON_ROW_H = 14;
const TABLE_HEADER_H = 20;

export default function PublicPage() {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [currentDayId, setCurrentDayId] = useState('poniedzialek');
  const [timerState, setTimerState] = useState<TimerState>({
    label: 'Dyżury',
    countdown: '—',
    progress: 0,
    visible: false,
    isDuty: false,
    highlightedRowId: null,
  });

  useEffect(() => {
    const fetchDuties = async () => {
      try {
        const res = await fetch('/api/schedule');
        setDuties(await res.json());
      } catch {}
    };
    fetchDuties();
    const iv = setInterval(fetchDuties, 30000);
    return () => clearInterval(iv);
  }, []);

  const isWeekend = useMemo(() => {
    const d = new Date().getDay();
    return d === 0 || d === 6;
  }, []);

  useEffect(() => {
    const idx = new Date().getDay();
    setCurrentDayId(idx === 0 || idx === 6 ? 'poniedzialek' : dayIdMap[idx]);
  }, []);

  const filteredDuties = useMemo(
    () => duties.filter(d => d.day === currentDayId),
    [duties, currentDayId]
  );

  const combinedRows = useMemo<CombinedRow[]>(() => {
    const rows: CombinedRow[] = [];
    filteredDuties.forEach((duty, i) => {
      const [dutyStart] = (duty.time || '').split('-');
      const lessonStart = i === 0
        ? LESSON_DAY_START
        : (filteredDuties[i - 1].time || '').split('-')[1]?.trim() || '';
      const cleanEnd = dutyStart?.trim() || '';
      if (lessonStart && cleanEnd) {
        rows.push({ type: 'lesson', nr: duty.nr, start: lessonStart, end: cleanEnd, breakId: duty.id });
      }
      rows.push({ type: 'break', duty });
    });
    return rows;
  }, [filteredDuties]);

  useEffect(() => {
    const tick = () => {
      if (filteredDuties.length === 0) {
        setTimerState(prev => ({ ...prev, visible: false, highlightedRowId: null }));
        return;
      }

      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      const totalSecs = mins * 60 + now.getSeconds();

      const fmt = (remaining: number) => {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      };

      const firstRow = filteredDuties[0];
      const firstStart = parseMinutes((firstRow.time || '').split('-')[0] || '');
      if (firstStart > 0 && mins < firstStart) {
        const remaining = firstStart * 60 - totalSecs;
        const elapsed = totalSecs - 8 * 3600;
        const totalDur = firstStart * 60 - 8 * 3600;
        setTimerState({
          label: 'Lekcja trwa',
          countdown: fmt(Math.max(0, remaining)),
          progress: Math.min(100, Math.max(0, (elapsed / totalDur) * 100)),
          visible: true,
          isDuty: false,
          highlightedRowId: firstRow.id,
        });
        return;
      }

      let prevEnd = 0;
      for (let i = 0; i < filteredDuties.length; i++) {
        const row = filteredDuties[i];
        const [startStr, endStr] = (row.time || '').split('-');
        const start = parseMinutes(startStr || '');
        const end = parseMinutes(endStr || '');
        if (!start || !end) continue;

        if (prevEnd > 0 && mins >= prevEnd && mins < start) {
          const remaining = start * 60 - totalSecs;
          const elapsed = totalSecs - prevEnd * 60;
          const totalDur = (start - prevEnd) * 60;
          setTimerState({
            label: 'Lekcja trwa',
            countdown: fmt(Math.max(0, remaining)),
            progress: Math.min(100, Math.max(0, (elapsed / totalDur) * 100)),
            visible: true,
            isDuty: false,
            highlightedRowId: row.id,
          });
          return;
        }

        if (mins >= start && mins < end) {
          const remaining = end * 60 - totalSecs;
          const elapsed = totalSecs - start * 60;
          const totalDur = (end - start) * 60;
          setTimerState({
            label: 'Przerwa trwa',
            countdown: fmt(Math.max(0, remaining)),
            progress: Math.min(100, Math.max(0, (elapsed / totalDur) * 100)),
            visible: true,
            isDuty: true,
            highlightedRowId: row.id,
          });
          return;
        }

        prevEnd = end;
      }

      setTimerState(prev => ({ ...prev, visible: false, highlightedRowId: null }));
    };

    const iv = setInterval(tick, 1000);
    tick();
    return () => clearInterval(iv);
  }, [filteredDuties]);

  const currentCombinedIdx = useMemo(() => {
    if (!timerState.highlightedRowId) return -1;
    return combinedRows.findIndex(row => {
      if (timerState.isDuty) {
        return row.type === 'break' && row.duty.id === timerState.highlightedRowId;
      } else {
        return row.type === 'lesson' && row.breakId === timerState.highlightedRowId;
      }
    });
  }, [combinedRows, timerState.isDuty, timerState.highlightedRowId]);

  const formatName = (value: string, isActive: boolean, activeText: string, isPast: boolean) => {
    if (!value || value === '-' || value === '—') {
      return (
        <span style={{ color: 'rgba(255,255,255,0.12)', display: 'block', textAlign: 'center', fontSize: 9 }}>—</span>
      );
    }
    const parts = value.split(/[\/\n]/).map(p => p.trim()).filter(Boolean);
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, color: isActive ? activeText : C.text, fontSize: isPast ? 7 : 9, lineHeight: 1.2 }}>
          {parts[0]}
        </div>
        {parts[1] && (
          <div style={{ fontSize: isPast ? 6 : 8, color: isActive ? 'rgba(255,255,255,0.5)' : C.muted, lineHeight: 1.2 }}>
            {parts[1]}
          </div>
        )}
      </div>
    );
  };

  const dotColor = timerState.isDuty ? '#eab308' : C.accent;

  const W = 640;
  const H = 450;
  const PAD = 6;
  const GAP = 6;
  const TOP_BAR_H = 34;
  const BOTTOM_MARGIN = 20;

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [breakRowH, setBreakRowH] = useState(40);

  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;
    const compute = () => {
      const containerH = el.clientHeight;
      const nBreaks = filteredDuties.length;
      const nLessons = combinedRows.filter(r => r.type === 'lesson').length;
      if (nBreaks === 0) return;
      const available = containerH - TABLE_HEADER_H - 2;
      const bh = Math.max(20, Math.floor((available - nLessons * LESSON_ROW_H) / nBreaks));
      setBreakRowH(bh);
    };
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    compute();
    return () => ro.disconnect();
  }, [filteredDuties.length, combinedRows.length]);

  return (
    <div style={{
      width: W,
      height: H,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: C.bg,
      padding: `${PAD}px ${PAD}px ${BOTTOM_MARGIN}px`,
      boxSizing: 'border-box',
      gap: GAP,
      fontFamily: C.sans,
      color: C.text,
    }}>
      <style>{`
        @keyframes pulse-green {
          0%   { box-shadow: 0 0 0 0 rgba(0,201,160,0.5); }
          70%  { box-shadow: 0 0 0 7px rgba(0,201,160,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,201,160,0); }
        }
        @keyframes pulse-yellow {
          0%   { box-shadow: 0 0 0 0 rgba(234,179,8,0.5); }
          70%  { box-shadow: 0 0 0 7px rgba(234,179,8,0); }
          100% { box-shadow: 0 0 0 0 rgba(234,179,8,0); }
        }
      `}</style>

      {/* Weekend screen */}
      {isWeekend && (
        <div style={{
          flex: 1,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxSizing: 'border-box',
        }}>
          <div style={{ fontFamily: C.mono, fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.18em', color: C.muted }}>
            Weekend
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C.text, letterSpacing: '0.01em', textAlign: 'center' }}>
            Do zobaczenia w poniedziałek
          </div>
          <div style={{ width: 40, height: 2, background: C.accent, borderRadius: 2, marginTop: 4 }} />
        </div>
      )}

      {!isWeekend && (<>
        {/* Top Bar */}
        <div style={{
          flexShrink: 0,
          height: TOP_BAR_H,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: '#515a6e', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {dayNameMap[currentDayId] ?? currentDayId}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: dotColor,
                animation: timerState.isDuty ? 'pulse-yellow 2s infinite' : 'pulse-green 2s infinite',
                flexShrink: 0,
              }} />
              <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.text }}>
                {timerState.visible ? timerState.label : 'Dyżury'}
              </div>
            </div>
          </div>

          {timerState.visible && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted }}>
                Pozostało
              </div>
              <div style={{ fontFamily: C.mono, fontSize: 22, fontWeight: 600, color: C.accent, letterSpacing: '0.03em' }}>
                {timerState.countdown}
              </div>
              <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 2, width: 90 }}>
                <div style={{ height: '100%', borderRadius: 2, background: C.accent, transition: 'width 1s linear', width: `${timerState.progress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div ref={tableContainerRef} style={{
          flex: 1,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 26 }} />
              <col style={{ width: 58 }} />
              {ZONES.map(z => <col key={String(z.key)} />)}
            </colgroup>
            <thead>
              <tr style={{ background: C.headerBg, borderBottom: `1px solid ${C.border}`, height: TABLE_HEADER_H }}>
                <th style={thStyle({ textAlign: 'center' })}>#</th>
                <th style={thStyle({ textAlign: 'center' })}>Czas</th>
                {ZONES.map(zone => (
                  <th key={String(zone.key)} style={thStyle({ textAlign: 'center' })} title={zone.label}>
                    <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: zone.color, marginRight: 3, verticalAlign: 'middle' }} />
                    <span style={{ color: zone.color, verticalAlign: 'middle' }}>{zone.shortLabel}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {combinedRows.map((row, idx) => {
                const isPast = currentCombinedIdx > 0 && idx < currentCombinedIdx;

                // ── LESSON ROW ──
                if (row.type === 'lesson') {
                  const isCurrent = !timerState.isDuty && timerState.highlightedRowId === row.breakId;
                  return (
                    <tr key={`lesson-${row.breakId}`} style={{ opacity: isPast ? 0.35 : 1 }}>
                      <td colSpan={12} style={{ padding: 0, overflow: 'hidden', background: isCurrent ? 'rgba(0,201,160,0.03)' : 'transparent', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                        <div style={{
                          height: LESSON_ROW_H,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '0 8px',
                          fontSize: 8,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: isCurrent ? 'rgba(0,201,160,0.7)' : 'rgba(255,255,255,0.12)',
                          fontFamily: C.mono,
                        }}>
                          <div style={{ flex: 1, height: 1, background: isCurrent ? 'rgba(0,201,160,0.2)' : 'rgba(255,255,255,0.04)', borderRadius: 1 }} />
                          Lekcja {row.nr}&nbsp;{row.start}–{row.end}{isCurrent ? ' trwa' : ''}
                          <div style={{ flex: 1, height: 1, background: isCurrent ? 'rgba(0,201,160,0.2)' : 'rgba(255,255,255,0.04)', borderRadius: 1 }} />
                        </div>
                      </td>
                    </tr>
                  );
                }

                // ── BREAK ROW ──
                const { duty } = row;
                const isCurrent = duty.id === timerState.highlightedRowId && timerState.isDuty;
                const [start, end] = (duty.time || '').split('-');

                return (
                  <tr key={duty.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: isPast ? 0.35 : 1 }}>
                    <td style={{ padding: 0, overflow: 'hidden', background: isCurrent ? 'rgba(0,201,160,0.04)' : undefined }}>
                      <div style={{ height: breakRowH, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.mono, fontSize: 9, color: C.muted }}>
                        {duty.nr}
                      </div>
                    </td>
                    <td style={{ padding: 0, overflow: 'hidden', background: isCurrent ? 'rgba(0,201,160,0.04)' : undefined }}>
                      <div style={{ height: breakRowH, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: C.mono }}>
                        <div style={{ fontSize: 11, color: C.text, fontWeight: 600, lineHeight: 1.2 }}>{start}</div>
                        <div style={{ fontSize: 9, color: isCurrent ? C.accent : C.muted, lineHeight: 1.2 }}>{end}</div>
                      </div>
                    </td>
                    {ZONES.map(zone => (
                      <td key={String(zone.key)} style={{ padding: 0, overflow: 'hidden', ...(isCurrent ? { background: zone.activeBg, borderTop: `2px solid ${zone.activeBorder}` } : {}) }}>
                        <div style={{ height: breakRowH, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', boxSizing: 'border-box' }}>
                          {formatName(String(duty[zone.key] || ''), isCurrent, zone.activeText, isPast)}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>)}
    </div>
  );
}

function thStyle(extra: React.CSSProperties): React.CSSProperties {
  return {
    padding: '0 5px',
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#5a6070',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ...extra,
  };
}
