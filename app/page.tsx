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

// Stała paleta - magenta jest jedynym akcentem, ktory nie koliduje
// z zadnym kolorem korytarza (najblizszy: Czerwony, i tak wyraznie dalej
// niz kazdy z sezonowych akcentow paska zegara).
const ACCENT = '#ec4899';
const ACCENT_SOFT = '#f9a8d4';

function rgbOf(hex: string): string {
  const h = hex.replace('#', '');
  return `${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)}`;
}

const C = {
  bg:         '#0d0f14',
  surface:    '#14171f',
  border:     'rgba(255,255,255,0.07)',
  text:       '#f6f8fc',
  muted:      'rgba(255,255,255,0.5)',
  accent:     ACCENT,
  accentSoft: ACCENT_SOFT,
  accentRGB:  rgbOf(ACCENT),
  headerBg:   'rgba(0,0,0,0.25)',
  sans:       "var(--font-dm-sans, 'DM Sans', sans-serif)",
  mono:       "var(--font-dm-mono, 'DM Mono', monospace)",
} as const;

function schoolYear(d: Date = new Date()): string {
  // rok szkolny startuje we wrzesniu (miesiac 8, liczac od zera)
  const start = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
  return `${start}/${String((start + 1) % 100).padStart(2, '0')}`;
}

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

// Szczęśliwy numer - logika przeniesiona 1:1 z paska zegara, zeby ciag sie nie rozjechal
const LUCKY_BAGS = [
  [3,5,17,1,9,14,6,8,12,4,10,15,2,13,7,11,18,16],
  [10,4,15,2,13,7,1,18,9,16,5,11,17,3,8,14,6,12],
  [7,14,2,16,9,12,5,1,11,17,3,10,6,15,18,4,13,8],
  [16,6,13,8,3,18,10,2,15,5,1,14,9,11,4,17,7,12],
  [5,12,17,4,11,8,15,7,2,13,9,1,18,6,10,16,3,14],
  [9,1,14,6,10,16,3,13,4,17,7,12,15,2,11,18,8,5],
  [2,15,8,11,4,7,13,18,6,10,16,3,14,9,1,12,5,17],
  [14,3,10,12,5,17,7,4,13,9,1,18,2,8,15,6,11,16],
  [11,16,6,1,8,15,9,3,12,14,17,5,13,7,2,10,18,4],
  [4,18,7,13,2,10,1,16,8,15,6,11,12,5,17,9,14,3],
];
const LUCKY_START_UTC = Date.UTC(2025, 9, 25);

function getLucky(now: Date): number {
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  let d = Math.floor((todayUTC - LUCKY_START_UTC) / 86400000);
  if (d < 0) d = ((d % 180) + 180) % 180;
  return LUCKY_BAGS[Math.floor((d % 180) / 18)][d % 18];
}

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

  const [isWeekend, setIsWeekend] = useState(false);
  const [schoolYearLabel, setSchoolYearLabel] = useState('');
  const [clock, setClock] = useState({ h: '--', m: '--', s: '--' });
  const [lucky, setLucky] = useState(0);
  const [dateLabel, setDateLabel] = useState('');

  // Dzien przeliczamy cyklicznie, nie tylko przy starcie - tablica potrafi
  // trzymac strone zaladowana tygodniami bez przeladowania.
  useEffect(() => {
    const syncDay = () => {
      const idx = new Date().getDay();
      const weekend = idx === 0 || idx === 6;
      setIsWeekend(weekend);
      setCurrentDayId(weekend ? 'poniedzialek' : dayIdMap[idx]);
      setSchoolYearLabel(schoolYear());
      const now = new Date();
      setLucky(getLucky(now));
      setDateLabel(now.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }));
    };
    syncDay();
    const iv = setInterval(syncDay, 60000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const tickClock = () => {
      const n = new Date();
      setClock({ h: pad(n.getHours()), m: pad(n.getMinutes()), s: pad(n.getSeconds()) });
    };
    tickClock();
    const iv = setInterval(tickClock, 1000);
    return () => clearInterval(iv);
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
        <span style={{ color: 'rgba(255,255,255,0.12)', display: 'block', textAlign: 'center', fontSize: 4 }}>—</span>
      );
    }
    const parts = value.split(/[\/\n]/).map(p => p.trim()).filter(Boolean);
    const fontSize = isPast ? 4 : 4;
    const color = isActive ? activeText : C.text;
    return (
      <div style={{ textAlign: 'center' }}>
        {parts.map((part, i) => (
          <div key={i} style={{ fontWeight: 600, color, fontSize, lineHeight: 1.2 }}>
            {part}
          </div>
        ))}
      </div>
    );
  };

  const dotColor = timerState.isDuty ? '#eab308' : C.accent;

  const W = 640;
  const H = 760;
  const PAD = 6;
  const PAD_BOTTOM = 80;
  const GAP = 6;
  const TOP_BAR_H = 174;
  // H - PAD_top - PAD_bottom - GAP - TOP_BAR_H - TABLE_HEADER_H - 2px borders - 15px safety
  const TBODY_AVAIL = H - PAD - PAD_BOTTOM - GAP - TOP_BAR_H - TABLE_HEADER_H - 2 - 18;

  const nPastBreaks = useMemo(() => {
    if (currentCombinedIdx <= 0) return 0;
    return combinedRows.slice(0, currentCombinedIdx).filter(r => r.type === 'break').length;
  }, [currentCombinedIdx, combinedRows]);

  const breakRowH = useMemo(() => {
    const nBreaks = filteredDuties.length;
    const nLessons = combinedRows.filter(r => r.type === 'lesson').length;
    if (nBreaks === 0) return 40;
    const nFuture = nBreaks - nPastBreaks;
    const totalUnits = nFuture + nPastBreaks * 0.55;
    return Math.max(20, Math.floor((TBODY_AVAIL - nLessons * LESSON_ROW_H) / Math.max(1, totalUnits)));
  }, [filteredDuties.length, combinedRows.length, nPastBreaks, TBODY_AVAIL]);

  const pastBreakRowH = Math.max(16, Math.floor(breakRowH * 0.55));

  return (
    <div style={{
      width: W,
      height: H,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: C.bg,
      padding: `${PAD}px ${PAD}px ${PAD_BOTTOM}px`,
      boxSizing: 'border-box',
      gap: GAP,
      fontFamily: C.sans,
      color: C.text,
    }}>
      <style>{`
        @keyframes pulse-accent {
          0%   { box-shadow: 0 0 0 0 rgba(${C.accentRGB},0.5); }
          70%  { box-shadow: 0 0 0 7px rgba(${C.accentRGB},0); }
          100% { box-shadow: 0 0 0 0 rgba(${C.accentRGB},0); }
        }
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: .15 } }
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
          <div style={{ fontFamily: C.mono, fontSize: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.18em', color: C.muted }}>
            Weekend
          </div>
          <div style={{ fontSize: 27, fontWeight: 700, color: C.text, letterSpacing: '0.01em', textAlign: 'center' }}>
            Do zobaczenia w poniedziałek
          </div>
          <div style={{ width: 40, height: 2, background: C.accent, borderRadius: 2, marginTop: 4 }} />
        </div>
      )}

      {!isWeekend && (<>
        {/* Naglowek = pasek zegara 1:1 + rzad odliczania */}
        <div style={{
          flexShrink: 0,
          height: TOP_BAR_H,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}>
          {/* --- zegar: trojpodzial jak na pasku --- */}
          <div style={{ height: 140, display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
            {/* kolumna z data */}
            <div style={{
              width: 126, padding: '0 18px',
              background: 'rgba(255,255,255,0.035)',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3,
              boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.15, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.accentSoft }}>
                {dayNameMap[currentDayId] ?? currentDayId}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.3, color: C.muted }}>{dateLabel}</div>
              <div style={{ fontSize: 11, lineHeight: 1.3, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em' }}>{schoolYearLabel}</div>
            </div>

            {/* zegar */}
            <div style={{
              flex: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderLeft: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}`,
            }}>
              <div style={{ fontFamily: C.mono, fontSize: 84, lineHeight: 0.9, letterSpacing: '-0.05em', color: C.text }}>
                {clock.h}
                <span style={{ color: C.accent, animation: 'blink 1s step-end infinite' }}>:</span>
                {clock.m}
                <span style={{ fontSize: '0.5em', opacity: 0.7, marginLeft: '0.14em', letterSpacing: 0 }}>{clock.s}</span>
              </div>
            </div>

            {/* szczesliwy numer */}
            <div style={{
              width: 196, padding: '0 14px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxSizing: 'border-box',
            }}>
              <div style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                Szczęśliwy numer
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ fontFamily: C.mono, fontSize: 62, lineHeight: 0.86, letterSpacing: '-0.05em', color: C.accent }}>
                  {lucky || '?'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 10px)', gap: 6 }}>
                  {Array.from({ length: 18 }, (_, i) => (
                    <div key={i} style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: i < lucky ? C.accent : 'rgba(255,255,255,0.1)',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- rzad odliczania: status | pasek | pozostalo --- */}
          <div style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '0 16px',
            borderTop: `1px solid ${C.border}`,
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: dotColor,
                animation: timerState.isDuty ? 'pulse-yellow 2s infinite' : 'pulse-accent 2s infinite',
                flexShrink: 0,
              }} />
              <div style={{ fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.text, whiteSpace: 'nowrap' }}>
                {timerState.visible ? timerState.label : 'Dyżury'}
              </div>
            </div>

            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
              {timerState.visible && (
                <div style={{ height: '100%', borderRadius: 2, background: C.accent, transition: 'width 1s linear', width: `${timerState.progress}%` }} />
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.muted }}>
                Pozostało
              </span>
              <span style={{ fontFamily: C.mono, fontSize: 20, fontWeight: 600, color: C.accent, letterSpacing: '0.02em' }}>
                {timerState.visible ? timerState.countdown : '--:--'}
              </span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{
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
                    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: zone.color, marginRight: 2, verticalAlign: 'middle' }} />
                    <span style={{ color: zone.color, verticalAlign: 'middle', fontSize: 9, fontWeight: 700 }}>{zone.shortLabel}</span>
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
                      <td colSpan={12} style={{ padding: 0, overflow: 'hidden', background: isCurrent ? `rgba(${C.accentRGB},0.03)` : 'transparent', borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                        <div style={{
                          height: LESSON_ROW_H,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '0 8px',
                          fontSize: 4,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          color: isCurrent ? `rgba(${C.accentRGB},0.7)` : 'rgba(255,255,255,0.12)',
                          fontFamily: C.mono,
                        }}>
                          <div style={{ flex: 1, height: 1, background: isCurrent ? `rgba(${C.accentRGB},0.2)` : 'rgba(255,255,255,0.04)', borderRadius: 1 }} />
                          Lekcja {row.nr}&nbsp;{row.start}–{row.end}{isCurrent ? ' trwa' : ''}
                          <div style={{ flex: 1, height: 1, background: isCurrent ? `rgba(${C.accentRGB},0.2)` : 'rgba(255,255,255,0.04)', borderRadius: 1 }} />
                        </div>
                      </td>
                    </tr>
                  );
                }

                // ── BREAK ROW ──
                const { duty } = row;
                const isCurrent = duty.id === timerState.highlightedRowId && timerState.isDuty;
                const [start, end] = (duty.time || '').split('-');
                const cellH = isPast ? pastBreakRowH : breakRowH;

                return (
                  <tr key={duty.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: isPast ? 0.4 : 1 }}>
                    <td style={{ padding: 0, overflow: 'hidden', background: isCurrent ? `rgba(${C.accentRGB},0.04)` : undefined }}>
                      <div style={{ height: cellH, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.mono, fontSize: isPast ? 4 : 4, color: C.muted }}>
                        {duty.nr}
                      </div>
                    </td>
                    <td style={{ padding: 0, overflow: 'hidden', background: isCurrent ? `rgba(${C.accentRGB},0.04)` : undefined }}>
                      <div style={{ height: cellH, overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: C.mono }}>
                        <div style={{ fontSize: isPast ? 4 : 6, color: C.text, fontWeight: 600, lineHeight: 1.2 }}>{start}</div>
                        <div style={{ fontSize: isPast ? 4 : 4, color: isCurrent ? C.accent : C.muted, lineHeight: 1.2 }}>{end}</div>
                      </div>
                    </td>
                    {ZONES.map(zone => (
                      <td key={String(zone.key)} style={{ padding: 0, overflow: 'hidden', ...(isCurrent ? { background: zone.activeBg, borderTop: `2px solid ${zone.activeBorder}` } : {}) }}>
                        <div style={{ height: cellH, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', boxSizing: 'border-box' }}>
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
    fontSize: 4,
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
