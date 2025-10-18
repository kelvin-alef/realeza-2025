let teams = [];
let kingIndex = 0;
let totalGameDuration = 0; // Duração total em segundos
let timerInterval = null;
let timeLeft;

// --- Tela de configuração ---
const setupScreen = document.getElementById("setupScreen");
const gameScreen = document.getElementById("gameScreen");
const teamsContainer = document.getElementById("teamsContainer");
const gameDurationInput = document.getElementById("gameDuration"); 

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
    // Busca os inputs dentro do elemento input da vez
    const name = input.querySelector('input[type="text"]').value || `Time ${i+1}`;
    const color = input.querySelector('input[type="color"]').value;
    teams.push({ name, color, points: 0, id: i });
  });
  if (teams.length < 2) { alert("Adicione pelo menos 2 times!"); return; }

  totalGameDuration = parseInt(gameDurationInput.value) * 60; 
  timeLeft = totalGameDuration;
  
  kingIndex = Math.floor(Math.random() * teams.length);
  
  setupScreen.classList.remove("active");
  gameScreen.classList.add("active");
  renderTeams();
  renderRanking();
  updateTimerDisplay(); 
  
  startTimerBtn.textContent = '▶️';
  startTimerBtn.style.backgroundColor = 'none'; // Reseta o estilo de fundo
  timeValueEl.style.color = '#fff';
});

// --- Tela principal ---
const kingNameEl = document.getElementById("kingName");
// REMOVIDO: kingPointsEl (não é mais necessário)
const kingCardEl = document.getElementById("kingCard");
const challengerListEl = document.getElementById("challengerList");
const rankingListEl = document.getElementById("rankingList");

function renderTeams() {
  const king = teams[kingIndex];
  kingNameEl.textContent = king.name;
  
  // REMOVIDO: Atualização de placar simplificado
  
  kingCardEl.style.backgroundColor = king.color;

  challengerListEl.innerHTML = "";
  teams.forEach((team, i) => {
    if (i !== kingIndex) {
      const div = document.createElement("div");
      div.classList.add("challenger");
      div.style.backgroundColor = team.color;
      // Nome do desafiante (destaque via CSS)
      div.innerHTML = `<p>${team.name}</p>`;
      
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
        <span style="color: ${team.color};">${team.name}</span>
        <span>${team.points}</span>
    `;
    rankingListEl.appendChild(div);
  });
}

// --- Lógica do Cronômetro ---
const startTimerBtn = document.getElementById("startTimerBtn");
const timeValueEl = document.getElementById("timeValue");

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timeValueEl.textContent = formatTime(timeLeft);
    // As cores agora são tratadas no CSS para o display do tempo
    if (timeLeft <= 10 && timeLeft > 0) {
        timeValueEl.style.color = 'red';
    } else if (timeLeft > 10) {
        timeValueEl.style.color = '#00cc66';
    } else if (timeLeft <= 0) {
        timeValueEl.style.color = 'red';
    }
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        startTimerBtn.textContent = '▶️'; 
        startTimerBtn.style.color = '#ff9900'; // Cor do Play
        return;
    }

    if (timeLeft <= 0) {
        timeLeft = totalGameDuration;
    }
    
    startTimerBtn.textContent = '⏹️'; 
    startTimerBtn.style.color = '#cc0000'; // Cor do Stop

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            startTimerBtn.textContent = '▶️';
            startTimerBtn.style.color = '#ff9900'; 
        }
    }, 1000);
}

startTimerBtn.addEventListener("click", startTimer);

// --- Lógica Próxima Rodada ---
const nextRoundBtn = document.getElementById("nextRoundBtn");

function nextRound() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    
    teamsContainer.innerHTML = ''; 
    
    // Adiciona times iniciais padrão
    teamsContainer.appendChild(createTeamInput(1));
    teamsContainer.appendChild(createTeamInput(2));
    teamsContainer.appendChild(createTeamInput(3));
    gameDurationInput.value = 15;
    
    gameScreen.classList.remove("active");
    setupScreen.classList.add("active");
    
    // Reseta o visual do botão do cronômetro
    startTimerBtn.textContent = '▶️';
    startTimerBtn.style.color = '#ff9900';
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