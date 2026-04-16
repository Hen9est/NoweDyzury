const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new Database(dbPath);

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

db.exec(`
  CREATE TABLE IF NOT EXISTS duties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day TEXT NOT NULL,
    nr TEXT,
    time TEXT,
    zielony TEXT,
    fiolet TEXT,
    poma TEXT,
    undrg TEXT,
    zolty TEXT,
    czerw TEXT,
    nieb TEXT,
    parter TEXT,
    sg TEXT,
    obiad TEXT
  )
`);

db.exec('DELETE FROM duties');

const insert = db.prepare(`
  INSERT INTO duties (day, nr, time, zielony, fiolet, poma, undrg, zolty, czerw, nieb, parter, sg, obiad)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const [day, rows] of Object.entries(DEFAULT_DATA)) {
    for (const row of rows) {
        insert.run(day, ...row);
    }
}

console.log('Seeded database with initial data.');
