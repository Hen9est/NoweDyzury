const { sql } = require('@vercel/postgres');

// Plan dyżurów obowiązujący od 02.09.2026 (rok szkolny 2026/2027)
// Źródło: dyzury_aga-09.2026.xlsx, arkusz "dyzury"
// Kolumna "poma" = dwie kolumny POMARAŃCZ z arkusza połączone znakiem "/"
const DEFAULT_DATA = {
    poniedzialek: [
        ["0", "8:00-8:10", "K. Matysek-Sobolewska", "M. Niedbał", "T. Majewski", "A. Stankiewicz", "R. Rogalski", "K. Jochymek", "A. Mizerska", "-", "M. Sławik", "-"],
        ["1", "8:55-9:05", "E. Szostak", "ks. A. Hepek", "A. Szydłowska/D. Gałka", "M. Ankiewicz", "A. Pierzchała-Badura", "P. Latosińska", "K. Jakubowska", "-", "T. Zygmunt", "-"],
        ["2", "9:50-10:00", "J. Wojtan", "M. Szydłowska", "K. Miąsik/O. Ginalska", "A. Stankiewicz", "D. Schelenz", "I. Wilczyńska", "M. Rzepka", "-", "M. Sławik", "-"],
        ["3", "10:45-10:55", "E. Krzyżyk", "R. Ciszewska", "E. Łubińska/A. Lorenc", "K. Bugajska", "A. Pierzchała-Badura", "J. Szymkowicz", "M. Rzepka", "-", "T. Zygmunt", "-"],
        ["4", "11:40-11:50", "P. Latosińska", "ks. A. Hepek", "D. Gałka/K. Jakubowska", "O. Ginalska", "E. Krzyżyk", "J. Wojtan", "A. Mizerska", "K. Matysek-Sobolewska", "D. Piątek", "E. Łubińska"],
        ["5", "12:35-12:45", "W. Wrzaszcz", "R. Rogalski", "M. Ankiewicz/P. Latosińska", "A. Stankiewicz", "A. Solińska", "K. Jochymek", "T. Zygmunt", "D. Piątek", "M. Sławik", "K. Czajęcka"],
        ["6", "13:30-13:35", "E. Szostak", "J. Miecznik-Warda", "E. Łubińska/K. Miąsik", "M. Ankiewicz", "K. Bugajska", "A. Mizerska", "K. Jakubowska", "-", "T. Zygmunt", "-"],
        ["7", "14:20-14:25", "K. Jochymek", "R. Ciszewska", "D. Gałka", "-", "J. Szymkowicz", "K. Bugajska", "A. Solińska", "-", "D. Piątek", "-"]
    ],
    wtorek: [
        ["0", "8:00-8:10", "A. Szydłowska", "M. Szydłowska", "A. Stankiewicz", "M. Szeligiewicz", "A. Pierzchała-Badura", "K. Bugajska", "A. Mizerska", "-", "D. Piątek", "-"],
        ["1", "8:55-9:05", "W. Wrzaszcz", "M. Niedbał", "T. Majewski/D. Gałka", "O. Ginalska", "K. Jakubowska", "J. Wojtan", "A. Mizerska", "-", "M. Sławik", "-"],
        ["2", "9:50-10:00", "E. Szostak", "M. Ankiewicz", "A. Szydłowska/D. Kolany", "M. Szeligiewicz", "A. Pierzchała-Badura", "D. Schelenz", "M. Rzepka", "-", "D. Piątek", "-"],
        ["3", "10:45-10:55", "E. Łubińska", "J. Miecznik-Warda", "M. Piekarski/A. Stankiewicz", "A. Misiołek", "P. Latosińska", "K. Bugajska", "T. Zygmunt", "-", "M. Sławik", "-"],
        ["4", "11:40-11:50", "K. Matysek-Sobolewska", "R. Rogalski", "K. Jakubowska/T. Majewski", "M. Szeligiewicz", "D. Schelenz", "J. Wojtan", "A. Mizerska", "J. Szymkowicz", "D. Piątek", "R. Ciszewska"],
        ["5", "12:35-12:45", "E. Krzyżyk", "K. Miąsik", "D. Gałka/M. Ankiewicz", "A. Misiołek", "R. Rogalski", "M. Rzepka", "A. Pierzchała-Badura", "K. Jochymek", "-", "K. Bugajska"],
        ["6", "13:30-13:35", "K. Matysek-Sobolewska", "R. Ciszewska", "M. Niedbał/K. Jakubowska", "M. Szeligiewicz", "A. Lorenc", "M. Rzepka", "A. Mizerska", "-", "-", "-"],
        ["7", "14:20-14:25", "E. Szostak", "J. Miecznik-Warda", "A. Szydłowska", "-", "J. Szymkowicz", "K. Jochymek", "P. Latosińska", "-", "-", "-"]
    ],
    sroda: [
        ["0", "8:00-8:10", "E. Szostak", "R. Ciszewska", "K. Miąsik", "A. Misiołek", "M. Ankiewicz", "I. Wilczyńska", "M. Rzepka", "-", "K. Czajęcka", "-"],
        ["1", "8:55-9:05", "K. Matysek-Sobolewska", "K. Jochymek", "A. Stankiewicz/E. Łubińska", "O. Ginalska", "R. Rogalski", "T. Majewski", "A. Mizerska", "-", "T. Zygmunt", "-"],
        ["2", "9:50-10:00", "W. Wrzaszcz", "K. Bugajska", "A. Szydłowska/J. Hartel", "M. Szeligiewicz", "A. Pierzchała-Badura", "I. Wilczyńska", "K. Jakubowska", "-", "D. Piątek", "-"],
        ["3", "10:45-10:55", "M. Niedbał", "J. Miecznik-Warda", "M. Piekarski/O. Ginalska", "A. Misiołek", "D. Schelenz", "J. Szymkowicz", "M. Rzepka", "-", "T. Zygmunt", "-"],
        ["4", "11:40-11:50", "K. Matysek-Sobolewska", "M. Niedbał", "A. Lorenc/T. Majewski", "A. Stankiewicz", "E. Krzyżyk", "J. Wojtan", "A. Mizerska", "A. Szydłowska", "M. Sławik", "W. Wrzaszcz"],
        ["5", "12:35-12:45", "M. Ankiewicz", "R. Rogalski", "E. Krzyżyk/A. Pierzchała-Badura", "A. Misiołek", "J. Szymkowicz", "K. Jochymek", "K. Jakubowska", "A. Lorenc", "D. Piątek", "K. Bugajska"],
        ["6", "13:30-13:35", "W. Wrzaszcz", "M. Szydłowska", "O. Ginalska/K. Miąsik", "-", "D. Schelenz", "J. Wojtan", "M. Rzepka", "-", "T. Zygmunt", "-"],
        ["7", "14:20-14:25", "M. Ankiewicz", "ks. A. Hepek", "A. Szydłowska", "-", "K. Bugajska", "J. Wojtan", "K. Jochymek", "-", "M. Sławik", "-"]
    ],
    czwartek: [
        ["0", "8:00-8:10", "W. Wrzaszcz", "J. Miecznik-Warda", "D. Gałka", "O. Ginalska", "A. Lorenc", "K. Jochymek", "T. Zygmunt", "-", "-", "-"],
        ["1", "8:55-9:05", "M. Niedbał", "R. Ciszewska", "E. Krzyżyk/T. Majewski", "A. Stankiewicz", "K. Jochymek", "P. Latosińska", "M. Rzepka", "-", "T. Zygmunt", "-"],
        ["2", "9:50-10:00", "K. Matysek-Sobolewska", "M. Szydłowska", "K. Jakubowska/D. Gałka", "O. Ginalska", "D. Schelenz", "K. Bugajska", "A. Mizerska", "-", "D. Piątek", "-"],
        ["3", "10:45-10:55", "E. Szostak", "R. Ciszewska", "M. Piekarski/T. Majewski", "A. Stankiewicz", "J. Szymkowicz", "J. Wojtan", "T. Zygmunt", "-", "K. Czajęcka", "-"],
        ["4", "11:40-11:50", "W. Wrzaszcz", "M. Szydłowska", "K. Miąsik/D. Kolany", "-", "M. Ankiewicz", "K. Bugajska", "A. Mizerska", "-", "-", "-"],
        ["5", "12:35-12:50", "E. Szostak", "K. Bugajska", "E. Łubińska/O. Ginalska", "-", "P. Latosińska", "A. Pierzchała-Badura", "K. Jakubowska", "A. Stankiewicz", "-", "K. Matysek-Sobolewska"],
        ["6", "13:35-13:50", "-", "M. Niedbał", "M. Rzepka", "-", "-", "J. Wojtan", "-", "J. Hartel", "-", "D. Schelenz"],
        ["7", "14:35-14:40", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]
    ],
    piatek: [
        ["0", "8:00-8:10", "K. Matysek-Sobolewska", "M. Szydłowska", "E. Łubińska", "O. Ginalska", "R. Rogalski", "J. Wojtan", "K. Jakubowska", "-", "K. Czajęcka", "-"],
        ["1", "8:55-9:05", "M. Niedbał", "ks. A. Hepek", "J. Hartel/D. Gałka", "M. Szeligiewicz", "A. Pierzchała-Badura", "I. Wilczyńska", "M. Rzepka", "-", "D. Piątek", "-"],
        ["2", "9:50-10:00", "K. Bugajska", "R. Ciszewska", "J. Wojtan/D. Kolany", "O. Ginalska", "R. Rogalski", "K. Jochymek", "A. Mizerska", "-", "K. Czajęcka", "-"],
        ["3", "10:45-10:55", "K. Miąsik", "E. Łubińska", "P. Latosińska/J. Szymkowicz", "M. Szeligiewicz", "M. Ankiewicz", "D. Schelenz", "K. Jakubowska", "-", "M. Sławik", "-"],
        ["4", "11:40-11:50", "K. Matysek-Sobolewska", "J. Miecznik-Warda", "A. Stankiewicz/T. Majewski", "O. Ginalska", "P. Latosińska", "K. Bugajska", "A. Mizerska", "-", "D. Piątek", "-"],
        ["5", "12:35-12:50", "E. Krzyżyk", "M. Szydłowska", "E. Łubińska/K. Miąsik", "M. Szeligiewicz", "A. Pierzchała-Badura", "M. Rzepka", "T. Zygmunt", "K. Jochymek", "-", "W. Wrzaszcz"],
        ["6", "13:35-13:50", "E. Szostak", "J. Miecznik-Warda", "D. Gałka/P. Latosińska", "-", "M. Ankiewicz", "J. Wojtan", "A. Stankiewicz", "D. Schelenz", "-", "A. Szydłowska"],
        ["7", "14:35-14:40", "M. Niedbał", "M. Szydłowska", "K. Miąsik", "-", "-", "K. Jochymek", "T. Zygmunt", "-", "-", "-"]
    ]
};

async function seed() {
  try {
    if (process.env.ALLOW_DB_SEED !== 'true') {
      throw new Error('Seed blocked. Set ALLOW_DB_SEED=true to overwrite duties data.');
    }

    await sql`
      CREATE TABLE IF NOT EXISTS duties (
        id SERIAL PRIMARY KEY,
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
    `;

    await sql`DELETE FROM duties`;

    console.log('Inserting initial data...');
    
    for (const [day, rows] of Object.entries(DEFAULT_DATA)) {
        for (const row of rows) {
            await sql.query(`
              INSERT INTO duties (day, nr, time, zielony, fiolet, poma, undrg, zolty, czerw, nieb, parter, sg, obiad)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [day, ...row]);
        }
    }

    console.log('Seeded database with initial data.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  }
}

seed();
