// Real-World Database of Teams, schedules, Player Props & Bookmaker lines comparison (v4)

const FAVORITES_STORAGE_KEY = "apex_predict_favorite_teams";

// Load favorite team IDs from localStorage
function getFavoriteTeams() {
  const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

// Save favorite team IDs to localStorage
function saveFavoriteTeam(teamId, isFav) {
  let favs = getFavoriteTeams();
  if (isFav) {
    if (!favs.includes(teamId)) favs.push(teamId);
  } else {
    favs = favs.filter(id => id !== teamId);
  }
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favs));
}

const sportsDatabase = {
  // FIFA World Cup Teams, schedules, Props & Odds
  epl: {
    name: "World Cup 2026",
    averageScore: 1.45,
    teams: [
      { 
        id: "usa", name: "United States", shortName: "USA", color: "#002868", offense: 1.25, defense: 0.88, homeAdvantage: 0.15, form: 0.82, 
        h2h: { paraguay: [2, 0, 1], mexico: [1, 2, 0], brazil: [1, 5, 2] },
        players: [
          { name: "Christian Pulisic", category: "Shots on Target", baseLine: 1.5, multiplier: 1.1 },
          { name: "Folarin Balogun", category: "Goals Scored", baseLine: 0.5, multiplier: 1.0 },
          { name: "Weston McKennie", category: "Pass Completions", baseLine: 42.5, multiplier: 1.05 }
        ]
      },
      { 
        id: "mexico", name: "Mexico", shortName: "MEX", color: "#006341", offense: 1.22, defense: 0.90, homeAdvantage: 0.18, form: 0.80, 
        h2h: { safrica: [2, 1, 1], usa: [2, 1, 0], brazil: [0, 2, 0] },
        players: [
          { name: "Santiago Giménez", category: "Goals Scored", baseLine: 0.5, multiplier: 1.15 },
          { name: "Edson Álvarez", category: "Tackles Won", baseLine: 3.5, multiplier: 1.0 },
          { name: "Chucky Lozano", category: "Shots on Target", baseLine: 1.5, multiplier: 1.08 }
        ]
      },
      { 
        id: "canada", name: "Canada", shortName: "CAN", color: "#da291c", offense: 1.12, defense: 0.96, homeAdvantage: 0.12, form: 0.76, 
        h2h: { bosnia: [1, 1, 0], usa: [0, 2, 1] },
        players: [
          { name: "Jonathan David", category: "Goals Scored", baseLine: 0.5, multiplier: 1.12 },
          { name: "Alphonso Davies", category: "Dribbles Completed", baseLine: 4.5, multiplier: 1.2 }
        ]
      },
      { 
        id: "safrica", name: "South Africa", shortName: "RSA", color: "#007a4b", offense: 0.95, defense: 1.08, homeAdvantage: 0.05, form: 0.62, 
        h2h: { mexico: [1, 2, 1] },
        players: [
          { name: "Percy Tau", category: "Shots on Target", baseLine: 1.5, multiplier: 1.0 },
          { name: "Teboho Mokoena", category: "Pass Completions", baseLine: 35.5, multiplier: 0.95 }
        ]
      },
      { 
        id: "brazil", name: "Brazil", shortName: "BRA", color: "#fedf00", offense: 1.85, defense: 0.72, homeAdvantage: 0.05, form: 0.90, 
        h2h: { morocco: [3, 0, 2], usa: [5, 1, 2], mexico: [2, 0, 0] },
        players: [
          { name: "Vinícius Júnior", category: "Shots on Target", baseLine: 2.5, multiplier: 1.25 },
          { name: "Rodrygo Goes", category: "Goals Scored", baseLine: 0.5, multiplier: 1.15 },
          { name: "Bruno Guimarães", category: "Pass Completions", baseLine: 58.5, multiplier: 1.1 }
        ]
      },
      { 
        id: "morocco", name: "Morocco", shortName: "MAR", color: "#c1272d", offense: 1.35, defense: 0.82, homeAdvantage: 0.05, form: 0.86, 
        h2h: { brazil: [0, 3, 2] },
        players: [
          { name: "Youssef En-Nesyri", category: "Goals Scored", baseLine: 0.5, multiplier: 1.1 },
          { name: "Achraf Hakimi", category: "Crosses Completed", baseLine: 3.5, multiplier: 1.18 }
        ]
      },
      { 
        id: "paraguay", name: "Paraguay", shortName: "PAR", color: "#d52b1e", offense: 0.98, defense: 1.04, homeAdvantage: 0.05, form: 0.65, 
        h2h: { usa: [0, 2, 1] },
        players: [
          { name: "Miguel Almirón", category: "Shots on Target", baseLine: 1.5, multiplier: 1.05 },
          { name: "Julio Enciso", category: "Dribbles Completed", baseLine: 3.5, multiplier: 1.02 }
        ]
      },
      { 
        id: "bosnia", name: "Bosnia & Herz.", shortName: "BIH", color: "#002395", offense: 1.02, defense: 1.05, homeAdvantage: 0.05, form: 0.64, 
        h2h: { canada: [1, 1, 0] },
        players: [
          { name: "Edin Džeko", category: "Goals Scored", baseLine: 0.5, multiplier: 1.05 },
          { name: "Miralem Pjanić", category: "Pass Completions", baseLine: 45.5, multiplier: 1.0 }
        ]
      }
    ],
    schedule: [
      { 
        id: "wc_g1", homeId: "mexico", awayId: "safrica", date: "Thur, June 11 - 8:30 PM", status: "Upcoming", week: "World Cup Group A", sportName: "Football - World Cup",
        odds: {
          pinnacle: { home: 1.48, away: 6.80, draw: 3.85, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.44, away: 7.20, draw: 4.00, homeDir: "stable", awayDir: "up" },
          sbobet: { home: 1.51, away: 6.50, draw: 3.75, homeDir: "up", awayDir: "down" },
          draftkings: { home: 1.45, away: 7.00, draw: 3.90, homeDir: "down", awayDir: "stable" }
        }
      },
      { 
        id: "wc_g2", homeId: "canada", awayId: "bosnia", date: "Fri, June 12 - 4:00 PM", status: "Upcoming", week: "World Cup Group B", sportName: "Football - World Cup",
        odds: {
          pinnacle: { home: 1.95, away: 3.50, draw: 3.25, homeDir: "up", awayDir: "down" },
          bet365: { home: 1.91, away: 3.60, draw: 3.30, homeDir: "stable", awayDir: "down" },
          sbobet: { home: 2.02, away: 3.40, draw: 3.20, homeDir: "up", awayDir: "stable" },
          draftkings: { home: 1.95, away: 3.55, draw: 3.25, homeDir: "down", awayDir: "up" }
        }
      },
      { 
        id: "wc_g3", homeId: "usa", awayId: "paraguay", date: "Fri, June 12 - 9:00 PM", status: "Upcoming", week: "World Cup Group D", sportName: "Football - World Cup",
        odds: {
          pinnacle: { home: 1.55, away: 5.60, draw: 3.70, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.53, away: 5.80, draw: 3.80, homeDir: "down", awayDir: "stable" },
          sbobet: { home: 1.59, away: 5.40, draw: 3.60, homeDir: "up", awayDir: "down" },
          draftkings: { home: 1.55, away: 5.75, draw: 3.75, homeDir: "stable", awayDir: "up" }
        }
      },
      { 
        id: "wc_g4", homeId: "brazil", awayId: "morocco", date: "Sat, June 13 - 3:00 PM", status: "Upcoming", week: "World Cup Group C", sportName: "Football - World Cup",
        odds: {
          pinnacle: { home: 1.35, away: 8.50, draw: 4.60, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.30, away: 9.00, draw: 4.80, homeDir: "down", awayDir: "up" },
          sbobet: { home: 1.38, away: 8.00, draw: 4.40, homeDir: "stable", awayDir: "down" },
          draftkings: { home: 1.33, away: 8.75, draw: 4.65, homeDir: "up", awayDir: "stable" }
        }
      }
    ]
  },
  // NBA FINALS Teams, schedules, Props & Odds
  nba: {
    name: "NBA Finals 2026",
    averageScore: 114.5,
    teams: [
      { 
        id: "spurs", name: "San Antonio Spurs", shortName: "SAS", color: "#ef426f", offense: 1.08, defense: 0.91, homeAdvantage: 4.5, form: 0.88, 
        h2h: { knicks: [118, 112, 105], celtics: [102, 115, 110] },
        players: [
          { name: "Victor Wembanyama", category: "Points", baseLine: 24.5, multiplier: 1.15 },
          { name: "Victor Wembanyama", category: "Rebounds", baseLine: 10.5, multiplier: 1.08 },
          { name: "Victor Wembanyama", category: "Blocked Shots", baseLine: 3.5, multiplier: 1.2 },
          { name: "Devin Vassell", category: "Points", baseLine: 18.5, multiplier: 1.04 },
          { name: "Chris Paul", category: "Assists", baseLine: 8.5, multiplier: 1.02 }
        ]
      },
      { 
        id: "knicks", name: "New York Knicks", shortName: "NYK", color: "#f58426", offense: 1.06, defense: 0.90, homeAdvantage: 4.8, form: 0.86, 
        h2h: { spurs: [112, 118, 105], celtics: [114, 108, 112] },
        players: [
          { name: "Jalen Brunson", category: "Points", baseLine: 28.5, multiplier: 1.18 },
          { name: "Jalen Brunson", category: "Assists", baseLine: 7.5, multiplier: 1.05 },
          { name: "Julius Randle", category: "Points", baseLine: 21.5, multiplier: 1.02 },
          { name: "Julius Randle", category: "Rebounds", baseLine: 9.5, multiplier: 1.04 },
          { name: "OG Anunoby", category: "Steals", baseLine: 1.5, multiplier: 1.08 }
        ]
      },
      { 
        id: "celtics", name: "Boston Celtics", shortName: "BOS", color: "#007a33", offense: 1.10, defense: 0.92, homeAdvantage: 3.5, form: 0.80, 
        h2h: { spurs: [115, 102, 110], knicks: [108, 114, 112] },
        players: [
          { name: "Jayson Tatum", category: "Points", baseLine: 26.5, multiplier: 1.12 },
          { name: "Jaylen Brown", category: "Points", baseLine: 22.5, multiplier: 1.08 },
          { name: "Derrick White", category: "Assists", baseLine: 5.5, multiplier: 1.05 }
        ]
      }
    ],
    schedule: [
      { 
        id: "nba_g1", homeId: "spurs", awayId: "knicks", date: "Wed, June 3 - 8:30 PM", status: "Upcoming", week: "NBA Finals Game 1", sportName: "Basketball - USA - NBA",
        odds: {
          pinnacle: { home: 1.74, away: 2.15, draw: 0.0, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.71, away: 2.20, draw: 0.0, homeDir: "stable", awayDir: "up" },
          sbobet: { home: 1.78, away: 2.10, draw: 0.0, homeDir: "up", awayDir: "down" },
          draftkings: { home: 1.72, away: 2.18, draw: 0.0, homeDir: "down", awayDir: "stable" }
        }
      },
      { 
        id: "nba_g2", homeId: "spurs", awayId: "knicks", date: "Fri, June 5 - 8:30 PM", status: "Upcoming", week: "NBA Finals Game 2", sportName: "Basketball - USA - NBA",
        odds: {
          pinnacle: { home: 1.68, away: 2.25, draw: 0.0, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.65, away: 2.30, draw: 0.0, homeDir: "down", awayDir: "up" },
          sbobet: { home: 1.72, away: 2.18, draw: 0.0, homeDir: "up", awayDir: "down" },
          draftkings: { home: 1.67, away: 2.26, draw: 0.0, homeDir: "stable", awayDir: "up" }
        }
      },
      { 
        id: "nba_g3", homeId: "knicks", awayId: "spurs", date: "Mon, June 8 - 8:30 PM", status: "Upcoming", week: "NBA Finals Game 3", sportName: "Basketball - USA - NBA",
        odds: {
          pinnacle: { home: 1.62, away: 2.40, draw: 0.0, homeDir: "up", awayDir: "down" },
          bet365: { home: 1.58, away: 2.50, draw: 0.0, homeDir: "stable", awayDir: "down" },
          sbobet: { home: 1.66, away: 2.32, draw: 0.0, homeDir: "up", awayDir: "stable" },
          draftkings: { home: 1.60, away: 2.45, draw: 0.0, homeDir: "down", awayDir: "up" }
        }
      },
      { 
        id: "nba_g4", homeId: "knicks", awayId: "spurs", date: "Wed, June 10 - 8:30 PM", status: "Upcoming", week: "NBA Finals Game 4", sportName: "Basketball - USA - NBA",
        odds: {
          pinnacle: { home: 1.58, away: 2.50, draw: 0.0, homeDir: "up", awayDir: "down" },
          bet365: { home: 1.55, away: 2.55, draw: 0.0, homeDir: "up", awayDir: "down" },
          sbobet: { home: 1.62, away: 2.42, draw: 0.0, homeDir: "stable", awayDir: "stable" },
          draftkings: { home: 1.56, away: 2.52, draw: 0.0, homeDir: "down", awayDir: "up" }
        }
      }
    ]
  },
  // NFL WEEK 1 Teams, schedules, Props & Odds
  nfl: {
    name: "NFL 2026 Week 1",
    averageScore: 21.8,
    teams: [
      { 
        id: "seahawks", name: "Seattle Seahawks", shortName: "SEA", color: "#69be28", offense: 1.12, defense: 0.90, homeAdvantage: 3.0, form: 0.84, 
        h2h: { patriots: [28, 20, 24], chiefs: [24, 30, 20] },
        players: [
          { name: "Geno Smith", category: "Passing Yards", baseLine: 245.5, multiplier: 1.08 },
          { name: "Kenneth Walker III", category: "Rushing Yards", baseLine: 72.5, multiplier: 1.05 },
          { name: "DK Metcalf", category: "Receiving Yards", baseLine: 68.5, multiplier: 1.1 }
        ]
      },
      { 
        id: "patriots", name: "New England Patriots", shortName: "NE", color: "#002244", offense: 0.94, defense: 1.04, homeAdvantage: 2.2, form: 0.60, 
        h2h: { seahawks: [20, 28, 24], giants: [17, 10, 21] },
        players: [
          { name: "Drake Maye", category: "Passing Yards", baseLine: 205.5, multiplier: 1.0 },
          { name: "Rhamondre Stevenson", category: "Rushing Yards", baseLine: 62.5, multiplier: 0.95 }
        ]
      },
      { 
        id: "cowboys", name: "Dallas Cowboys", shortName: "DAL", color: "#869397", offense: 1.15, defense: 0.93, homeAdvantage: 2.8, form: 0.82, 
        h2h: { giants: [38, 27, 49], chiefs: [20, 17, 31] },
        players: [
          { name: "Dak Prescott", category: "Passing Yards", baseLine: 268.5, multiplier: 1.12 },
          { name: "CeeDee Lamb", category: "Receiving Yards", baseLine: 88.5, multiplier: 1.18 },
          { name: "Jake Ferguson", category: "Receptions", baseLine: 5.5, multiplier: 1.05 }
        ]
      },
      { 
        id: "giants", name: "New York Giants", shortName: "NYG", color: "#0b2265", offense: 0.90, defense: 1.08, homeAdvantage: 2.5, form: 0.58, 
        h2h: { cowboys: [27, 38, 49], patriots: [10, 17, 21] },
        players: [
          { name: "Daniel Jones", category: "Passing Yards", baseLine: 195.5, multiplier: 0.98 },
          { name: "Malik Nabers", category: "Receiving Yards", baseLine: 65.5, multiplier: 1.08 }
        ]
      },
      { 
        id: "chiefs", name: "Kansas City Chiefs", shortName: "KC", color: "#e31837", offense: 1.20, defense: 0.88, homeAdvantage: 2.5, form: 0.88, 
        h2h: { broncos: [19, 8, 24], cowboys: [17, 20, 31], seahawks: [30, 24, 20] },
        players: [
          { name: "Patrick Mahomes", category: "Passing Yards", baseLine: 285.5, multiplier: 1.16 },
          { name: "Patrick Mahomes", category: "Passing Touchdowns", baseLine: 1.5, multiplier: 1.22 },
          { name: "Isiah Pacheco", category: "Rushing Yards", baseLine: 78.5, multiplier: 1.08 },
          { name: "Travis Kelce", category: "Receiving Yards", baseLine: 62.5, multiplier: 1.1 }
        ]
      },
      { 
        id: "broncos", name: "Denver Broncos", shortName: "DEN", color: "#fb4f14", offense: 1.02, defense: 1.05, homeAdvantage: 3.2, form: 0.72, 
        h2h: { chiefs: [8, 19, 24] },
        players: [
          { name: "Bo Nix", category: "Passing Yards", baseLine: 215.5, multiplier: 1.02 },
          { name: "Courtland Sutton", category: "Receiving Yards", baseLine: 58.5, multiplier: 1.05 }
        ]
      }
    ],
    schedule: [
      { 
        id: "nfl_g1", homeId: "seahawks", awayId: "patriots", date: "Wed, Sept 9 - 8:30 PM", status: "Upcoming", week: "NFL Kickoff Game", sportName: "American Football - USA - NFL",
        odds: {
          pinnacle: { home: 1.38, away: 3.10, draw: 0.0, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.34, away: 3.30, draw: 0.0, homeDir: "down", awayDir: "stable" },
          sbobet: { home: 1.41, away: 2.95, draw: 0.0, homeDir: "up", awayDir: "down" },
          draftkings: { home: 1.36, away: 3.20, draw: 0.0, homeDir: "stable", awayDir: "up" }
        }
      },
      { 
        id: "nfl_g2", homeId: "giants", awayId: "cowboys", date: "Sun, Sept 13 - 8:20 PM", status: "Upcoming", week: "Week 1 Sunday Night", sportName: "American Football - USA - NFL",
        odds: {
          pinnacle: { home: 2.85, away: 1.45, draw: 0.0, homeDir: "up", awayDir: "down" },
          bet365: { home: 2.95, away: 1.42, draw: 0.0, homeDir: "up", awayDir: "down" },
          sbobet: { home: 2.75, away: 1.49, draw: 0.0, homeDir: "stable", awayDir: "up" },
          draftkings: { home: 2.90, away: 1.44, draw: 0.0, homeDir: "down", awayDir: "stable" }
        }
      },
      { 
        id: "nfl_g3", homeId: "chiefs", awayId: "broncos", date: "Mon, Sept 14 - 8:15 PM", status: "Upcoming", week: "Week 1 Monday Night", sportName: "American Football - USA - NFL",
        odds: {
          pinnacle: { home: 1.30, away: 3.65, draw: 0.0, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.28, away: 3.80, draw: 0.0, homeDir: "down", awayDir: "stable" },
          sbobet: { home: 1.33, away: 3.45, draw: 0.0, homeDir: "stable", awayDir: "down" },
          draftkings: { home: 1.29, away: 3.70, draw: 0.0, homeDir: "up", awayDir: "up" }
        }
      }
    ]
  },
  // TENNIS Teams, Schedules, Props & Odds
  tennis: {
    name: "Wimbledon 2026",
    averageScore: 21.5,
    teams: [
      { 
        id: "alcaraz", name: "Carlos Alcaraz", shortName: "ALC", color: "#e81d23", offense: 1.15, defense: 0.88, homeAdvantage: 1.0, form: 0.90, 
        h2h: { sinner: [3, 2, 0], djokovic: [2, 3, 0] },
        players: [
          { name: "Carlos Alcaraz", category: "Aces", baseLine: 8.5, multiplier: 1.12 },
          { name: "Carlos Alcaraz", category: "Double Faults", baseLine: 2.5, multiplier: 0.98 }
        ]
      },
      { 
        id: "sinner", name: "Jannik Sinner", shortName: "SIN", color: "#fccb05", offense: 1.18, defense: 0.86, homeAdvantage: 1.0, form: 0.92, 
        h2h: { alcaraz: [2, 3, 0], djokovic: [3, 4, 0] },
        players: [
          { name: "Jannik Sinner", category: "Aces", baseLine: 10.5, multiplier: 1.15 },
          { name: "Jannik Sinner", category: "First Serve %", baseLine: 65.5, multiplier: 1.05 }
        ]
      },
      { 
        id: "djokovic", name: "Novak Djokovic", shortName: "DJO", color: "#0c2340", offense: 1.12, defense: 0.85, homeAdvantage: 1.0, form: 0.85, 
        h2h: { alcaraz: [3, 2, 0], sinner: [4, 3, 0] },
        players: [
          { name: "Novak Djokovic", category: "Aces", baseLine: 6.5, multiplier: 1.05 }
        ]
      },
      { 
        id: "medvedev", name: "Daniil Medvedev", shortName: "MED", color: "#12a4db", offense: 1.05, defense: 0.88, homeAdvantage: 1.0, form: 0.82, 
        h2h: { djokovic: [2, 5, 0] },
        players: [
          { name: "Daniil Medvedev", category: "Double Faults", baseLine: 4.5, multiplier: 1.12 }
        ]
      }
    ],
    schedule: [
      { 
        id: "ten_g1", homeId: "alcaraz", awayId: "sinner", date: "Sat, June 6 - 2:00 PM", status: "Upcoming", week: "Wimbledon Semifinal", sportName: "Tennis - Grand Slam",
        odds: {
          pinnacle: { home: 1.85, away: 2.05, draw: 0.0, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.80, away: 2.10, draw: 0.0, homeDir: "stable", awayDir: "up" },
          sbobet: { home: 1.88, away: 2.00, draw: 0.0, homeDir: "up", awayDir: "down" },
          draftkings: { home: 1.83, away: 2.02, draw: 0.0, homeDir: "down", awayDir: "stable" }
        }
      },
      { 
        id: "ten_g2", homeId: "djokovic", awayId: "medvedev", date: "Sun, June 7 - 2:00 PM", status: "Upcoming", week: "Wimbledon Semifinal", sportName: "Tennis - Grand Slam",
        odds: {
          pinnacle: { home: 1.65, away: 2.30, draw: 0.0, homeDir: "up", awayDir: "down" },
          bet365: { home: 1.62, away: 2.40, draw: 0.0, homeDir: "stable", awayDir: "down" },
          sbobet: { home: 1.70, away: 2.22, draw: 0.0, homeDir: "up", awayDir: "stable" },
          draftkings: { home: 1.64, away: 2.35, draw: 0.0, homeDir: "down", awayDir: "up" }
        }
      }
    ]
  },
  // ICE HOCKEY Teams, Schedules, Props & Odds
  hockey: {
    name: "NHL Stanley Cup 2026",
    averageScore: 5.8,
    teams: [
      { 
        id: "oilers", name: "Edmonton Oilers", shortName: "EDM", color: "#FF4C00", offense: 1.16, defense: 0.95, homeAdvantage: 0.4, form: 0.88, 
        h2h: { panthers: [5, 3, 2] },
        players: [
          { name: "Connor McDavid", category: "Points", baseLine: 1.5, multiplier: 1.25 },
          { name: "Leon Draisaitl", category: "Shots on Goal", baseLine: 3.5, multiplier: 1.15 }
        ]
      },
      { 
        id: "panthers", name: "Florida Panthers", shortName: "FLA", color: "#041E42", offense: 1.10, defense: 0.90, homeAdvantage: 0.5, form: 0.86, 
        h2h: { oilers: [3, 5, 2] },
        players: [
          { name: "Matthew Tkachuk", category: "Shots on Goal", baseLine: 3.5, multiplier: 1.10 },
          { name: "Aleksander Barkov", category: "Assists", baseLine: 0.5, multiplier: 1.20 }
        ]
      },
      { 
        id: "rangers", name: "New York Rangers", shortName: "NYR", color: "#0038A8", offense: 1.08, defense: 0.92, homeAdvantage: 0.45, form: 0.80, 
        h2h: { stars: [4, 2, 1] },
        players: [
          { name: "Artemi Panarin", category: "Points", baseLine: 1.5, multiplier: 1.18 }
        ]
      },
      { 
        id: "stars", name: "Dallas Stars", shortName: "DAL", color: "#006847", offense: 1.06, defense: 0.94, homeAdvantage: 0.4, form: 0.78, 
        h2h: { rangers: [2, 4, 1] },
        players: [
          { name: "Jason Robertson", category: "Shots on Goal", baseLine: 2.5, multiplier: 1.08 }
        ]
      }
    ],
    schedule: [
      { 
        id: "nhl_g1", homeId: "oilers", awayId: "panthers", date: "Sat, June 6 - 8:00 PM", status: "Upcoming", week: "Stanley Cup Game 5", sportName: "Ice Hockey - USA - NHL",
        odds: {
          pinnacle: { home: 1.80, away: 2.10, draw: 3.80, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.78, away: 2.15, draw: 3.90, homeDir: "down", awayDir: "stable" },
          sbobet: { home: 1.85, away: 2.05, draw: 3.70, homeDir: "up", awayDir: "down" },
          draftkings: { home: 1.82, away: 2.08, draw: 3.85, homeDir: "stable", awayDir: "up" }
        }
      },
      { 
        id: "nhl_g2", homeId: "rangers", awayId: "stars", date: "Sun, June 7 - 8:00 PM", status: "Upcoming", week: "Stanley Cup Game 6", sportName: "Ice Hockey - USA - NHL",
        odds: {
          pinnacle: { home: 1.95, away: 1.95, draw: 3.65, homeDir: "up", awayDir: "down" },
          bet365: { home: 1.91, away: 1.98, draw: 3.75, homeDir: "stable", awayDir: "down" },
          sbobet: { home: 2.02, away: 1.88, draw: 3.55, homeDir: "up", awayDir: "stable" },
          draftkings: { home: 1.95, away: 1.94, draw: 3.70, homeDir: "down", awayDir: "up" }
        }
      }
    ]
  },
  // ATHLETICS Teams, Schedules, Props & Odds
  athletics: {
    name: "Diamond League 2026",
    averageScore: 9.85,
    teams: [
      { 
        id: "lyles", name: "Noah Lyles (USA)", shortName: "LYL", color: "#002868", offense: 1.25, defense: 1.0, homeAdvantage: 0.1, form: 0.95, 
        h2h: { thompson: [5, 2, 0] },
        players: [
          { name: "Noah Lyles", category: "Reaction Time", baseLine: 0.145, multiplier: 1.08 }
        ]
      },
      { 
        id: "thompson", name: "Kishane Thompson (JAM)", shortName: "THO", color: "#009b3a", offense: 1.22, defense: 1.0, homeAdvantage: 0.0, form: 0.92, 
        h2h: { lyles: [2, 5, 0] },
        players: [
          { name: "Kishane Thompson", category: "Reaction Time", baseLine: 0.138, multiplier: 1.12 }
        ]
      },
      { 
        id: "tebogo", name: "Letsile Tebogo (BOT)", shortName: "TEB", color: "#00a8e8", offense: 1.20, defense: 1.0, homeAdvantage: 0.0, form: 0.94, 
        h2h: { jacobs: [4, 1, 0] },
        players: [
          { name: "Letsile Tebogo", category: "Top Speed (km/h)", baseLine: 43.8, multiplier: 1.15 }
        ]
      },
      { 
        id: "jacobs", name: "Lamont Jacobs (ITA)", shortName: "JAC", color: "#008c45", offense: 1.15, defense: 1.0, homeAdvantage: 0.0, form: 0.82, 
        h2h: { tebogo: [1, 4, 0] },
        players: [
          { name: "Lamont Jacobs", category: "Reaction Time", baseLine: 0.142, multiplier: 1.02 }
        ]
      }
    ],
    schedule: [
      { 
        id: "ath_g1", homeId: "lyles", awayId: "thompson", date: "Sat, June 6 - 7:30 PM", status: "Upcoming", week: "Diamond League 100m", sportName: "Athletics - IAAF",
        odds: {
          pinnacle: { home: 1.70, away: 2.20, draw: 0.0, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.65, away: 2.30, draw: 0.0, homeDir: "down", awayDir: "stable" },
          sbobet: { home: 1.75, away: 2.10, draw: 0.0, homeDir: "up", awayDir: "down" },
          draftkings: { home: 1.68, away: 2.25, draw: 0.0, homeDir: "stable", awayDir: "up" }
        }
      },
      { 
        id: "ath_g2", homeId: "tebogo", awayId: "jacobs", date: "Sun, June 7 - 7:30 PM", status: "Upcoming", week: "Diamond League 200m", sportName: "Athletics - IAAF",
        odds: {
          pinnacle: { home: 1.55, away: 2.55, draw: 0.0, homeDir: "up", awayDir: "down" },
          bet365: { home: 1.50, away: 2.70, draw: 0.0, homeDir: "stable", awayDir: "down" },
          sbobet: { home: 1.60, away: 2.45, draw: 0.0, homeDir: "up", awayDir: "stable" },
          draftkings: { home: 1.53, away: 2.60, draw: 0.0, homeDir: "down", awayDir: "up" }
        }
      }
    ]
  },
  // AUSSIE RULES Teams, Schedules, Props & Odds
  aussie: {
    name: "AFL Premiership 2026",
    averageScore: 84.5,
    teams: [
      { 
        id: "collingwood", name: "Collingwood Magpies", shortName: "COL", color: "#000000", offense: 1.10, defense: 0.92, homeAdvantage: 3.5, form: 0.85, 
        h2h: { carlton: [95, 88, 102] },
        players: [
          { name: "Nick Daicos", category: "Disposals", baseLine: 28.5, multiplier: 1.18 }
        ]
      },
      { 
        id: "carlton", name: "Carlton Blues", shortName: "CAR", color: "#0F1E36", offense: 1.12, defense: 0.94, homeAdvantage: 3.0, form: 0.82, 
        h2h: { collingwood: [88, 95, 102] },
        players: [
          { name: "Patrick Cripps", category: "Tackles", baseLine: 6.5, multiplier: 1.10 }
        ]
      },
      { 
        id: "richmond", name: "Richmond Tigers", shortName: "RIC", color: "#FFD200", offense: 1.02, defense: 1.05, homeAdvantage: 3.2, form: 0.65, 
        h2h: { essendon: [72, 85, 90] },
        players: [
          { name: "Dustin Martin", category: "Goals", baseLine: 1.5, multiplier: 1.05 }
        ]
      },
      { 
        id: "essendon", name: "Essendon Bombers", shortName: "ESS", color: "#CC0000", offense: 1.04, defense: 1.02, homeAdvantage: 3.0, form: 0.70, 
        h2h: { richmond: [85, 72, 90] },
        players: [
          { name: "Zach Merrett", category: "Disposals", baseLine: 26.5, multiplier: 1.12 }
        ]
      }
    ],
    schedule: [
      { 
        id: "afl_g1", homeId: "collingwood", awayId: "carlton", date: "Sat, June 6 - 5:30 PM", status: "Upcoming", week: "AFL Round 15", sportName: "Aussie Rules - AFL",
        odds: {
          pinnacle: { home: 1.82, away: 2.08, draw: 0.0, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.78, away: 2.15, draw: 0.0, homeDir: "down", awayDir: "stable" },
          sbobet: { home: 1.86, away: 2.02, draw: 0.0, homeDir: "up", awayDir: "down" },
          draftkings: { home: 1.80, away: 2.10, draw: 0.0, homeDir: "stable", awayDir: "up" }
        }
      },
      { 
        id: "afl_g2", homeId: "richmond", awayId: "essendon", date: "Sun, June 7 - 5:30 PM", status: "Upcoming", week: "AFL Round 15", sportName: "Aussie Rules - AFL",
        odds: {
          pinnacle: { home: 2.25, away: 1.68, draw: 0.0, homeDir: "up", awayDir: "down" },
          bet365: { home: 2.35, away: 1.62, draw: 0.0, homeDir: "stable", awayDir: "down" },
          sbobet: { home: 2.18, away: 1.72, draw: 0.0, homeDir: "up", awayDir: "stable" },
          draftkings: { home: 2.26, away: 1.67, draw: 0.0, homeDir: "down", awayDir: "up" }
        }
      }
    ]
  },
  // BADMINTON Teams, Schedules, Props & Odds
  badminton: {
    name: "BWF World Tour 2026",
    averageScore: 42.0,
    teams: [
      { 
        id: "axelsen", name: "Viktor Axelsen", shortName: "AXE", color: "#002f6c", offense: 1.22, defense: 0.82, homeAdvantage: 1.0, form: 0.94, 
        h2h: { shi: [5, 2, 0] },
        players: [
          { name: "Viktor Axelsen", category: "Smash Winners", baseLine: 14.5, multiplier: 1.22 }
        ]
      },
      { 
        id: "shi", name: "Shi Yuqi", shortName: "SHI", color: "#ee1c25", offense: 1.18, defense: 0.85, homeAdvantage: 1.0, form: 0.90, 
        h2h: { axelsen: [2, 5, 0] },
        players: [
          { name: "Shi Yuqi", category: "Smash Winners", baseLine: 12.5, multiplier: 1.15 }
        ]
      },
      { 
        id: "naraoka", name: "Kodai Naraoka", shortName: "NAR", color: "#008751", offense: 1.05, defense: 0.84, homeAdvantage: 1.0, form: 0.85, 
        h2h: { antonsen: [3, 2, 0] },
        players: [
          { name: "Kodai Naraoka", category: "Net Kill Winners", baseLine: 6.5, multiplier: 1.08 }
        ]
      },
      { 
        id: "antonsen", name: "Anders Antonsen", shortName: "ANT", color: "#c8102e", offense: 1.08, defense: 0.86, homeAdvantage: 1.0, form: 0.84, 
        h2h: { naraoka: [2, 3, 0] },
        players: [
          { name: "Anders Antonsen", category: "Net Kill Winners", baseLine: 7.5, multiplier: 1.10 }
        ]
      }
    ],
    schedule: [
      { 
        id: "bad_g1", homeId: "axelsen", awayId: "shi", date: "Sat, June 6 - 3:30 PM", status: "Upcoming", week: "World Tour Finals", sportName: "Badminton - BWF",
        odds: {
          pinnacle: { home: 1.50, away: 2.70, draw: 0.0, homeDir: "down", awayDir: "up" },
          bet365: { home: 1.48, away: 2.80, draw: 0.0, homeDir: "down", awayDir: "stable" },
          sbobet: { home: 1.55, away: 2.55, draw: 0.0, homeDir: "up", awayDir: "down" },
          draftkings: { home: 1.51, away: 2.68, draw: 0.0, homeDir: "stable", awayDir: "up" }
        }
      },
      { 
        id: "bad_g2", homeId: "naraoka", awayId: "antonsen", date: "Sun, June 7 - 3:30 PM", status: "Upcoming", week: "World Tour Finals", sportName: "Badminton - BWF",
        odds: {
          pinnacle: { home: 1.95, away: 1.95, draw: 0.0, homeDir: "up", awayDir: "down" },
          bet365: { home: 1.91, away: 1.98, draw: 0.0, homeDir: "stable", awayDir: "down" },
          sbobet: { home: 2.02, away: 1.88, draw: 0.0, homeDir: "up", awayDir: "stable" },
          draftkings: { home: 1.94, away: 1.95, draw: 0.0, homeDir: "down", awayDir: "up" }
        }
      }
    ]
  },
  // Static list of dropping odds templates for feed comparison
  droppingOddsAlerts: [
    { match: "USA vs Paraguay", league: "World Cup Group D", drop: "50.5%", market: "Home to win", oldOdds: "3.20", newOdds: "1.55", homeId: "usa", awayId: "paraguay", leagueKey: "epl" },
    { match: "Brazil vs Morocco", league: "World Cup Group C", drop: "41.7%", market: "Home to win", oldOdds: "2.35", newOdds: "1.35", homeId: "brazil", awayId: "morocco", leagueKey: "epl" },
    { match: "Spurs vs Knicks", league: "NBA Finals Game 2", drop: "37.2%", market: "Home to win", oldOdds: "2.68", newOdds: "1.68", homeId: "spurs", awayId: "knicks", leagueKey: "nba" },
    { match: "Chiefs vs Broncos", league: "NFL Week 1 Monday Night", drop: "25.4%", market: "Home to win", oldOdds: "1.74", newOdds: "1.30", homeId: "chiefs", awayId: "broncos", leagueKey: "nfl" },
    { match: "Mexico vs South Africa", league: "World Cup Group A", drop: "23.4%", market: "Home +0.5 (Asian Handicap)", oldOdds: "1.88", newOdds: "1.48", homeId: "mexico", awayId: "safrica", leagueKey: "epl" },
    { match: "Canada vs Bosnia & Herz.", league: "World Cup Group B", drop: "20.5%", market: "Home -0.5 (Asian Handicap)", oldOdds: "2.45", newOdds: "1.95", homeId: "canada", awayId: "bosnia", leagueKey: "epl" },
    { match: "Alcaraz vs Sinner", league: "Wimbledon Semifinal", drop: "15.4%", market: "Alcaraz to win", oldOdds: "1.85", newOdds: "1.55", homeId: "alcaraz", awayId: "sinner", leagueKey: "tennis" },
    { match: "Oilers vs Panthers", league: "Stanley Cup Game 5", drop: "12.8%", market: "Oilers to win", oldOdds: "2.10", newOdds: "1.80", homeId: "oilers", awayId: "panthers", leagueKey: "hockey" },
    { match: "Collingwood vs Carlton", league: "AFL Round 15", drop: "11.2%", market: "Collingwood to win", oldOdds: "1.95", newOdds: "1.72", homeId: "collingwood", awayId: "carlton", leagueKey: "aussie" }
  ]
};
