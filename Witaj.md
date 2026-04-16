

**Kontekst projektu:**
Zbuduj lekką aplikację webową do wyświetlania i zarządzania planem dyżurów nauczycielskich na korytarzach szkolnych. Projekt ma zastąpić obecny, statyczny plik HTML, który podaję na końcu tej instrukcji. Głównym celem jest przejście na system dynamiczny, w którym osoba nietechniczna układająca plan będzie mogła samodzielnie go aktualizować z poziomu przeglądarki, bez jakiejkolwiek ingerencji w kod źródłowy.

## 1. Migracja z obecnego rozwiązania (Kluczowe wymaganie)
Twoim pierwszym zadaniem jest dogłębna analiza dostarczonego przeze mnie starego kodu. Zwróć szczególną uwagę na:
* **Identyczne wymiary i układ:** Nowy widok publiczny musi zachować **dokładnie takie same wymiary** (szerokość/wysokość, proporcje, marginesy) i skalowanie jak obecna strona. Wyświetla się ona na z góry określonym, wydzielonym fragmencie fizycznej tablicy informacyjnej w szkole – nowy kod nie może zaburzyć tego układu. Zastosuj podobne rozwiązania stylowe, unowocześniając jedynie sam design (lepsza czytelność, kolory, typografia), ale absolutnie nie naruszając siatki (grid/layout).
* **Odwzorowanie danych (Stan początkowy 1:1):** Wyekstrahuj ze starego kodu HTML obecny plan dyżurów (kto, gdzie i kiedy dyżuruje). Użyj tych danych do zasilenia początkowego stanu nowej aplikacji (tzw. bazowy seed). Po uruchomieniu nowej strony, musi ona domyślnie wyświetlać dokładnie ten sam plan, co stara wersja.
* **Zachowanie użyteczności:** Przeanalizuj funkcjonalności obecnego widoku i upewnij się, że nowa wersja nie traci żadnych obecnych możliwości informacyjnych.

## 2. Główne komponenty i wymagania biznesowe

### Widok publiczny (Tablica informacyjna na korytarzu)
* **Przeznaczenie:** Stałe wyświetlanie na ekranie w szkole.
* **UI/UX:** Czytelny, nowoczesny i jasny design. Odpowiedni kontrast i wielkość fontów, aby informacje były dobrze widoczne z odległości kilku metrów.
* **Bezpieczeństwo front-endu:** Ten widok to tzw. "read-only". Nie może zawierać żadnych klikalnych przycisków, nawigacji administracyjnej ani ukrytych linków do ekranu logowania.

### Widok administracyjny (Ukryty panel zarządzania)
* **Dostępność:** Panel ukryty pod niestandardowym adresem URL (np. `/ukryty-panel-planisty`), nieznany osobom postronnym i nielinkowany z zewnątrz.
* **Uwierzytelnianie:** Prosty ekran logowania chroniący dostęp (np. na jedno globalne, ustalone hasło lub prosta sesja).
* **Funkcjonalność edycji (CRUD):** Intuicyjny, bardzo prosty panel pozwalający osobie nietechnicznej dodawać, edytować i usuwać dyżury. Zmiany muszą po zapisaniu natychmiast aktualizować się na publicznej tablicy.

## 3. Zadania krok po kroku dla Agenta:
1.  Przeanalizuj dostarczony poniżej stary kod HTML/CSS pod kątem wymiarów i struktury danych.
2.  Zaproponuj lekki, prosty w utrzymaniu stos technologiczny do tego zadania (np. Node.js + plik JSON/SQLite jako baza, by uniknąć stawiania serwera bazodanowego, lub Next.js z lokalnym storage).
3.  Stwórz skrypt inicjalizujący bazę danych na podstawie danych wyciągniętych z mojego pliku HTML.
4.  Zbuduj szkielet aplikacji zawierający część publiczną (zachowującą obecne wymiary) oraz chronioną część administracyjną.
5.  Zatrzymaj się i poczekaj na moją akceptację zaproponowanego stosu technologicznego, zanim zaczniesz generować pełny kod.

---

**[MIEJSCE NA KOD]** Oto kod mojej obecnej strony, o którym mowa w instrukcji:

<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Plan Dyżurów - Wiosenna Edycja</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"> 
    <style>
        /* --- WIOSENNY KLIMAT --- */
        
        /* Tło poza ekranem - Świeża łąka */
        body { 
            font-family: 'Inter', sans-serif; 
            background-color: #f0fdf4; /* Bardzo jasna zieleń (green-50) */
            background-image: radial-gradient(#bbf7d0 1px, transparent 1px); /* Delikatne kropki jak pyłki */
            background-size: 30px 30px;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
            overflow: auto;
        }

        /* Symulacja ekranu - Świeży design */
        #device-screen {
            width: 640px;
            height: 500px;
            background-color: #ffffff;
            position: relative;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(34, 197, 94, 0.2); /* Zielona poświata */
            flex-shrink: 0;
            border: 8px solid #22c55e; /* Zielona ramka (green-500) */
            border-radius: 12px;
        }

        /* Obszar roboczy */
        #content-area {
            width: 100%;
            height: 470px; 
            overflow: hidden; 
            padding: 6px;
            display: flex;
            flex-direction: column;
            z-index: 10;
        }

        /* Margines bezpieczeństwa - Wiosenny wzór (trawa/kwiaty) */
        #safe-margin {
            height: 30px;
            width: 100%;
            background: repeating-linear-gradient(
                45deg,
                #22c55e,
                #22c55e 10px,
                #86efac 10px,
                #86efac 20px
            );
            opacity: 0.9;
        }

        /* Kolory nagłówków */
        .header-green { background-color: #166534; color: white; }
        .header-purple { background-color: #9333ea; color: white; }
        .header-orange { background-color: #ea580c; color: white; }
        .header-yellow { background-color: #eab308; color: #422006; font-weight: bold; }
        .header-red { background-color: #dc2626; color: white; }
        .header-blue { background-color: #0284c7; color: white; }
        .header-gray { background-color: #4b5563; color: white; }
        
        /* Animacja pulsowania - Wiosenne słońce/wzrost */
        @keyframes pulse-spring {
            0%, 100% { background-color: #f0fdf4; border-left-color: #22c55e; box-shadow: inset 0 0 10px rgba(34, 197, 94, 0.1); }
            50% { background-color: #dcfce7; border-left-color: #16a34a; box-shadow: inset 0 0 15px rgba(34, 197, 94, 0.3); }
        }

        .highlight-row { 
            animation: pulse-spring 3s infinite ease-in-out;
            font-weight: 700;
            border-left: 4px solid #22c55e !important;
        }
        .highlight-row td { color: #14532d; } /* Ciemna zieleń tekstu */

        /* Styl linii podczas lekcji - Świeża linia */
        .lesson-separator td {
            border-bottom: 3px dashed #22c55e !important; 
        }

        td.empty-cell { text-align: center; color: #cbd5e1; font-size: 8px; }
        
        /* Tabela */
        .compact-table { table-layout: fixed; }
        .compact-table th, .compact-table td {
            padding: 1px 2px;
            font-size: 9px; 
            line-height: 1.2;
            text-align: center;
            white-space: normal;
            word-break: break-word;
            border-bottom: 1px solid #f0fdf4;
            border-right: 1px solid #f0fdf4; 
            overflow: hidden;
        }
        
        .compact-table tbody tr:nth-child(even) { background-color: #ffffff; }
        .compact-table tbody tr:nth-child(odd) { background-color: #f7fee7; } /* Lekko limonkowe tło wierszy */

        .compact-table thead th { 
            font-size: 8px; 
            text-align: center; 
            border-bottom: 1px solid rgba(255,255,255,0.3); 
            padding-top: 4px;
            padding-bottom: 4px;
            vertical-align: middle;
            text-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        .nr-column { width: 18px; background-color: #15803d; color: #f0fdf4; }
        .hour-column { width: 35px; font-size: 8px !important; background-color: #166534; color: #f0fdf4; }
        .obiad-column { width: 45px; }
        
        /* Tytuł dnia */
        #current-day-title { 
            font-family: Impact, "Arial Black", sans-serif;
            font-size: 22px; 
            font-weight: 700;
            color: #15803d; /* Ciemna zieleń */
        }

        /* Pasek postępu - Spring Stripe (Słoneczny wzór) */
        .spring-stripe {
            background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.4) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.4) 75%, transparent 75%, transparent);
            background-size: 20px 20px;
            animation: move-stripes 1.5s linear infinite;
        }
        @keyframes move-stripes {
            from { background-position: 0 0; }
            to { background-position: 20px 20px; }
        }

        #progress-bar {
            transition: width 1s linear, background-color 0.5s ease;
        }
    </style>
</head>
<body>

    <div id="device-screen">
        
        <div id="content-area">
            
            <div class="flex items-center justify-between gap-2 mb-2 bg-white p-1 px-3 rounded-lg shadow-md border-2 border-green-100 min-h-[3rem] shrink-0 relative overflow-hidden">
                <!-- Słoneczny motyw w tle nagłówka -->
                <div class="absolute top-0 right-0 opacity-10 pointer-events-none">
                     <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" class="text-yellow-500">
                        <path d="M12,7L14,12L19,14L14,16L12,21L10,16L5,14L10,12L12,7M12,3.5L9.5,9.5L3.5,12L9.5,14.5L12,20.5L14.5,14.5L20.5,12L14.5,9.5L12,3.5Z" />
                    </svg>
                </div>

                <div class="flex items-center gap-2 z-10">
                    <span class="text-2xl">🌸</span>
                    <div id="current-day-title" class="uppercase tracking-wide whitespace-nowrap pt-1">
                        Budzenie...
                    </div>
                </div>

                <div id="timer-container" class="flex items-center gap-3 flex-grow justify-end hidden z-10">
                    <div class="flex flex-col items-end leading-none">
                        <span id="timer-label" class="text-[9px] font-bold uppercase tracking-wider text-green-700">Do końca:</span>
                        <span id="timer-countdown" class="text-lg font-mono font-bold text-gray-800">00:00</span>
                    </div>
                    
                    <div class="w-28 bg-green-50 rounded-full h-3 overflow-hidden border border-green-100 shadow-inner">
                        <div id="progress-bar" class="h-full rounded-full spring-stripe" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <main class="bg-white/90 rounded-lg shadow-lg overflow-hidden border border-green-100 flex-grow relative backdrop-blur-sm">
                <div class="h-full w-full overflow-auto">
                    <table class="w-full text-gray-700 compact-table border-collapse">
                        <thead class="text-white uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th scope="col" class="nr-column rounded-tl-lg">Nr</th>
                                <th scope="col" class="hour-column">Czas</th>
                                <th scope="col" class="header-green">Zielony</th>
                                <th scope="col" class="header-purple">Fiolet</th>
                                <th scope="col" class="header-orange">Poma.</th>
                                <th scope="col" class="bg-gray-500">Undrg.</th>
                                <th scope="col" class="header-yellow">Żółty</th>
                                <th scope="col" class="header-red">Czerw.</th>
                                <th scope="col" class="header-blue">Nieb.</th>
                                <th scope="col" class="bg-gray-500">Parter</th>
                                <th scope="col" class="bg-gray-500">SG</th>
                                <th scope="col" class="header-gray obiad-column rounded-tr-lg">Obiad</th>
                            </tr>
                        </thead>
                        
                        <tbody id="tbody-poniedzialek" class="schedule-body hidden"></tbody>
                        <tbody id="tbody-wtorek" class="schedule-body hidden"></tbody>
                        <tbody id="tbody-sroda" class="schedule-body hidden"></tbody>
                        <tbody id="tbody-czwartek" class="schedule-body hidden"></tbody>
                        <tbody id="tbody-piatek" class="schedule-body hidden"></tbody>
                    </table>
                </div>
            </main>
        </div>

        <div id="safe-margin"></div>
    </div>

<script>
        const DEFAULT_DATA = {
            poniedzialek: [
                ["0", "8:00-8:10", "E. Szostak", "M. Szydłowska", "A. Pierzchała-Badura", "-", "J. Szymkowicz", "I. Wilczyńska", "A. Mizerska", "-", "K. Czajęcka", "-"],
                ["1", "8:55-9:05", "K. Matysek-Sob", "M. Niedbał", ".E. Łubińska/M. Piekarski", "O. Ginalska", "T. Majewski", "M. Ankiewicz", "A. Mizerska", "-", "K. Czajęcka", "-"],
                ["2", "9:50-10:00", "M. Ankiewicz", "R. Rogalski", "D. Gałka/A. Pierzchała-Badura", "A. Stankiewicz", "J. Szymkowicz", "J. Wojtan", "M. Rzepka", "-", "D. Piątek", "-"],
                ["3", "10:45-10:55", "E. Szostak", "M. Szydłowska", "E. Łubińska/M. Piekarski", "O. Ginalska", "T. Majewski", "D. Schelenz", "A. Mizerska", "-", "T. Zygmunt", "-"],
                ["4", "11:40-11:50", "W. Wrzaszcz", "J. Miecznik", "A. Szydłowska/ks. A. Hepek", "O. Ginalska", "E. Krzyżyk", "J. Szymkowicz", "R. Rogalski", "I. Wilczyńska", "M. Sławik", "-"],
                ["5", "12:35-12:45", "-", "-", "A. Pierzchała/A. Lorenc", "A. Stankiewicz", "T. Majewski", "J. Wojtan", "K. Jakubowska", "K. Bugajska", "D. Piątek", "-"]
            ],
            wtorek: [
                ["0", "8:00-8:10", "W. Wrzaszcz", "J. Miecznik", "E. Szostak", "-", "O. Ginalska", "K. Jochymek", "M. Rzepka", "-", "T. Zygmunt", "-"],
                ["1", "8:55-9:05", "A. Szydłowska", "M. Szydłowska", "P. Latosińska/I. Wilcz", "A. Misiołek", "T. Majewski", "J. Wojtan", "K. Jakubowska", "-", "K. Matysek-Sob", "-"],
                ["2", "9:50-10:00", "K. Matysek-Sobolewska", "R. Ciszewska", "D. Schelenz/A. Lorenc", "M. Szeligiewicz", "D. Kolany", "K. Bugajska", "A. Mizerska", "-", "T. Zygmunt", "-"],
                ["3", "10:45-10:55", "W. Wrzaszcz", "J. Miecznik", "A. Szydł/E. Łubińska", "A. Misiołek", "A. Stankiewicz", "K. Jochymek", "K. Jakubowska", "-", "M. Sławik", "-"],
                ["4", "11:40-11:50", "K. Matysek-Sob", "R. Ciszewska", "A. Pierzc/D. Kolany", "O. Ginalska", "E. Krzyżyk", "J. Wojtan", "M. Rzepka", "P. Latosińska", "D. Piątek", "-"],
                ["5", "12:35-12:45", "-", "-", "M. Niedbał/R. Rogalski", "M. Szeligiewicz", "J. Szymkowicz", "K. Bugajska", "K. Jakubowska", "M. Ankiewicz", "D. Piątek", "-"]
            ],
            sroda: [
                ["0", "8:00-8:10", "K. Matysek-Sob", "M. Niedbał", "E. Łubińska", "-", "J. Dominikowska", "J. Wojtan", "K. Jakubowska", "-", "K. Czajęcka", "-"],
                ["1", "8:55-9:05", "E. Szostak", "J. Miecznik", "E. Łub/A. Pierzch", "M. Szeligiewicz", "M. Misiołek", "I. Wilczyńska", "M. Rzepka", "-", "T. Zygmunt", "-"],
                ["2", "9:50-10:00", "K. Matysek-Sob", "R. Ciszewska", "M. Niedbał/A. Szydłowska", "J. Dominikowska", "T. Majewski", "K. Bugajska", "R. Rogalski", "-", "K. Czajęcka", "-"],
                ["3", "10:45-10:55", "W. Wrzaszcz", "R. Rogalski", "D. Gałka/M. Ankiewicz", "M. Szeligiewicz", "A. Stankiewicz", "J. Wojtan", "T. Zygmunt", "-", "D. Piątek", "-"],
                ["4", "11:40-11:50", "J. Hartel", "M. Szydłowska", "A. Szydłowska/M. Piekarski", "A. Misiołek", "J. Szymkowicz", "K. Jakubowska", "A. Mizerska", "A. Lorenc", "M. Sławik", "-"],
                ["5", "12:35-12:45", "-", "-", "D. Schelenz/E. Łubińska", "M. Szeligiewicz", "D. Gałka", "K. Bugajska", "A. Mizerska", "A. Stankiewicz", "T. Zygmunt", "-"]
            ],
            czwartek: [
                ["0", "8:00-8:10", "K. Matysek-Sob", "R. Ciszewska", "A. Stankiewicz", "-", "T. Majewski", "D. Schelenz", "A. Solińska", "-", "T. Zygmunt", "-"],
                ["1", "8:55-9:05", "K. Matysek-Sob", "R. Ciszewska", "A. Pierzch/D. Gałka", "O. Ginalska", "P. Latosińska", "K. Jochymek", "M. Rzepka", "-", "D. Piątek", "-"],
                ["2", "9:50-10:00", "E. Szostak", "M. Szydłowska", "A. Szydłowska/D. Kolany", "A. Stankiewicz", "K. Jakubowska", "I. Wilczyńska", "A. Mizerska", "-", "T. Zygmunt", "-"],
                ["3", "10:45-10:55", "W. Wrzaszcz", "R. Ciszewska", "D. Gałka/P. Latosińska", "O. Ginalska", "J. Szymkowicz", "K. Bugajska", "A. Solińska", "-", "K. Czajęcka", "-"],
                ["4", "11:40-11:50", "W. Wrzaszcz", "R. Rogalski", "E. Łubińska/M. Niedbał", "M. Ankiewicz", "J. Wojtan", "K. Jochymek", "K. Jakubowska", "J. Hartel", "-", "-"],
                ["5", "12:35-12:50", "P. Latosińska", "J. Miecznik", "A. Pierzch/D. Gałka", "O. Ginalska", "T. Majewski", "J. Wojtan", "A. Mizerska", "K. Bugajska", "-", "E. Łubińska"],
                ["6", "13:35-13:50", "-", "-", "M. Niedbał", "", "E. Krzyżyk", "-", "-", "M. Rzepka", "-", "A. Stankiewicz"]
            ],
            piatek: [
                ["0", "8:00-8:10", "M. Ankiewicz", "R. Rogalski", "A. Szydłowska", "-", "M. Piekarski", "K. Bugajska", "A. Mizerska", "-", "D. Piątek", "-"],
                ["1", "8:55-9:05", "K. Matysek-Sobolewska", "ks. A. Hapek", "A. Pierzch/P. Latos", "M. Ankiewicz", "T. Majewski", "J. Wojtan", "K. Jakubowska", "-", "T. Zygmunt", "-"],
                ["2", "9:50-10:00", "M. Niedbał", "M. Szydłowska", "A. Szydłowska/D. Gałka", "A. Stankiewicz", "T. Majewski", "K. Jochymek", "M. Rzepka", "-", "K. Czajęcka", "-"],
                ["3", "10:45-10:55", "R. Rogalski", "J. Miecznik", "E. Łubińska/D. Schelenz", "A. Solińska", "J. Szymkowicz", "K. Jakubowska", "A. Mizerska", "-", "M. Sławik", "-"],
                ["4", "11:40-11:50", "M. Niedbał", "J. Hartel", "A. Pierzch/D. Kolany", "O. Ginalska", "E. Krzyżyk", "K. Bugajska", "M. Rzepka", "P. Latosińska", "M. Sławik", "-"],
                ["5", "12:35-12:50", "K. Matysek-Sobolewska", "E. Łubińska", "D. Gałka/M. Piekarski", "A. Stankiewicz", "K. Jochymek", "J. Wojtan", "A. Mizerska", "J. Hartel", "D. Piątek", "W. Wrzaszcz"],
                ["6", "13:35-13:50", "M. Niedbał", "E. Szostak", "P. Latosińska", "O. Ginalska", "D. Schelenz", "M. Rzepka", "-", "D. Piątek", "T. Zygmunt", "R. Ciszewska"],
                ["7", "14:35-14:40", "-", "-", "-", "-", "-", "-", "-", "-", "T. Zygmunt", "-"]
            ]
        };

    function generujTabele() {
        for (const [dzien, wiersze] of Object.entries(DEFAULT_DATA)) {
            const tbody = document.getElementById(`tbody-${dzien}`);
            if (!tbody) continue;
            
            tbody.innerHTML = ''; 
            
            wiersze.forEach(daneWiersza => {
                const tr = document.createElement('tr');
                
                daneWiersza.forEach((tresc, index) => {
                    const td = document.createElement('td');
                    if (index === 0) td.className = "font-bold text-green-600"; 
                    if (index === 1) td.className = "font-medium"; 
                    if (tresc === "-" || tresc.trim() === "") {
                        td.className += " empty-cell";
                    }
                    td.innerHTML = tresc;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }
    }

    function updateTimer(startTimeInMinutes, endTimeInMinutes, isLesson) {
        const timerContainer = document.getElementById('timer-container');
        const progressBar = document.getElementById('progress-bar');
        const countdownText = document.getElementById('timer-countdown');
        const timerLabel = document.getElementById('timer-label');

        timerContainer.classList.remove('hidden');

        if (isLesson) {
            timerLabel.innerText = "LEKCJA TRWA:";
            timerLabel.className = "text-[9px] font-bold uppercase tracking-wider text-green-700";
            progressBar.classList.remove('bg-orange-400');
            progressBar.classList.add('bg-green-500');
        } else {
            timerLabel.innerText = "PRZERWA TRWA:";
            timerLabel.className = "text-[9px] font-bold uppercase tracking-wider text-orange-600";
            progressBar.classList.remove('bg-green-500');
            progressBar.classList.add('bg-orange-400');
        }

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
            progressBar.style.width = '100%';
            countdownText.innerText = "00:00";
            return;
        }

        const percentage = Math.min(100, Math.max(0, (elapsedSeconds / totalDurationSeconds) * 100));
        progressBar.style.width = `${percentage}%`;
        
        const m = Math.floor(remainingSeconds / 60);
        const s = remainingSeconds % 60;
        countdownText.innerText = `${m}:${s < 10 ? '0' + s : s}`;
    }

    document.addEventListener('DOMContentLoaded', function() {
        generujTabele(); 

        const schedules = document.querySelectorAll('.schedule-body');
        const currentDayTitle = document.getElementById('current-day-title');
        const dayIdMap = ['niedziela', 'poniedzialek', 'wtorek', 'sroda', 'czwartek', 'piatek', 'sobota'];
        const dayNameMap = {
            'niedziela': 'Niedziela', 'poniedzialek': 'Poniedziałek', 'wtorek': 'Wtorek',
            'sroda': 'Środa', 'czwartek': 'Czwartek', 'piatek': 'Piątek', 'sobota': 'Sobota'
        };

        function updateState(dayId) {
            document.querySelectorAll('.schedule-body tr').forEach(row => {
                row.classList.remove('highlight-row');
                row.classList.remove('lesson-separator');
            });

            const activeTbody = document.getElementById(`tbody-${dayId}`);
            if (!activeTbody) {
                document.getElementById('timer-container').classList.add('hidden');
                return;
            }

            const rows = activeTbody.querySelectorAll('tr');
            const now = new Date();
            const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
            
            let activeFound = false;
            let previousBreakEnd = null;
            let previousRow = null;

            const firstTimeCell = rows[0].cells[1];
            let firstBreakStart = 8 * 60; 
            
            if (firstTimeCell) {
                const text = firstTimeCell.innerText || firstTimeCell.textContent;
                const parts = text.split('-');
                if (parts.length >= 1) {
                     const startMatch = parts[0].match(/(\d{1,2}):(\d{2})/);
                     if (startMatch) {
                        firstBreakStart = parseInt(startMatch[1], 10) * 60 + parseInt(startMatch[2], 10);
                     }
                }
            }
            
            if (currentTimeInMinutes < firstBreakStart) {
                const lessonStart = 8 * 60;
                updateTimer(lessonStart, firstBreakStart, true);
                rows[0].classList.add('highlight-row');
                activeFound = true;
                return;
            }

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const timeCell = row.cells[1]; 
                if (!timeCell) continue;
                
                const timeText = timeCell.innerText || timeCell.textContent;
                const parts = timeText.split('-');
                if (parts.length < 2) continue;

                const startStr = parts[0].trim();
                const endStr = parts[1].trim();

                const timeMatchStart = startStr.match(/(\d{1,2}):(\d{2})/);
                const timeMatchEnd = endStr.match(/(\d{1,2}):(\d{2})/);

                if (timeMatchStart && timeMatchEnd) {
                    const startTimeInMinutes = parseInt(timeMatchStart[1], 10) * 60 + parseInt(timeMatchStart[2], 10);
                    const endTimeInMinutes = parseInt(timeMatchEnd[1], 10) * 60 + parseInt(timeMatchEnd[2], 10);
                    
                    if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
                        row.classList.add('highlight-row');
                        updateTimer(startTimeInMinutes, endTimeInMinutes, false);
                        activeFound = true;
                        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        return;
                    }
                    
                    if (previousBreakEnd !== null) {
                        if (currentTimeInMinutes >= previousBreakEnd && currentTimeInMinutes < startTimeInMinutes) {
                            if (previousRow) previousRow.classList.add('lesson-separator');
                            updateTimer(previousBreakEnd, startTimeInMinutes, true);
                            activeFound = true;
                            if(previousRow) previousRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            return;
                        }
                    }
                    previousBreakEnd = endTimeInMinutes;
                    previousRow = row;
                }
            }

            if (!activeFound) {
                document.getElementById('timer-container').classList.add('hidden');
            }
        }

        function showScheduleForDay(dayId) {
            if (!DEFAULT_DATA[dayId]) dayId = 'poniedzialek';
            schedules.forEach(tbody => tbody.classList.add('hidden'));
            const activeTbody = document.getElementById(`tbody-${dayId}`);
            if (activeTbody) activeTbody.classList.remove('hidden');
            if (currentDayTitle) currentDayTitle.textContent = `DYŻURY: ${dayNameMap[dayId].toUpperCase()}`;
            updateState(dayId);
        }

        const todayIndex = new Date().getDay();
        const defaultDayId = (todayIndex === 0 || todayIndex === 6) ? 'poniedzialek' : dayIdMap[todayIndex];
        showScheduleForDay(defaultDayId);

        setInterval(() => {
            const now = new Date();
            const currentDayIndex = now.getDay();
            const currentDayId = (currentDayIndex === 0 || currentDayIndex === 6) ? 'poniedzialek' : dayIdMap[currentDayIndex];
            const activeTbody = document.querySelector('.schedule-body:not(.hidden)');
            const activeId = activeTbody ? activeTbody.id.replace('tbody-', '') : null;
            if (currentDayId !== activeId) {
                showScheduleForDay(currentDayId);
            } else {
                updateState(currentDayId);
            }
        }, 1000);
    });
</script>

</body>
</html>