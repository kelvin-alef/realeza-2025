let teams = [];
let kingIndex = 0;
let challengerPoints = 0; // Novo: Pontos do desafiante no rally (não pontua no ranking geral)

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
  // Ajuste nos IDs para garantir que são únicos ao longo do tempo, se inputs forem removidos
  teamsContainer.appendChild(createTeamInput(Date.now())); 
});

document.getElementById("teamForm").addEventListener("submit", (e) => {
  e.preventDefault();
  teams = [];
  // Coletar times de forma mais robusta após alterações na criação do input
  const inputs = teamsContainer.querySelectorAll(".team-input");
  inputs.forEach((input, i) => {
    const name = input.querySelector('input[type="text"]').value || `Time ${i+1}`;
    const color = input.querySelector('input[type="color"]').value;
    teams.push({ name, color, points: 0, id: i }); // Adicionar um ID
  });
  if (teams.length < 2) { alert("Adicione pelo menos 2 times!"); return; }

  // Inicializa o primeiro time como King aleatoriamente
  kingIndex = Math.floor(Math.random() * teams.length);
  challengerPoints = 0;
  
  setupScreen.classList.remove("active");
  gameScreen.classList.add("active");
  renderTeams();
  renderRanking();
});

// --- Tela principal ---
const kingNameEl = document.getElementById("kingName");
const kingPointsEl = document.getElementById("kingPoints"); // Total de pontos no ranking
const matchScoreEl = document.getElementById("matchScore"); // Placar da partida
const kingCardEl = document.getElementById("kingCard");
const challengerListEl = document.getElementById("challengerList");
const rankingListEl = document.getElementById("rankingList");

function renderTeams() {
  const king = teams[kingIndex];
  kingNameEl.textContent = king.name;
  
  // Atualiza o placar da partida
  matchScoreEl.innerHTML = `REI <span style="color: #ffd700;">${king.points}</span> - DES. <span style="color: #fff;">${challengerPoints}</span>`;
  
  // A cor do King agora é o background do cartão
  kingCardEl.style.backgroundColor = king.color;

  challengerListEl.innerHTML = "";
  let currentChallengerIndex = 0;
  teams.forEach((team, i) => {
    if (i !== kingIndex) {
      const div = document.createElement("div");
      div.classList.add("challenger");
      div.style.backgroundColor = team.color;
      div.innerHTML = `
        <p style="margin: 0;">${team.name}</p>
      `;
      // Adiciona o evento de troca de Rei ao clicar no desafiante (simulando a vitória do rally)
      div.addEventListener("click", () => {
        swapKing(i);
      });
      challengerListEl.appendChild(div);
      currentChallengerIndex++;
    }
  });
}

// Botão para adicionar ponto ao King (e ao ranking geral)
document.getElementById("addPoints").addEventListener("click", () => {
  teams[kingIndex].points++;
  challengerPoints = 0; // Reseta o placar do desafiante quando o Rei pontua
  renderTeams();
  renderRanking();
});

// Novo: Simula o desafiante ganhando o rally (troca de Rei)
document.getElementById("winRally").addEventListener("click", () => {
    challengerPoints++; // Incrementa o placar do desafiante
    renderTeams();
});

// Função para trocar o Rei
function swapKing(newKingIndex) {
    // Apenas troca, sem alterar o placar do King no ranking
    kingIndex = newKingIndex;
    challengerPoints = 0; // Reseta o placar da partida
    renderTeams();
    renderRanking();
}

// --- Ranking geral ---
function renderRanking() {
  // 1. Clonar e ordenar por pontos (decrescente)
  const sorted = [...teams].sort((a,b) => b.points - a.points);
  rankingListEl.innerHTML = "";

  sorted.forEach((team, index) => {
    const div = document.createElement("div");
    div.classList.add("rank-item");
    // Removida a cor de fundo do time no rank-item, usando a cor do CSS
    // Adicionando a posição no ranking
    div.innerHTML = `
        <span>${index + 1}.</span>
        <span style="color: ${team.color}; font-weight: bold;">${team.name}</span>
        <span>${team.points}</span>
    `;
    rankingListEl.appendChild(div);
  });
}

// Inicializa a tela de configuração
// Adicionar times iniciais para teste
document.addEventListener('DOMContentLoaded', () => {
    teamsContainer.appendChild(createTeamInput(1));
    teamsContainer.appendChild(createTeamInput(2));
    teamsContainer.appendChild(createTeamInput(3));
});

// --- PWA ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}