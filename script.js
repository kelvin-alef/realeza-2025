let teams = [];
let kingIndex = 0;
let totalGameDuration = 0; // Duração total em segundos
let timerInterval;
let timeLeft;

// --- Tela de configuração ---
const setupScreen = document.getElementById("setupScreen");
const gameScreen = document.getElementById("gameScreen");
const teamsContainer = document.getElementById("teamsContainer");
const gameDurationInput = document.getElementById("gameDuration"); // Novo input

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
  teamsContainer.appendChild(createTeamInput(Date.now())); 
});

document.getElementById("teamForm").addEventListener("submit", (e) => {
  e.preventDefault();
  teams = [];
  const inputs = teamsContainer.querySelectorAll(".team-input");
  inputs.forEach((input, i) => {
    const name = input.querySelector('input[type="text"]').value || `Time ${i+1}`;
    const color = input.querySelector('input[type="color"]').value;
    teams.push({ name, color, points: 0, id: i });
  });
  if (teams.length < 2) { alert("Adicione pelo menos 2 times!"); return; }

  // NOVO: Coleta a duração da partida
  totalGameDuration = parseInt(gameDurationInput.value) * 60; 
  timeLeft = totalGameDuration;
  
  kingIndex = Math.floor(Math.random() * teams.length);
  
  setupScreen.classList.remove("active");
  gameScreen.classList.add("active");
  renderTeams();
  renderRanking();
  updateTimerDisplay(); // Exibe o tempo inicial
});

// --- Tela principal ---
const kingNameEl = document.getElementById("kingName");
const kingCardEl = document.getElementById("kingCard");
const challengerListEl = document.getElementById("challengerList");
const rankingListEl = document.getElementById("rankingList");
const matchScoreEl = document.getElementById("matchScore");
const kingPointsDisplayEl = document.getElementById("kingPointsDisplay");

function renderTeams() {
  const king = teams[kingIndex];
  kingNameEl.textContent = king.name;
  
  // Atualiza o placar simplificado
  matchScoreEl.innerHTML = `PONTOS TOTAIS: <span style="color: #ffd700;">${king.points}</span>`;
  
  kingCardEl.style.backgroundColor = king.color;

  challengerListEl.innerHTML = "";
  teams.forEach((team, i) => {
    if (i !== kingIndex) {
      const div = document.createElement("div");
      div.classList.add("challenger");
      div.style.backgroundColor = team.color;
      // Nome do desafiante (destaque via CSS)
      div.innerHTML = `<p style="margin: 0;">${team.name}</p>`;
      
      // Clicar no desafiante o torna o novo King
      div.addEventListener("click", () => {
        swapKing(i);
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

function swapKing(newKingIndex) {
    kingIndex = newKingIndex;
    renderTeams();
    renderRanking();
}

// --- Ranking geral ---
function renderRanking() {
  const sorted = [...teams].sort((a,b) => b.points - a.points);
  rankingListEl.innerHTML = "";

  sorted.forEach((team, index) => {
    const div = document.createElement("div");
    div.classList.add("rank-item");
    div.innerHTML = `
        <span>${index + 1}.</span>
        <span style="color: ${team.color}; font-weight: bold;">${team.name}</span>
        <span>${team.points}</span>
    `;
    rankingListEl.appendChild(div);
  });
}

// --- Lógica do Cronômetro (NOVO) ---
const startTimerBtn = document.getElementById("startTimerBtn");
const timeValueEl = document.getElementById("timeValue");

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timeValueEl.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        startTimerBtn.disabled = true;
        timeValueEl.style.color = 'red';
        // Opcional: alerta de fim de jogo
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval); 
    
    if (timeLeft <= 0) timeLeft = totalGameDuration; 
    
    startTimerBtn.disabled = true;
    startTimerBtn.textContent = 'Contagem Iniciada';
    timeValueEl.style.color = '#00cc66';

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            startTimerBtn.textContent = 'Tempo Esgotado!';
        }
    }, 1000);
}

startTimerBtn.addEventListener("click", startTimer);

// --- Lógica Próxima Rodada (NOVO) ---
const nextRoundBtn = document.getElementById("nextRoundBtn");

function nextRound() {
    if (timerInterval) clearInterval(timerInterval);
    
    // Reseta o estado do jogo (opcional, para uma nova configuração limpa)
    teams = [];
    kingIndex = 0;
    totalGameDuration = 0;
    timeLeft = 0;
    
    // Remove os inputs dinâmicos
    teamsContainer.innerHTML = ''; 
    
    // Adiciona times iniciais padrão (para facilitar)
    teamsContainer.appendChild(createTeamInput(1));
    teamsContainer.appendChild(createTeamInput(2));
    teamsContainer.appendChild(createTeamInput(3));
    gameDurationInput.value = 15; // Reseta a duração para o valor padrão
    
    // Volta para a tela de configuração
    gameScreen.classList.remove("active");
    setupScreen.classList.add("active");
    
    // Reseta o botão do cronômetro
    startTimerBtn.textContent = 'Iniciar Cronômetro';
    startTimerBtn.disabled = false;
    timeValueEl.style.color = '#fff';
}

nextRoundBtn.addEventListener("click", nextRound);


// Inicializa a tela de configuração com times de exemplo
document.addEventListener('DOMContentLoaded', () => {
    if (teamsContainer.children.length === 0) {
        teamsContainer.appendChild(createTeamInput(1));
        teamsContainer.appendChild(createTeamInput(2));
        teamsContainer.appendChild(createTeamInput(3));
    }
});

// --- PWA ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}