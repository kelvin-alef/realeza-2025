let teams = [];
let kingIndex = 0;
let totalGameDuration = 0;
let timerInterval = null;
let timeLeft;

const setupScreen = document.getElementById("setupScreen");
const gameScreen = document.getElementById("gameScreen");
const resultsScreen = document.getElementById("resultsScreen"); // NOVA TELA
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
  teamsContainer.appendChild(createTeamInput(Date.now())); 
});

document.getElementById("teamForm").addEventListener("submit", (e) => {
  e.preventDefault();
  teams = [];
  const inputs = teamsContainer.querySelectorAll(".team-input");
  inputs.forEach((input, i) => {
    const name = input.querySelector('input[type="text"]').value || `Time ${i+1}`;
    const color = input.querySelector('input[type="color"]').value;
    // NOVO: Adiciona timeAsKing a 0
    teams.push({ name, color, points: 0, id: i, timeAsKing: 0 });
  });
  if (teams.length < 2) { alert("Adicione pelo menos 2 times!"); return; }

  totalGameDuration = parseInt(gameDurationInput.value) * 60; 
  timeLeft = totalGameDuration;
  
  // Reseta todos os dados ao iniciar um novo jogo do zero
  teams.forEach(team => {
      team.points = 0;
      team.timeAsKing = 0;
  });
  
  kingIndex = Math.floor(Math.random() * teams.length);
  
  setupScreen.classList.remove("active");
  gameScreen.classList.add("active");
  renderTeams();
  renderRanking();
  updateTimerDisplay(); 
  
  startTimerBtn.textContent = '▶️';
  startTimerBtn.style.color = '#ff9900';
  timeValueEl.style.color = '#fff';
});

const kingNameEl = document.getElementById("kingName");
const kingCardEl = document.getElementById("kingCard");
const challengerListEl = document.getElementById("challengerList");
const rankingListEl = document.getElementById("rankingList");

function renderTeams() {
  const king = teams[kingIndex];
  
  kingCardEl.style.backgroundColor = king.color;
  kingNameEl.textContent = king.name;

  challengerListEl.innerHTML = "";
  teams.forEach((team, i) => {
    if (i !== kingIndex) {
      const div = document.createElement("div");
      div.classList.add("challenger");
      
      div.style.backgroundColor = team.color;
      
      const p = document.createElement("p");
      p.textContent = team.name;
      div.appendChild(p);
      
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

function renderRanking() {
  // Ordena por pontos, e em caso de empate, por tempo de realeza
  const sorted = [...teams].sort((a,b) => {
      if (b.points !== a.points) {
          return b.points - a.points;
      }
      return b.timeAsKing - a.timeAsKing; 
  });
  rankingListEl.innerHTML = "";

  sorted.forEach((team, index) => {
    const div = document.createElement("div");
    div.classList.add("rank-item");
    
    div.innerHTML = `
        <span>${index + 1}.</span>
        <span style="background-color: ${team.color};">${team.name}</span>
        <span>${team.points}</span>
    `;
    rankingListEl.appendChild(div);
  });
}

const startTimerBtn = document.getElementById("startTimerBtn");
const timeValueEl = document.getElementById("timeValue");

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    timeValueEl.textContent = formatTime(timeLeft);
    const timeDisplayContainer = timeValueEl.parentNode;
    
    if (timeLeft <= 10 && timeLeft > 0) {
        timeDisplayContainer.style.color = 'red';
    } else if (timeLeft > 10) {
        timeDisplayContainer.style.color = '#00cc66';
    } else if (timeLeft <= 0) {
        timeDisplayContainer.style.color = 'red';
    }
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        startTimerBtn.textContent = '▶️'; 
        startTimerBtn.style.color = '#ff9900'; 
        return;
    }

    if (timeLeft <= 0) {
        timeLeft = totalGameDuration;
    }
    
    startTimerBtn.textContent = '⏹️'; 
    startTimerBtn.style.color = '#cc0000'; 

    timerInterval = setInterval(() => {
        timeLeft--;
        
        // NOVO: Adiciona 1 segundo ao tempo de realeza da equipe atual
        teams[kingIndex].timeAsKing++;
        
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            startTimerBtn.textContent = '▶️';
            startTimerBtn.style.color = '#ff9900'; 
            // Opcional: Chama a tela de resultados automaticamente
            // showResultsScreen(); 
        }
    }, 1000);
}

startTimerBtn.addEventListener("click", startTimer);

// LÓGICA DA TELA DE RESULTADOS

const showResultsBtn = document.getElementById("showResultsBtn");
const roundWinnerEl = document.getElementById("roundWinner");
const resultsTableContainerEl = document.getElementById("resultsTableContainer");
const startNewRoundBtn = document.getElementById("startNewRoundBtn");
const resetGameBtn = document.getElementById("resetGameBtn");

showResultsBtn.addEventListener("click", showResultsScreen);

function showResultsScreen() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    
    // 1. Encontra o vencedor da rodada
    const sortedFinal = [...teams].sort((a,b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        return b.timeAsKing - a.timeAsKing; 
    });
    
    const winner = sortedFinal[0];
    
    roundWinnerEl.innerHTML = `O vencedor desta rodada é **${winner.name}**! 🥇`;

    // 2. Cria a tabela de resumo
    let tableHtml = `
        <div class="results-table">
            <div class="header">
                <span>POSIÇÃO</span>
                <span>TIME</span>
                <span>PONTOS</span>
                <span>TEMPO DE REALEZA</span>
            </div>
    `;

    sortedFinal.forEach((team, index) => {
        tableHtml += `
            <div class="row">
                <span>${index + 1}.</span>
                <span style="background-color: ${team.color};">${team.name}</span>
                <span>${team.points}</span>
                <span>${formatTime(team.timeAsKing)}</span>
            </div>
        `;
    });
    
    tableHtml += `</div>`;
    resultsTableContainerEl.innerHTML = tableHtml;
    
    // 3. Navega para a tela de resultados
    gameScreen.classList.remove("active");
    resultsScreen.classList.add("active");
    
    // Define o ID do vencedor para o botão de iniciar nova rodada
    startNewRoundBtn.dataset.winnerId = winner.id;
}

function startNewRound() {
    const winnerId = parseInt(startNewRoundBtn.dataset.winnerId);
    
    // Remove a equipe vencedora do array de times
    teams = teams.filter(team => team.id !== winnerId);
    
    if (teams.length < 2) {
        alert("Fim do Torneio! Reinicie o jogo.");
        resetGame();
        return;
    }
    
    // Reseta pontos e tempo para o próximo round
    teams.forEach(team => {
        team.points = 0;
        team.timeAsKing = 0;
    });

    // Inicia um novo round com os times restantes
    kingIndex = Math.floor(Math.random() * teams.length);
    timeLeft = totalGameDuration;

    resultsScreen.classList.remove("active");
    gameScreen.classList.add("active");
    renderTeams();
    renderRanking();
    updateTimerDisplay();
}

function resetGame() {
    teams = [];
    teamsContainer.innerHTML = ''; 
    
    // Recria os inputs vazios
    teamsContainer.appendChild(createTeamInput(1));
    teamsContainer.appendChild(createTeamInput(2));
    teamsContainer.appendChild(createTeamInput(3));
    gameDurationInput.value = 15;
    
    resultsScreen.classList.remove("active");
    setupScreen.classList.add("active");
}

startNewRoundBtn.addEventListener("click", startNewRound);
resetGameBtn.addEventListener("click", resetGame);

document.addEventListener('DOMContentLoaded', () => {
    if (teamsContainer.children.length === 0) {
        teamsContainer.appendChild(createTeamInput(1));
        teamsContainer.appendChild(createTeamInput(2));
        teamsContainer.appendChild(createTeamInput(3));
    }
});