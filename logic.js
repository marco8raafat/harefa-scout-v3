// Navigation handling
function showSection(sectionId) {
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active-section'));
  document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active-button'));
  document.getElementById(sectionId).classList.add('active-section');
  event.currentTarget.classList.add('active-button');
}

// Link to your published Google Sheet CSV
const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbgKj5tqe0BVFOO-7ArgU_To2jU6pK4sWK3-nv61Tl6Zhba5Ocx6f8_cLlWgsWR1kD4Xg3W5Glm8t8/pub?output=csv';

// Team mapping configuration
const teamMapping = {
    'Inter Milan': 'inter-milan',
    'Liverpool': 'liverpool', // Updated key to match the table
    'AC Milan': 'AC-milan',
    'Real Madrid': 'Real-madrid',
    'Bayern Munich': 'bayern',
    'Arsenal': 'Arsenal',
    'Paris Saint-Germain': 'Paris',
    'Manchester City': 'Manchester',
    'Barcelona': 'Barcelona',
    'Chelsea': 'Chelsea'
  };

// Fetch and update data
async function fetchData() {
  try {
      const response = await axios.get(sheetURL);
      const parsed = Papa.parse(response.data, { header: true });
      updateTeamData(parsed.data);
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

function updateTeamData(players) {
  // Clear existing data
  document.querySelectorAll('.team-group').forEach(team => {
      team.querySelectorAll('.member-card').forEach(card => card.remove());
  });

  // Group players and calculate points
  const grouped = players.reduce((acc, player) => {
      const teamId = teamMapping[player.Team];
      if (!acc[teamId]) acc[teamId] = [];
      acc[teamId].push(player);
      return acc;
  }, {});

  // Calculate team points
  const teamPoints = {};
  Object.entries(grouped).forEach(([teamId, players]) => {
      const totalPoints = players.reduce((sum, player) => sum + parseFloat(player.Rate || 0), 0);
      teamPoints[teamId] = Math.round(totalPoints);
  });

  // Update team rosters
  Object.entries(grouped).forEach(([teamId, players]) => {
      const teamSection = document.getElementById(teamId);
      if (!teamSection) return;

      players.forEach(player => {
          const card = document.createElement('div');
          card.className = 'member-card';
          card.innerHTML = `
              <div class="player-number">${player.Number}</div>
              <div>${player.Name}</div>
              <div class="scout-rating">⭐ ${player.Rate}</div>
          `;
          teamSection.appendChild(card);
      });
  });

  // Update standings table
  updateStandings(teamPoints);
}

function updateStandings(teamPoints) {
  const tableBody = document.querySelector('.scouting-table tbody');
  const rows = Array.from(tableBody.querySelectorAll('tr'));
  const teamMap = Object.entries(teamMapping).reduce((acc, [name, id]) => {
      acc[id] = name;
      return acc;
  }, {});

  // Update points and create sorting array
  const standings = rows.map(row => {
      const teamId = teamMapping[row.children[1].textContent];
      const points = teamPoints[teamId] || 0;
      row.children[2].textContent = points;
      return { row, points };
  });

  // Sort standings
  standings.sort((a, b) => b.points - a.points || a.row.children[1].textContent.localeCompare(b.row.children[1].textContent));

  // Update positions and reinsert rows
  standings.forEach((standing, index) => {
      const row = standing.row;
      row.children[0].textContent = index + 1;
      
      // Add inter-row class to first place team
      if (index === 0 || index === 1 || index === 2) {
          row.classList.add('inter-row');
      } else {
          row.classList.remove('inter-row');
      }
      tableBody.appendChild(row);
  });
}

// Initial load and auto-refresh
fetchData();
setInterval(fetchData, 300000);

// Card hover effects
document.addEventListener('mouseover', e => {
  if (e.target.closest('.member-card')) {
      e.target.closest('.member-card').style.transform = 'translateX(10px)';
  }
});

document.addEventListener('mouseout', e => {
  if (e.target.closest('.member-card')) {
      e.target.closest('.member-card').style.transform = 'translateX(0)';
  }
});
