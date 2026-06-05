// Mathematical Sports Betting Prediction Engine (Upgraded v2 with Player Props)

// Normal Cumulative Distribution Function approximation (Abramowitz & Stegun)
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const prob = 1 - d * Math.exp(-x * x / 2) * ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  return x >= 0 ? prob : 1 - prob;
}

// Poisson Probability Distribution
function poissonProb(k, lambda) {
  if (k < 0) return 0;
  let factorial = 1;
  for (let i = 1; i <= k; i++) {
    factorial *= i;
  }
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
}

const predictorEngine = {
  // Main simulator function
  simulateMatch: function(homeTeam, awayTeam, leagueKey, modifiers) {
    const db = sportsDatabase[leagueKey];
    if (!db) return null;

    const avgScore = db.averageScore;
    
    // Custom vector modifiers
    const mHomeAdv = modifiers.homeAdvantage;
    const mForm = modifiers.form;
    const mInjuries = modifiers.injuries;
    const mWeather = modifiers.weather;
    const mTactics = modifiers.tactics;
    
    // Upgraded news sentiment vector multiplier
    const mSentiment = modifiers.sentiment || 0.0;

    let homeExpected = 0;
    let awayExpected = 0;
    let homeWinProb = 0.5;
    let drawProb = 0.0;
    let awayWinProb = 0.5;
    let spreadLine = 0.0;
    let totalLine = 0.0;

    if (leagueKey === 'epl') {
      // EPL SOCCER MATH (Poisson Model)
      const baseHome = avgScore * homeTeam.offense * awayTeam.defense * (1 + homeTeam.homeAdvantage);
      const baseAway = avgScore * awayTeam.offense * homeTeam.defense;

      const homeNetMod = (mHomeAdv * 0.02) + (mForm * 0.015) + (mInjuries * 0.02) + (mWeather * 0.008) + (mTactics * 0.012);
      
      // Combine sliders modifiers with active AI News sentiment multiplier!
      homeExpected = Math.max(0.1, baseHome * (1 + homeNetMod + mSentiment));
      awayExpected = Math.max(0.1, baseAway * (1 - homeNetMod - mSentiment));

      // Calculate match outcomes using Poisson grids
      const maxGoals = 8;
      let homeProbs = [];
      let awayProbs = [];

      for (let g = 0; g <= maxGoals; g++) {
        homeProbs.push(poissonProb(g, homeExpected));
        awayProbs.push(poissonProb(g, awayExpected));
      }

      let hWin = 0;
      let draw = 0;
      let aWin = 0;

      for (let h = 0; h <= maxGoals; h++) {
        for (let a = 0; a <= maxGoals; a++) {
          const jointProb = homeProbs[h] * awayProbs[a];
          if (h > a) {
            hWin += jointProb;
          } else if (h === a) {
            draw += jointProb;
          } else {
            aWin += jointProb;
          }
        }
      }

      const totalP = hWin + draw + aWin;
      homeWinProb = hWin / totalP;
      drawProb = draw / totalP;
      awayWinProb = aWin / totalP;

      spreadLine = -(homeExpected - awayExpected);
      spreadLine = Math.round(spreadLine * 4) / 4;
      if (spreadLine === 0) spreadLine = -0.25;
      
      totalLine = Math.round((homeExpected + awayExpected) * 2) / 2;
      if (totalLine % 1 === 0) totalLine += 0.5;
    } else {
      // NBA/NFL BASKETBALL & FOOTBALL MATH
      const stdDev = leagueKey === 'nba' ? 11.5 : 9.5;
      
      let baseHome = 0;
      let baseAway = 0;
      let scaleFactor = 0;
      let sentimentPoints = 0;

      if (leagueKey === 'nba') {
        baseHome = avgScore * homeTeam.offense * awayTeam.defense + homeTeam.homeAdvantage;
        baseAway = avgScore * awayTeam.offense * homeTeam.defense;
        scaleFactor = (mHomeAdv * 0.6) + (mForm * 0.45) + (mInjuries * 0.5) + (mWeather * 0.15) + (mTactics * 0.35);
        
        // NBA sentiment gives up to 4.5 points variance on expected scores
        sentimentPoints = mSentiment * 4.5;
      } else { // NFL
        baseHome = avgScore * homeTeam.offense * awayTeam.defense + homeTeam.homeAdvantage;
        baseAway = avgScore * awayTeam.offense * homeTeam.defense;
        scaleFactor = (mHomeAdv * 0.25) + (mForm * 0.2) + (mInjuries * 0.3) + (mWeather * 0.1) + (mTactics * 0.15);
        
        // NFL sentiment gives up to 2.2 points variance on expected scores
        sentimentPoints = mSentiment * 2.2;
      }

      homeExpected = Math.max(leagueKey === 'nba' ? 65 : 3, baseHome + scaleFactor + sentimentPoints);
      awayExpected = Math.max(leagueKey === 'nba' ? 65 : 3, baseAway - scaleFactor - sentimentPoints);

      const meanMargin = homeExpected - awayExpected;
      const zHome = (0 - meanMargin) / stdDev;
      
      homeWinProb = 1 - normalCDF(zHome);
      awayWinProb = 1 - homeWinProb;
      drawProb = 0.0;

      spreadLine = -Math.round(meanMargin * 2) / 2;
      if (spreadLine === 0) spreadLine = -0.5;

      totalLine = Math.round((homeExpected + awayExpected) * 2) / 2;
      if (totalLine % 1 === 0) totalLine += 0.5;
    }

    return {
      expectedHomeScore: leagueKey === 'epl' ? Number(homeExpected.toFixed(2)) : Math.round(homeExpected),
      expectedAwayScore: leagueKey === 'epl' ? Number(awayExpected.toFixed(2)) : Math.round(awayExpected),
      homeWinProbability: homeWinProb,
      drawProbability: drawProb,
      awayWinProbability: awayWinProb,
      spread: spreadLine,
      total: totalLine
    };
  },

  // Calculate dynamic player prop projections based on active vectors
  projectPlayerProps: function(homeTeam, awayTeam, leagueKey, modifiers, simResults) {
    const homePlayers = homeTeam.players || [];
    const awayPlayers = awayTeam.players || [];
    
    // Sliders & sentiment variables
    const mForm = modifiers.form || 0;
    const mInjuries = modifiers.injuries || 0;
    const mSentiment = modifiers.sentiment || 0.0;
    const mTactics = modifiers.tactics || 0;

    let propsList = [];

    const processPlayer = (player, isHome) => {
      // Vector adjustments multiplier: positive vectors favor home team, negative vectors favor away team
      let vectorShift = 0.0;
      if (isHome) {
        vectorShift = (mForm * 0.008) + (mInjuries * 0.01) + (mSentiment * 0.08) + (mTactics * 0.006);
      } else {
        vectorShift = -(mForm * 0.008) - (mInjuries * 0.01) - (mSentiment * 0.08) - (mTactics * 0.006);
      }

      // Base scaling based on overall expected scores
      const avgScore = sportsDatabase[leagueKey].averageScore;
      const expectedScore = isHome ? simResults.expectedHomeScore : simResults.expectedAwayScore;
      const scoreRatio = expectedScore / avgScore;

      // Calculate projected player metrics
      let projected = player.baseLine * player.multiplier * (1 + vectorShift);
      
      // Points, Goals, Passing Yards scale with team expected score ratio
      if (["Points", "Goals Scored", "Passing Yards", "Shots on Target", "Receiving Yards"].includes(player.category)) {
        projected = projected * (1 + (scoreRatio - 1) * 0.5);
      }

      // Safe boundaries
      projected = Math.max(0.01, projected);
      
      // Formatting rounding based on categories
      let projectedFormatted = projected;
      if (["Goals Scored", "Blocked Shots", "Steals", "Passing Touchdowns"].includes(player.category)) {
        projectedFormatted = Number(projected.toFixed(2));
      } else if (["Points", "Rebounds", "Assists", "Shots on Target", "Tackles Won", "Crosses Completed", "Dribbles Completed", "Receptions"].includes(player.category)) {
        projectedFormatted = Number(projected.toFixed(1));
      } else { // Yards, Passes
        projectedFormatted = Math.round(projected);
      }

      // Determine pick recommendation
      const pick = projectedFormatted >= player.baseLine ? "OVER" : "UNDER";
      
      // Calculate realistic Expected Value percentage based on differences
      const rawEV = Math.abs(projectedFormatted - player.baseLine) / player.baseLine;
      const ev = Number((Math.max(0.5, Math.min(14.8, rawEV * 85))).toFixed(1));

      return {
        name: player.name,
        teamShort: isHome ? homeTeam.shortName : awayTeam.shortName,
        category: player.category,
        baseLine: player.baseLine,
        projectedValue: projectedFormatted,
        pick: pick,
        ev: ev,
        confidence: ev > 8.0 ? "HIGH" : ev > 3.0 ? "MEDIUM" : "LOW"
      };
    };

    homePlayers.forEach(p => propsList.push(processPlayer(p, true)));
    awayPlayers.forEach(p => propsList.push(processPlayer(p, false)));

    return propsList;
  }
};
