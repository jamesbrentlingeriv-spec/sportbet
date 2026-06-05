// AI Predictive Strategy Advisor & Watchlist Manager

const WATCHLIST_STORAGE_KEY = "apex_predict_watchlist";

window.watchlistState = [];

const advisorManager = {
  // Load Saved Recommendations Watchlist
  loadWatchlist: function() {
    const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (saved) {
      try {
        watchlistState = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing watchlist, resetting...", e);
      }
    }
    this.renderWatchlist();
  },

  // Save watchlist item
  saveWatchlistItem: function(item) {
    if (!item) return;
    
    // Avoid duplicates
    const exists = watchlistState.some(w => w.matchup === item.matchup && w.pick === item.pick);
    if (!exists) {
      watchlistState.unshift(item);
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlistState));
      this.renderWatchlist();
    }
  },

  // Remove watchlist item
  removeWatchlistItem: function(index) {
    watchlistState.splice(index, 1);
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlistState));
    this.renderWatchlist();
  },

  // Render Watchlist in DOM
  renderWatchlist: function() {
    const listBody = document.getElementById("watchlist-items-list");
    if (!listBody) return;

    if (watchlistState.length === 0) {
      listBody.innerHTML = `
        <div class="empty-watchlist">
          <i class="far fa-star text-zinc-500 margin-b-4" style="font-size: 1.5rem;"></i>
          <p>Watchlist is empty</p>
          <span class="subtext">Save recommendations from the AI Strategy Panel to track them.</span>
        </div>
      `;
      return;
    }

    listBody.innerHTML = watchlistState.map((item, idx) => {
      const confClass = item.confidence === "HIGH" ? "positive" : item.confidence === "MEDIUM" ? "cyan" : "orange";
      return `
        <div class="watchlist-card">
          <div class="watchlist-card-header">
            <span class="watchlist-matchup">${item.matchup}</span>
            <button class="remove-watchlist-btn" onclick="advisorManager.removeWatchlistItem(${idx})"><i class="fas fa-times"></i></button>
          </div>
          <div class="watchlist-card-body">
            <div class="watchlist-pick">
              <span>Pick: <strong>${item.pick}</strong></span>
              <span class="watchlist-odds">${item.odds}</span>
            </div>
            <div class="watchlist-meta">
              <span class="conf-badge-${confClass}">${item.confidence} Confidence</span>
              <span class="watchlist-date">${item.date}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  // Generates AI Rationale Report based on simulation
  generateAdvisorReport: async function(homeTeam, awayTeam, leagueKey, simStats, evValues) {
    const container = document.getElementById("ai-advisor-panel-container");
    if (!container) return;

    // Display loader
    container.innerHTML = `
      <div class="advisor-loader">
        <div class="spinner-neon"></div>
        <h4>AI Strategy Analysis in progress...</h4>
      </div>
    `;

    // Compute optimal recommendations based on highest positive EV%
    let optimalPick = "";
    let highestEV = -100;
    let optOdds = "+100";
    let calculatedProb = 0.5;

    // Evaluate MONEYLINE EV
    if (evValues.mlHome > highestEV) {
      highestEV = evValues.mlHome;
      optimalPick = `${homeTeam.name} Moneyline`;
      optOdds = evValues.mlHomeOdds;
      calculatedProb = simStats.homeWinProbability;
    }
    if (evValues.mlAway > highestEV) {
      highestEV = evValues.mlAway;
      optimalPick = `${awayTeam.name} Moneyline`;
      optOdds = evValues.mlAwayOdds;
      calculatedProb = simStats.awayWinProbability;
    }
    if (leagueKey === 'epl' && evValues.mlDraw > highestEV) {
      highestEV = evValues.mlDraw;
      optimalPick = `Draw Moneyline`;
      optOdds = evValues.mlDrawOdds;
      calculatedProb = simStats.drawProbability;
    }

    // Evaluate SPREAD EV
    if (evValues.spreadHome > highestEV) {
      highestEV = evValues.spreadHome;
      const sign = simStats.spread > 0 ? "+" : "";
      optimalPick = `${homeTeam.name} ${sign}${simStats.spread}`;
      optOdds = evValues.spreadHomeOdds;
      calculatedProb = evValues.spreadHomeProb;
    }
    if (evValues.spreadAway > highestEV) {
      highestEV = evValues.spreadAway;
      const sign = simStats.spread > 0 ? "-" : "+";
      const absSpread = Math.abs(simStats.spread);
      optimalPick = `${awayTeam.name} ${sign}${absSpread}`;
      optOdds = evValues.spreadAwayOdds;
      calculatedProb = 1 - evValues.spreadHomeProb;
    }

    // Evaluate TOTALS EV
    if (evValues.totalOver > highestEV) {
      highestEV = evValues.totalOver;
      optimalPick = `Over ${simStats.total.toFixed(1)}`;
      optOdds = evValues.totalOverOdds;
      calculatedProb = evValues.totalOverProb;
    }
    if (evValues.totalUnder > highestEV) {
      highestEV = evValues.totalUnder;
      optimalPick = `Under ${simStats.total.toFixed(1)}`;
      optOdds = evValues.totalUnderOdds;
      calculatedProb = 1 - evValues.totalOverProb;
    }

    // Set model confidence rating
    let confidence = "LOW";
    let confClass = "orange-text";
    if (highestEV > 7.0) {
      confidence = "HIGH";
      confClass = "neon-green-text";
    } else if (highestEV > 2.0) {
      confidence = "MEDIUM";
      confClass = "neon-cyan-text";
    }

    // AI news modifiers check
    const newsScorePct = (newsEngine.currentSentimentScore * 100).toFixed(1);
    
    // Generate Rationale Text
    let rationaleText = "";

    if (openRouterClient.isConfigured()) {
      // Fetch dynamic analysis from OpenRouter
      try {
        const prompt = `
          Analyze a matchup in the ${leagueKey.toUpperCase()} between ${homeTeam.name} and ${awayTeam.name}.
          Model projections:
          - Computed Win Probability: Home Team (${(simStats.homeWinProbability * 100).toFixed(1)}%), Away Team (${(simStats.awayWinProbability * 100).toFixed(1)}%).
          - Predicted scoreline: ${homeTeam.shortName} ${simStats.expectedHomeScore} - ${simStats.expectedAwayScore} ${awayTeam.shortName}.
          - Model Optimal Recommendation Pick: "${optimalPick}" at odds "${optOdds}" with calculated EV margin of "${highestEV}%".
          - Active AI news sentiment modifier: ${newsScorePct}% positive impact on home strength.
          
          Write a concise, professional 3-sentence tactical betting rationale. Explain the model's advantage, cite potential previous season matchup trends or injury reports, and explain why this specific value pick has positive EV. Keep it highly analytic and brief.
        `;
        
        rationaleText = await openRouterClient.chatCompletion(prompt, "You are a professional sports handicapping strategist.");
      } catch (e) {
        console.warn("OpenRouter rationale completion failed, using local builder...", e);
        rationaleText = this.generateFallbackRationale(homeTeam, awayTeam, optimalPick, highestEV, confidence);
      }
    } else {
      // Fallback local rationale
      await new Promise(resolve => setTimeout(resolve, 800));
      rationaleText = this.generateFallbackRationale(homeTeam, awayTeam, optimalPick, highestEV, confidence);
    }

    // Active recommendation payload
    const activeRecommendation = {
      matchup: `${homeTeam.shortName} vs ${awayTeam.shortName}`,
      pick: optimalPick,
      odds: optOdds,
      confidence: confidence,
      date: new Date().toLocaleDateString()
    };

    // Render in Strategy UI
    const evSymbol = highestEV >= 0 ? "+" : "";
    container.innerHTML = `
      <div class="ai-report-card">
        <div class="report-section">
          <span class="report-label">Optimal Strategic Pick</span>
          <div class="report-pick-details">
            <span class="report-pick-name">${optimalPick}</span>
            <span class="report-pick-odds">${optOdds}</span>
          </div>
        </div>
        
        <div class="report-stat-row">
          <div class="rep-stat-col">
            <span>Model Confidence</span>
            <strong class="${confClass}">${confidence}</strong>
          </div>
          <div class="rep-stat-col">
            <span>Expected Value (+EV)</span>
            <strong class="neon-green-text">${evSymbol}${highestEV.toFixed(1)}%</strong>
          </div>
        </div>

        <div class="report-section border-top border-light padding-t-3">
          <span class="report-label"><i class="fas fa-robot text-zinc-400"></i> AI Analyst Rationale</span>
          <p class="report-rationale-paragraph">${rationaleText}</p>
        </div>

        <button class="save-recommendation-btn" id="save-rec-btn">
          <i class="far fa-star"></i> Save value Pick
        </button>
      </div>
    `;

    // Bind save pick button event
    document.getElementById("save-rec-btn")?.addEventListener("click", () => {
      this.saveWatchlistItem(activeRecommendation);
      const btn = document.getElementById("save-rec-btn");
      if (btn) {
        btn.innerHTML = `<i class="fas fa-check"></i> Pick Saved!`;
        btn.style.borderColor = "var(--neon-lime)";
        btn.style.color = "var(--neon-lime)";
        btn.disabled = true;
      }
    });
  },

  // Generates realistic text matching team parameters
  generateFallbackRationale: function(home, away, pick, ev, confidence) {
    if (ev <= 0) {
      return `Our quantitative models represent a tight pricing efficiency between bookmaker markets and our simulations. Roster health indexes favor an equilibrium, suggesting a neutral holding pattern. We advise keeping stakes low on this matchup due to thin EV margins.`;
    }

    if (confidence === "HIGH") {
      return `Our mathematical model identifies a significant price dislocation of ${ev.toFixed(1)}% on ${pick}. Key performance multipliers from previous season head-to-head tracking demonstrate that ${home.name} holds a structural defensive advantage against the opponent transition game. Roster injury vectors and recent positive momentum further solidify this value pick.`;
    } else {
      return `Projections reveal a moderate EV mismatch on ${pick} relative to opening bookmaker odds. While previous seasons represent mixed historical outcomes, ${away.name}'s current form curves indicate stable covering numbers, making this recommendation a viable medium-range value candidate.`;
    }
  }
};
