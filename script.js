let teams = [];
let kingIndex = 0;

// --- Tela de configuração ---
const setupScreen = document.getElementById("setupScreen");
const gameScreen = document.getElementById("gameScreen");
const teamsContainer = document.getElementById("teamsContainer");

function createTeamInput(index) {
  const div = document.createElement("div");
  div.classList.add("team-input");
  div.innerHTML = `
    <input type="text" id="teamName${index}" placeholder="Nome do time" required>
    <input type="color" id="teamColor${index}" value="#${Math.floor(Math.random()*16777215).toString(16)}">
    <button type="button" class="remove-btn">Remover</button>
  `;
  div.querySelector(".remove-btn").addEventListener("click", () => div.remove());
  return div;
}

document.getElementById("addTeam").addEventListener("click", () => {
  const count = document.querySelectorAll(".team-input").length;
  teamsContainer.appendChild(createTeamInput(count));
});

document.getElementById("teamForm").addEventListener("submit", (e) => {
  e.preventDefault();
  teams = [];
  const inputs = document.querySelectorAll(".team-input");
  inputs.forEach((input, i) => {
    const name = document.getElementById(`teamName${i}`).value || `Time ${i+1}`;
    const color = document.getElementById(`teamColor${i}`).value;
    teams.push({ name, color, points: 0 });
  });
  if (teams.length < 2) { alert("Adicione pelo menos 2 times!"); return; }

  setupScreen.classList.remove("active");
  gameScreen.classList.add("active");
  renderTeams();
  renderRanking();
});

// --- Tela principal ---
const kingNameEl = document.getElementById("kingName");
const kingPointsEl = document.getElementById("kingPoints");
const kingCardEl = document.getElementById("kingCard");
const challengerListEl = document.getElementById("challengerList");
const rankingListEl = document.getElementById("rankingList");

function renderTeams() {
  const king = teams[kingIndex];
  kingNameEl.textContent = king.name;
  kingPointsEl.textContent = king.points;
  kingCardEl.style.background = king.color;

  challengerListEl.innerHTML = "";
  teams.forEach((team, i) => {
    if (i !== kingIndex) {
      const div = document.createElement("div");
      div.classList.add("challenger");
      div.style.background = team.color;
      div.textContent = team.name;
      div.addEventListener("click", () => {
        kingIndex = i;
        renderTeams();
        renderRanking();
      });
      challengerListEl.appendChild(div);
    }
  });
}

document.getElementById("addPoints").addEventListener("click", () => {
  teams[kingIndex].points++;
  renderTeams();
  renderRanking();
});

// --- Ranking geral ---
function renderRanking() {
  const sorted = [...teams].sort((a,b) => b.points - a.points);
  rankingListEl.innerHTML = "";
  sorted.forEach(team => {
    const div = document.createElement("div");
    div.classList.add("rank-item");
    div.style.background = team.color;
    div.innerHTML = `<span>${team.name}</span><span>${team.points}</span>`;
    rankingListEl.appendChild(div);
  });
}

// --- PWA ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
