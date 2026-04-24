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
  color: string;
  activeText: string;
  activeBg: string;
  activeBorder: string;
}[] = [
  { key: 'zielony', label: 'Zielone',      color: '#34d068', activeText: '#6ee896', activeBg: 'rgba(52,208,104,0.13)',   activeBorder: 'rgba(52,208,104,0.5)' },
  { key: 'fiolet',  label: 'Fioletowe',    color: '#a855f7', activeText: '#c084fc', activeBg: 'rgba(168,85,247,0.13)',   activeBorder: 'rgba(168,85,247,0.5)' },
  { key: 'poma',    label: 'Pomarańczowe', color: '#f97316', activeText: '#fb923c', activeBg: 'rgba(249,115,22,0.13)',   activeBorder: 'rgba(249,115,22,0.5)' },
  { key: 'undrg',   label: 'Underground',  color: '#64748b', activeText: '#94a3b8', activeBg: 'rgba(100,116,139,0.08)', activeBorder: 'rgba(100,116,139,0.25)' },
  { key: 'zolty',   label: 'Żółty',        color: '#eab308', activeText: '#fde047', activeBg: 'rgba(234,179,8,0.13)',   activeBorder: 'rgba(234,179,8,0.5)' },
  { key: 'czerw',   label: 'Czerwony',     color: '#ef4444', activeText: '#fc8080', activeBg: 'rgba(239,68,68,0.13)',   activeBorder: 'rgba(239,68,68,0.5)' },
  { key: 'nieb',    label: 'Niebieski',    color: '#3b82f6', activeText: '#7eb8fc', activeBg: 'rgba(59,130,246,0.13)',  activeBorder: 'rgba(59,130,246,0.5)' },
  { key: 'parter',  label: 'Parter',       color: '#64748b', activeText: '#94a3b8', activeBg: 'rgba(100,116,139,0.08)', activeBorder: 'rgba(100,116,139,0.25)' },
  { key: 'sg',      label: 'SG',           color: '#64748b', activeText: '#94a3b8', activeBg: 'rgba(100,116,139,0.08)', activeBorder: 'rgba(100,116,139,0.25)' },
  { key: 'obiad',   label: 'Obiad',        color: '#64748b', activeText: '#94a3b8', activeBg: 'rgba(100,116,139,0.08)', activeBorder: 'rgba(100,116,139,0.25)' },
];

const C = {
  bg:         '#0d0f14',
  surface:    '#14171f',
  border:     'rgba(255,255,255,0.07)',
  text:       '#eceef4',
  muted:      '#5a6070',
  accent:     '#00c9a0',
  headerBg:   '#0f1118',
  sans:       "var(--font-ibm-plex-sans, 'IBM Plex Sans', sans-serif)",
  mono:       "var(--font-ibm-plex-mono, 'IBM Plex Mono', monospace)",
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

  useEffect(() => {
    const idx = new Date().getDay();
    setCurrentDayId(idx === 0 || idx === 6 ? 'poniedzialek' : dayIdMap[idx]);
  }, []);

  const filteredDuties = useMemo(
    () => duties.filter(d => d.day === currentDayId),
    [duties, currentDayId]
  );

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

      // Before first duty row starts
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

      // Walk through duty rows
      let prevEnd = 0;
      for (let i = 0; i < filteredDuties.length; i++) {
        const row = filteredDuties[i];
        const [startStr, endStr] = (row.time || '').split('-');
        const start = parseMinutes(startStr || '');
        const end = parseMinutes(endStr || '');
        if (!start || !end) continue;

        // Lesson between previous duty end and this duty start
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

        // Within this duty row (break time)
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

  const currentRowIndex = filteredDuties.findIndex(d => d.id === timerState.highlightedRowId);

  const formatName = (value: string, isActive: boolean, activeText: string) => {
    if (!value || value === '-' || value === '—') {
      return (
        <span style={{ color: 'rgba(255,255,255,0.12)', display: 'block', textAlign: 'center', fontSize: 12 }}>
          —
        </span>
      );
    }
    const parts = value.split(/[\/\n]/).map(p => p.trim()).filter(Boolean);
    return (
      <div>
        <div style={{ fontWeight: 600, color: isActive ? activeText : C.text, fontSize: 11, lineHeight: 1.35 }}>
          {parts[0]}
        </div>
        {parts[1] && (
          <div style={{ fontSize: 10, color: isActive ? 'rgba(255,255,255,0.5)' : C.muted, marginTop: 1, lineHeight: 1.35 }}>
            {parts[1]}
          </div>
        )}
      </div>
    );
  };

  const dotColor = timerState.isDuty ? '#eab308' : C.accent;

  return (
    <div style={{
      background: C.bg,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 12px 40px',
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

      {/* Top Bar */}
      <div style={{
        width: '100%', maxWidth: 1280,
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 16,
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 9, height: 9, borderRadius: '50%',
            background: dotColor,
            animation: timerState.isDuty ? 'pulse-yellow 2s infinite' : 'pulse-green 2s infinite',
            flexShrink: 0,
          }} />
          <div>
            <div style={{
              fontWeight: 700, fontSize: 15,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: C.text,
              lineHeight: 1.2,
            }}>
              {timerState.visible ? timerState.label : 'Dyżury'}
            </div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: '0.04em', marginTop: 1 }}>
              {dayNameMap[currentDayId] ?? currentDayId}
            </div>
          </div>
        </div>

        {timerState.visible && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: 1 }}>
              Pozostało
            </div>
            <div style={{
              fontFamily: C.mono,
              fontSize: 26, fontWeight: 600,
              color: C.accent,
              letterSpacing: '0.03em',
            }}>
              {timerState.countdown}
            </div>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 4, width: 110 }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: C.accent,
                transition: 'width 1s linear',
                width: `${timerState.progress}%`,
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{
        width: '100%', maxWidth: 1280,
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 36 }} />
            <col style={{ width: 72 }} />
            {ZONES.map(z => <col key={String(z.key)} />)}
          </colgroup>
          <thead>
            <tr style={{ background: C.headerBg, borderBottom: `1px solid ${C.border}` }}>
              <th style={thStyle({ textAlign: 'center' })}>#</th>
              <th style={thStyle({ textAlign: 'center' })}>Czas</th>
              {ZONES.map(zone => (
                <th key={String(zone.key)} style={thStyle({})}>
                  <span style={{
                    display: 'inline-block',
                    width: 7, height: 7,
                    borderRadius: '50%',
                    background: zone.color,
                    marginRight: 4,
                    verticalAlign: 'middle',
                    flexShrink: 0,
                  }} />
                  <span style={{ color: zone.color, verticalAlign: 'middle' }}>{zone.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDuties.map((row, index) => {
              const isCurrent = row.id === timerState.highlightedRowId;
              const isActiveDuty = isCurrent;
              const isPast = currentRowIndex > 0 && index < currentRowIndex;

              return (
                <tr
                  key={row.id}
                  style={{
                    borderBottom: `1px solid ${C.border}`,
                    opacity: isPast ? 0.35 : 1,
                  }}
                >
                  {/* # */}
                  <td style={{
                    padding: '11px 8px',
                    textAlign: 'center',
                    fontFamily: C.mono,
                    fontSize: 10,
                    color: C.muted,
                    verticalAlign: 'middle',
                    background: isCurrent ? 'rgba(0,201,160,0.04)' : undefined,
                  }}>
                    {row.nr}
                  </td>

                  {/* Czas */}
                  <td style={{
                    padding: '11px 8px',
                    textAlign: 'center',
                    fontFamily: C.mono,
                    verticalAlign: 'middle',
                    background: isCurrent ? 'rgba(0,201,160,0.04)' : undefined,
                  }}>
                    {(() => {
                      const [start, end] = (row.time || '').split('-');
                      return (
                        <>
                          <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{start}</div>
                          <div style={{ fontSize: 10, color: C.muted }}>{end}</div>
                          {isCurrent && (
                            <div style={{
                              display: 'inline-block',
                              background: C.accent,
                              color: '#0d0f14',
                              fontSize: 9,
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              padding: '1px 6px',
                              borderRadius: 100,
                              marginTop: 3,
                            }}>
                              teraz
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </td>

                  {/* Zone cells */}
                  {ZONES.map(zone => (
                    <td
                      key={String(zone.key)}
                      style={{
                        padding: '11px 8px',
                        fontSize: 11,
                        verticalAlign: 'middle',
                        lineHeight: 1.35,
                        ...(isActiveDuty ? {
                          background: zone.activeBg,
                          borderTop: `2px solid ${zone.activeBorder}`,
                        } : {}),
                      }}
                    >
                      {formatName(String(row[zone.key] || ''), isActiveDuty, zone.activeText)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function thStyle(extra: React.CSSProperties): React.CSSProperties {
  return {
    padding: '10px 8px',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#5a6070',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ...extra,
  };
}
