'use client';

import { useState, useEffect } from 'react';

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

const fields = [
  'nr', 'time', 'zielony', 'fiolet', 'poma', 'undrg', 
  'zolty', 'czerw', 'nieb', 'parter', 'sg', 'obiad'
] as const;

type Field = typeof fields[number];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [duties, setDuties] = useState<Duty[]>([]);
  const [currentDayId, setCurrentDayId] = useState<string>('poniedzialek');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple hardcoded password as requested
      setIsAuthenticated(true);
    } else {
      alert('Błędne hasło');
    }
  };

  const fetchDuties = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/schedule');
      const data = await res.json();
      setDuties(data);
    } catch (error) {
      console.error('Failed to fetch duties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDuties();
    }
  }, [isAuthenticated]);

  const updateDuty = async (id: number, field: Field, value: string) => {
    try {
      await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value })
      });
      // Update local state
      setDuties(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
    } catch (error) {
      console.error('Failed to update duty:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Panel Administracyjny</h1>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Hasło dostępu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Wpisz hasło..."
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors font-semibold"
          >
            Zaloguj się
          </button>
        </form>
      </div>
    );
  }

  const filteredDuties = duties.filter(d => d.day === currentDayId);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Zarządzanie Planem Dyżurów</h1>
          <div className="flex bg-white rounded-lg shadow p-1 border border-gray-200">
            {Object.entries(dayNameMap).map(([id, name]) => (
              <button
                key={id}
                onClick={() => setCurrentDayId(id)}
                className={`px-4 py-2 rounded-md transition-all ${
                  currentDayId === id 
                    ? 'bg-green-600 text-white shadow' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </header>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white text-xs uppercase tracking-wider">
                  <th className="p-3 border-b border-gray-700 w-16 text-center">Nr</th>
                  <th className="p-3 border-b border-gray-700 w-32 text-center">Czas</th>
                  <th className="p-3 border-b border-gray-700 text-center">Zielony</th>
                  <th className="p-3 border-b border-gray-700 text-center">Fiolet</th>
                  <th className="p-3 border-b border-gray-700 text-center">Poma.</th>
                  <th className="p-3 border-b border-gray-700 text-center">Undrg.</th>
                  <th className="p-3 border-b border-gray-700 text-center">Żółty</th>
                  <th className="p-3 border-b border-gray-700 text-center">Czerw.</th>
                  <th className="p-3 border-b border-gray-700 text-center">Nieb.</th>
                  <th className="p-3 border-b border-gray-700 text-center">Parter</th>
                  <th className="p-3 border-b border-gray-700 text-center">SG</th>
                  <th className="p-3 border-b border-gray-700 text-center">Obiad</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="p-10 text-center text-gray-500 italic">Ładowanie danych...</td>
                  </tr>
                ) : filteredDuties.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-10 text-center text-gray-500 italic">Brak danych dla tego dnia.</td>
                  </tr>
                ) : filteredDuties.map((row) => (
                  <tr key={row.id} className="hover:bg-green-50 transition-colors border-b border-gray-100">
                    <td className="p-1">
                      <EditableCell 
                        value={row.nr} 
                        onSave={(val) => updateDuty(row.id, 'nr', val)} 
                        className="text-center font-bold text-green-700"
                      />
                    </td>
                    <td className="p-1">
                      <EditableCell 
                        value={row.time} 
                        onSave={(val) => updateDuty(row.id, 'time', val)} 
                        className="text-center font-medium"
                      />
                    </td>
                    {fields.slice(2).map((field) => (
                      <td key={field} className="p-1">
                        <EditableCell 
                          value={row[field as keyof Duty] as string} 
                          onSave={(val) => updateDuty(row.id, field as Field, val)} 
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-500 text-sm">
          Wskazówka: Kliknij komórkę, aby ją edytować. Zmiany są zapisywane automatycznie po kliknięciu poza komórkę.
        </footer>
      </div>
    </div>
  );
}

function EditableCell({ value, onSave, className = "" }: { value: string; onSave: (val: string) => void; className?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onSave(currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setCurrentValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full p-1 border-2 border-green-500 rounded outline-none text-xs text-center bg-white"
        autoFocus
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer p-2 rounded hover:bg-white/50 min-h-[2.5rem] flex items-center justify-center text-xs break-words ${className}`}
    >
      {value === "-" || value.trim() === "" ? <span className="text-gray-300 italic">-</span> : value}
    </div>
  );
}
