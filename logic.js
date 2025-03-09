// Navigation handling (if needed)
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active-section'));
    document.querySelectorAll('.nav-button').forEach(b => b.classList.remove('active-button'));
    document.getElementById(sectionId).classList.add('active-section');
    event.currentTarget.classList.add('active-button');
}

// Add hover effect for player cards
document.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('mouseover', () => {
        card.style.transform = 'translateX(10px)';
    });
    card.addEventListener('mouseout', () => {
        card.style.transform = 'translateX(0)';
    });
});

// Link to your published Google Sheet CSV
const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbgKj5tqe0BVFOO-7ArgU_To2jU6pK4sWK3-nv61Tl6Zhba5Ocx6f8_cLlWgsWR1kD4Xg3W5Glm8t8/pub?output=csv';

// Team mapping configuration (ensure these IDs match your HTML element IDs)
const teamMapping = {
  'Inter Milan': 'inter-milan',
  'Liverpool FC': 'liverpool',
  'AC Milan': 'AC-milan',
  'Real Madrid': 'Real-madrid',
  'Bayern Munich': 'bayern',
  'Arsenal': 'Arsenal',
  'Paris Saint-Germain': 'Paris',
  'Manchester City': 'Manchester',
  'Barcelona': 'Barcelona',
  'Chelsea': 'Chelsea'
};

// Fetch and update data from Google Sheets
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
  // Clear existing data in each team section
  document.querySelectorAll('.team-group').forEach(team => {
    team.querySelectorAll('.member-card').forEach(card => card.remove());
  });

  // Group players by team using your mapping
  const grouped = players.reduce((acc, player) => {
    const teamId = teamMapping[player.Team];
    if (!acc[teamId]) acc[teamId] = [];
    acc[teamId].push(player);
    return acc;
  }, {});

  // Update each team's roster on the page
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

  // Re-attach hover events for the new cards
  document.querySelectorAll('.member-card').forEach(card => {
    card.addEventListener('mouseover', () => card.style.transform = 'translateX(10px)');
    card.addEventListener('mouseout', () => card.style.transform = 'translateX(0)');
  });
}

// Initial data load
fetchData();
// Auto-refresh every 5 minutes (300000 milliseconds)
setInterval(fetchData, 300000);
