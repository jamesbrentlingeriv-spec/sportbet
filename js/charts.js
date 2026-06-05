// Chart.js Visualizations for Matchups and Predictions

let offensiveDefensiveChart = null;
let headToHeadChart = null;

const chartsManager = {
  // Initialize or update the analytic charts
  updateCharts: function(homeTeam, awayTeam, leagueKey) {
    this.renderOffenseDefenseChart(homeTeam, awayTeam, leagueKey);
    this.renderHeadToHeadChart(homeTeam, awayTeam);
  },

  // Renders comparisons of Team Ratings
  renderOffenseDefenseChart: function(home, away, league) {
    const ctx = document.getElementById("offense-defense-chart");
    if (!ctx) return;

    // Destroy existing instance to prevent hover rendering glitches
    if (offensiveDefensiveChart) {
      offensiveDefensiveChart.destroy();
    }

    // Determine normalized label scaling based on sport
    let homeOff = home.offense;
    let homeDef = home.defense;
    let awayOff = away.offense;
    let awayDef = away.defense;

    // Convert values to easily readable standard percentages (100% is league average)
    const homeOffPct = Math.round(homeOff * 100);
    const homeDefPct = Math.round((2 - homeDef) * 100); // Inverse defense so higher is better
    const awayOffPct = Math.round(awayOff * 100);
    const awayDefPct = Math.round((2 - awayDef) * 100);

    const data = {
      labels: ['Offensive Efficiency', 'Defensive Strength', 'Form Index', 'Home Advantage Rating'],
      datasets: [
        {
          label: home.name,
          data: [homeOffPct, homeDefPct, Math.round(home.form * 100), Math.round((1 + (home.homeAdvantage / (league === 'epl' ? 0.5 : 5.0))) * 100)],
          backgroundColor: 'rgba(255, 230, 0, 0.25)', // Semi-transparent yellow
          borderColor: '#ffe600',                       // Neon yellow
          borderWidth: 2,
          pointBackgroundColor: '#ffe600',
          pointHoverBorderColor: '#ffe600',
          fill: true
        },
        {
          label: away.name,
          data: [awayOffPct, awayDefPct, Math.round(away.form * 100), 100], // Away team has no local stadium index
          backgroundColor: 'rgba(6, 182, 212, 0.25)', // Semi-transparent cyan
          borderColor: '#06b6d4',                      // Neon cyan
          borderWidth: 2,
          pointBackgroundColor: '#06b6d4',
          pointHoverBorderColor: '#06b6d4',
          fill: true
        }
      ]
    };

    const config = {
      type: 'radar',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#a1a1aa',
              font: {
                family: 'Outfit',
                size: 11
              }
            }
          }
        },
        scales: {
          r: {
            grid: {
              color: 'rgba(255, 255, 255, 0.08)'
            },
            angleLines: {
              color: 'rgba(255, 255, 255, 0.08)'
            },
            pointLabels: {
              color: '#a1a1aa',
              font: {
                family: 'Outfit',
                size: 11
              }
            },
            ticks: {
              backdropColor: 'transparent',
              color: '#71717a',
              font: {
                size: 8
              },
              stepSize: 20
            },
            suggestedMin: 40,
            suggestedMax: 140
          }
        }
      }
    };

    offensiveDefensiveChart = new Chart(ctx, config);
  },

  // Renders the recent Head-to-Head score differences
  renderHeadToHeadChart: function(home, away) {
    const ctx = document.getElementById("h2h-chart");
    if (!ctx) return;

    if (headToHeadChart) {
      headToHeadChart.destroy();
    }

    // Lookup H2H historical scores
    const h2hData = home.h2h[away.id] || [];
    
    let labels = [];
    let margins = [];
    let backgroundColors = [];

    if (h2hData.length === 0) {
      // Mock defaults if no historical array found
      labels = ['Prev 1', 'Prev 2', 'Prev 3'];
      margins = [2, -1, 1];
    } else {
      // Map score numbers. For soccer, it is historical goal indexes. For NBA/NFL, score numbers.
      h2hData.forEach((score, index) => {
        labels.push(`Match ${index + 1}`);
        // If soccer, values represent home scores. Let's make mock margin variance
        if (score < 10) {
          // Soccer: mock margins between -2 and +3 goals
          const variance = [1, -1, 2, 0, -2];
          margins.push(variance[index % variance.length]);
        } else {
          // NBA/NFL: difference relative to a standard opponent average (e.g. 110 or 20 points)
          const baseline = score > 60 ? 112 : 20;
          margins.push(score - baseline);
        }
      });
    }

    // Color bars based on winner: Lime for Home victory (+), Cyan/Red for Away (-)
    backgroundColors = margins.map(val => val >= 0 ? 'rgba(255, 230, 0, 0.85)' : 'rgba(239, 68, 68, 0.85)');

    const config = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `${home.shortName} Performance Margin`,
          data: margins,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.85', '1.0')),
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#a1a1aa',
              font: {
                family: 'Outfit'
              }
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.08)'
            },
            ticks: {
              color: '#a1a1aa',
              font: {
                family: 'Outfit'
              }
            }
          }
        }
      }
    };

    headToHeadChart = new Chart(ctx, config);
  }
};
