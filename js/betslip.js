// Vox Fortuna Bet Slip and Bankroll Manager

const BANKROLL_STORAGE_KEY = "apex_predict_user_state";

let userState = {
  bankroll: 10000.00,
  totalWagered: 0.00,
  totalWon: 0.00,
  wonCount: 0,
  lostCount: 0,
  history: []
};

// Pending bet selection
let pendingBet = null;

// Odds Conversion Helpers
function probabilityToDecimalOdds(prob, applyVig = true) {
  const vig = applyVig ? 1.045 : 1.0;
  const impliedProb = Math.min(0.99, Math.max(0.01, prob * vig));
  return Number((1 / impliedProb).toFixed(2));
}

function decimalToAmericanOdds(decimal) {
  if (decimal >= 2.0) {
    return `+${Math.round((decimal - 1) * 100)}`;
  } else {
    return `${Math.round(-100 / (decimal - 1))}`;
  }
}

function formatOdds(decimal, format = "american") {
  if (format === "decimal") {
    return decimal.toFixed(2);
  }
  return decimalToAmericanOdds(decimal);
}

// EV (Expected Value) Calculation
function calculateExpectedValue(predictorProb, bookmakerDecimal) {
  // EV = (Probability * PayoutRatio) - (1 - Probability)
  // PayoutRatio = DecimalOdds - 1
  // EV = Prob * (Odds - 1) - (1 - Prob) = Prob * Odds - 1
  const ev = (predictorProb * bookmakerDecimal) - 1;
  return Number((ev * 100).toFixed(1));
}

const betslipManager = {
  // Load State from LocalStorage
  loadState: function() {
    const saved = localStorage.getItem(BANKROLL_STORAGE_KEY);
    if (saved) {
      try {
        userState = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing user state, resetting...", e);
      }
    }
    this.updateUI();
  },

  // Save State to LocalStorage
  saveState: function() {
    localStorage.setItem(BANKROLL_STORAGE_KEY, JSON.stringify(userState));
    this.updateUI();
  },

  // Reset Bankroll
  resetBankroll: function() {
    userState = {
      bankroll: 10000.00,
      totalWagered: 0.00,
      totalWon: 0.00,
      wonCount: 0,
      lostCount: 0,
      history: []
    };
    this.saveState();
  },

  // Set Pending Bet Selection
  setPendingBet: function(betType, betName, oddsDecimal, predictedProb, matchupDetails) {
    pendingBet = {
      type: betType,            // "moneyline_home", "spread_away", "total_over", etc.
      name: betName,            // "Manchester City Moneyline", "Lakers +3.5", etc.
      oddsDecimal: oddsDecimal,
      predictedProb: predictedProb,
      matchup: matchupDetails,  // { homeName, awayName, leagueKey, homeId, awayId }
      ev: calculateExpectedValue(predictedProb, oddsDecimal)
    };

    this.renderPendingBet();
    
    // Open Bet Slip drawer if closed on mobile
    const slipDrawer = document.getElementById("betslip-drawer");
    if (slipDrawer) {
      slipDrawer.classList.add("active");
    }
  },

  // Render the pending bet section in the DOM
  renderPendingBet: function() {
    const container = document.getElementById("pending-bet-container");
    if (!container) return;

    if (!pendingBet) {
      container.innerHTML = `
        <div class="empty-slip-state">
          <div class="empty-icon"><i class="fas fa-ticket-alt"></i></div>
          <p>No active selections</p>
          <span class="subtext">Select a prediction outcome to compile your wager slip.</span>
        </div>
      `;
      document.getElementById("betslip-footer").style.display = "none";
      return;
    }

    const oddsFormatted = formatOdds(pendingBet.oddsDecimal, window.oddsFormatPreference || "american");
    const evClass = pendingBet.ev > 0 ? "positive-ev" : "negative-ev";
    const evIcon = pendingBet.ev > 0 ? "fa-arrow-up-right" : "fa-arrow-down-right";
    const evText = pendingBet.ev > 0 ? `+${pendingBet.ev}% EV (Value Bet)` : `${pendingBet.ev}% EV`;

    container.innerHTML = `
      <div class="active-bet-card">
        <div class="bet-card-header">
          <span class="matchup-tag">${pendingBet.matchup.homeName} vs ${pendingBet.matchup.awayName}</span>
          <button class="remove-bet-btn" onclick="betslipManager.clearPendingBet()"><i class="fas fa-times"></i></button>
        </div>
        <div class="bet-card-body">
          <div class="bet-selection-info">
            <span class="bet-name">${pendingBet.name}</span>
            <span class="bet-odds">${oddsFormatted}</span>
          </div>
          <div class="bet-ev-badge ${evClass}">
            <i class="fas ${evIcon}"></i> ${evText}
          </div>
          <div class="bet-stake-calculator">
            <label for="stake-input">Risk Amount</label>
            <div class="stake-input-wrapper">
              <span class="currency-symbol">$</span>
              <input type="number" id="stake-input" value="100" min="5" max="${Math.floor(userState.bankroll)}" oninput="betslipManager.recalculatePotentialReturn()" />
            </div>
          </div>
          <div class="bet-payout-info">
            <div class="payout-row">
              <span>To Win</span>
              <span id="win-payout-display">$90.91</span>
            </div>
            <div class="payout-row total-payout">
              <span>Total Payout</span>
              <span id="total-payout-display">$190.91</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById("betslip-footer").style.display = "block";
    this.recalculatePotentialReturn();
  },

  clearPendingBet: function() {
    pendingBet = null;
    this.renderPendingBet();
  },

  // Live payout recalculations based on wager input
  recalculatePotentialReturn: function() {
    const input = document.getElementById("stake-input");
    const toWinDisplay = document.getElementById("win-payout-display");
    const totalDisplay = document.getElementById("total-payout-display");
    
    if (!input || !pendingBet || !toWinDisplay || !totalDisplay) return;

    let stake = parseFloat(input.value);
    if (isNaN(stake) || stake < 0) stake = 0;

    const toWin = stake * (pendingBet.oddsDecimal - 1);
    const totalPayout = stake * pendingBet.oddsDecimal;

    toWinDisplay.textContent = `$${toWin.toFixed(2)}`;
    totalDisplay.textContent = `$${totalPayout.toFixed(2)}`;
  },

  // Simulates matching outcome and resolves wager
  placeWager: function() {
    if (!pendingBet) return;

    const input = document.getElementById("stake-input");
    const stake = parseFloat(input?.value || 0);

    if (isNaN(stake) || stake <= 0) {
      alert("Please enter a valid stake amount.");
      return;
    }

    if (stake > userState.bankroll) {
      alert("Insufficient funds in bankroll!");
      return;
    }

    // Trigger processing spinner modal
    const overlay = document.getElementById("resolution-overlay");
    const summary = document.getElementById("resolution-summary");
    
    if (overlay && summary) {
      overlay.classList.add("active");
      summary.innerHTML = `
        <div class="resolution-loader">
          <div class="spinner-neon"></div>
          <h3>Simulating Match Outcome...</h3>
          <p>Running random-seed model weighted by the calculated prediction probabilities.</p>
        </div>
      `;
    }

    setTimeout(() => {
      this.resolveWager(stake, overlay, summary);
    }, 2200);
  },

  // Perform weighted resolution simulation
  resolveWager: function(stake, overlay, summary) {
    const isHomeWin = Math.random() < pendingBet.predictedProb;
    let betWon = false;
    let actualHomeScore = 0;
    let actualAwayScore = 0;

    const league = pendingBet.matchup.leagueKey;
    const simStats = pendingBet.matchup.simulationResults;

    // Simulate final match scores matching realistic expected values with random variation
    if (league === "epl") {
      // soccer scores
      const homeAvg = simStats.expectedHomeScore;
      const awayAvg = simStats.expectedAwayScore;
      
      // Box-Muller transform for simple standard deviation variance around expected score
      const randomNormal = () => Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
      actualHomeScore = Math.max(0, Math.round(homeAvg + randomNormal() * 1.1));
      actualAwayScore = Math.max(0, Math.round(awayAvg + randomNormal() * 1.1));
    } else if (league === "nba") {
      const homeAvg = simStats.expectedHomeScore;
      const awayAvg = simStats.expectedAwayScore;
      const randomNormal = () => Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
      actualHomeScore = Math.max(70, Math.round(homeAvg + randomNormal() * 7.5));
      actualAwayScore = Math.max(70, Math.round(awayAvg + randomNormal() * 7.5));
    } else { // NFL
      const homeAvg = simStats.expectedHomeScore;
      const awayAvg = simStats.expectedAwayScore;
      const randomNormal = () => Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
      actualHomeScore = Math.max(3, Math.round(homeAvg + randomNormal() * 6.0));
      actualAwayScore = Math.max(3, Math.round(awayAvg + randomNormal() * 6.0));
    }

    // Determine wager winner based on bet type
    const homeMargin = actualHomeScore - actualAwayScore;
    const totalPoints = actualHomeScore + actualAwayScore;

    if (pendingBet.type === "moneyline_home") {
      betWon = homeMargin > 0;
    } else if (pendingBet.type === "moneyline_away") {
      betWon = homeMargin < 0;
    } else if (pendingBet.type === "moneyline_draw") {
      betWon = homeMargin === 0;
    } else if (pendingBet.type === "spread_home") {
      // Home cover spread if: home margin > -spread (e.g. -3.5 spread needs margin of 4+ to win)
      betWon = homeMargin > -pendingBet.matchup.spreadLine;
    } else if (pendingBet.type === "spread_away") {
      betWon = homeMargin < -pendingBet.matchup.spreadLine;
    } else if (pendingBet.type === "total_over") {
      betWon = totalPoints > pendingBet.matchup.totalLine;
    } else if (pendingBet.type === "total_under") {
      betWon = totalPoints < pendingBet.matchup.totalLine;
    }

    // Calculate payouts
    let payout = 0;
    let netProfit = -stake;

    if (betWon) {
      payout = stake * pendingBet.oddsDecimal;
      netProfit = payout - stake;
      
      userState.bankroll += netProfit;
      userState.totalWon += payout;
      userState.wonCount += 1;
    } else {
      userState.bankroll -= stake;
      userState.lostCount += 1;
    }

    userState.totalWagered += stake;

    // Log to History
    const historyItem = {
      date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      matchup: `${pendingBet.matchup.homeName} vs ${pendingBet.matchup.awayName}`,
      league: league.toUpperCase(),
      betName: pendingBet.name,
      odds: formatOdds(pendingBet.oddsDecimal, window.oddsFormatPreference || "american"),
      stake: stake,
      payout: betWon ? payout : 0,
      netProfit: netProfit,
      outcome: `${actualHomeScore} - ${actualAwayScore}`,
      result: betWon ? "WON" : "LOST"
    };

    userState.history.unshift(historyItem);
    this.saveState();

    // Render results in the Spinner Modal Overlay
    const resultTitle = betWon ? "WAGER SECURED! <i class='fas fa-check-circle neon-win-icon'></i>" : "WAGER LOSS <i class='fas fa-times-circle neon-loss-icon'></i>";
    const resultClass = betWon ? "res-won" : "res-lost";
    const profitText = betWon ? `+$${netProfit.toFixed(2)}` : `-$${stake.toFixed(2)}`;

    if (summary) {
      summary.innerHTML = `
        <div class="result-dialog ${resultClass}">
          <h2>${resultTitle}</h2>
          <div class="match-final-score">
            <span class="team">${pendingBet.matchup.homeName}</span>
            <span class="score">${actualHomeScore} - ${actualAwayScore}</span>
            <span class="team">${pendingBet.matchup.awayName}</span>
          </div>
          <div class="res-details-box">
            <div class="res-detail-row"><span>Your Wager:</span><strong>${pendingBet.name}</strong></div>
            <div class="res-detail-row"><span>Odds:</span><strong>${historyItem.odds}</strong></div>
            <div class="res-detail-row"><span>Risk Value:</span><strong>$${stake.toFixed(2)}</strong></div>
            <div class="res-detail-row border-highlight"><span>Net Profit:</span><strong class="${resultClass}-text">${profitText}</strong></div>
          </div>
          <div class="res-action-buttons">
            <button class="res-dismiss-btn" onclick="betslipManager.dismissOverlay()">Continue Predictions</button>
          </div>
        </div>
      `;
    }

    pendingBet = null;
    this.renderPendingBet();
  },

  dismissOverlay: function() {
    const overlay = document.getElementById("resolution-overlay");
    if (overlay) overlay.classList.remove("active");
  },

  // Update DOM headers and statistical displays (Profit, ROI, wager list)
  updateUI: function() {
    // Top summary boxes matching target design
    const bankrollDisplay = document.getElementById("bankroll-display");
    const totalWageredDisplay = document.getElementById("total-wagered-display");
    const profitDisplay = document.getElementById("total-profit-display");
    const winRateDisplay = document.getElementById("win-rate-display");
    const recordDisplay = document.getElementById("record-display");

    // Profile Card widgets
    const profileBankroll = document.getElementById("profile-bankroll");
    const profileWinnings = document.getElementById("profile-winnings");
    const profileLosses = document.getElementById("profile-losses");

    const totalProfit = userState.bankroll - 10000.00;
    const winRate = userState.wonCount + userState.lostCount > 0 
      ? ((userState.wonCount / (userState.wonCount + userState.lostCount)) * 100).toFixed(1)
      : "0.0";

    // Text bindings
    if (bankrollDisplay) bankrollDisplay.textContent = `$${userState.bankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (totalWageredDisplay) totalWageredDisplay.textContent = `$${userState.totalWagered.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
    
    if (profitDisplay) {
      profitDisplay.textContent = (totalProfit >= 0 ? "+" : "") + `$${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      profitDisplay.className = totalProfit >= 0 ? "neon-green-text" : "neon-rose-text";
    }

    if (winRateDisplay) winRateDisplay.textContent = `${winRate}%`;
    if (recordDisplay) recordDisplay.textContent = `${userState.wonCount}W - ${userState.lostCount}L`;

    // Bind Profile widgets
    if (profileBankroll) profileBankroll.textContent = `$${userState.bankroll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (profileWinnings) profileWinnings.textContent = `$${userState.totalWon.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
    
    const losses = userState.totalWagered - (userState.bankroll - 10000.00 >= 0 ? 0 : Math.abs(userState.bankroll - 10000.00));
    // Simple display for user profile losses: wagered minus final payouts
    const totalLostAmt = Math.max(0, userState.totalWagered - userState.totalWon);
    if (profileLosses) profileLosses.textContent = `$${totalLostAmt.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;

    // Build the History Log Table
    const tableBody = document.getElementById("history-table-body");
    if (tableBody) {
      if (userState.history.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="empty-table">No wagers resolved yet. Adjust sliders, select odds and place your first mock bet!</td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = userState.history.map(bet => {
          const resClass = bet.result === "WON" ? "row-won" : "row-lost";
          const profitClass = bet.netProfit >= 0 ? "neon-green-text" : "neon-rose-text";
          const profitPrefix = bet.netProfit >= 0 ? "+" : "";
          
          return `
            <tr>
              <td>${bet.date}</td>
              <td class="font-bold">${bet.matchup}</td>
              <td><span class="league-badge ${bet.league.toLowerCase()}">${bet.league}</span></td>
              <td>${bet.betName}</td>
              <td>${bet.odds}</td>
              <td>$${bet.stake.toFixed(2)}</td>
              <td>${bet.outcome}</td>
              <td class="${resClass}-badge font-bold">${bet.result}</td>
              <td class="${profitClass} font-bold">${profitPrefix}$${bet.netProfit.toFixed(2)}</td>
            </tr>
          `;
        }).join("");
      }
    }
  }
};
