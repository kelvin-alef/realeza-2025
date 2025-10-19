let teams = [];
let kingIndex = 0;
let totalGameDuration = 0;
let timerInterval = null;
let timeLeft;

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

  totalGameDuration = parseInt(gameDurationInput.value) * 60;
  kingIndex = 0;
  
  if (teams.length < 2) {
      alert("Adicione pelo menos 2 times para começar o jogo.");
      return;
  }
  
  shuffleArray(teams);

  setupScreen.classList.remove("active");
  gameScreen.classList.add("active");
  
  initGame();
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const kingNameEl = document.getElementById("kingName");
const kingCardEl = document.getElementById("kingCard");
const challengerListEl = document.getElementById("challengerList");
const rankingListEl = document.getElementById("rankingList");
const addPointsBtn = document.getElementById("addPoints");

function updateCourt() {
    if (teams.length === 0) return;

    const king = teams[kingIndex];
    kingNameEl.textContent = king.name;
    kingCardEl.style.backgroundColor = king.color;

    challengerListEl.innerHTML = "";
    
    teams.forEach((team, index) => {
        if (index !== kingIndex) {
            const challengerDiv = document.createElement("div");
            challengerDiv.classList.add("challenger");
            challengerDiv.style.backgroundColor = team.color;
            challengerDiv.innerHTML = `<p>${team.name}</p>`;
            challengerDiv.dataset.teamId = team.id;
            
            challengerDiv.addEventListener("click", () => swapKing(team.id));

            challengerListEl.appendChild(challengerDiv);
        }
    });
}

function renderRanking() {
  const sorted = [...teams].sort((a,b) => b.points - a.points);
  rankingListEl.innerHTML = "";

  sorted.forEach((team, index) => {
    const div = document.createElement("div");
    div.classList.add("rank-item");
    
    if (team.id === teams[kingIndex].id) {
        div.classList.add("king-rank");
    }
    
    div.innerHTML = `
        <span>${index + 1}.</span>
        <span style="background-color: ${team.color};">${team.name}</span>
        <span>${team.points}</span>
    `;
    rankingListEl.appendChild(div);
  });
}

function initGame() {
    timeLeft = totalGameDuration;
    updateTimerDisplay();
    updateCourt();
    renderRanking();
}

function swapKing(challengerId) {
    const challengerIndex = teams.findIndex(team => team.id === challengerId);
    
    if (challengerIndex !== -1) {
        [teams[kingIndex], teams[challengerIndex]] = [teams[challengerIndex], teams[kingIndex]];
        
        kingIndex = teams.findIndex(team => team.id === teams[kingIndex].id);
        
        updateCourt();
        renderRanking();
    }
}

addPointsBtn.addEventListener("click", () => {
    if (teams.length === 0) return;
    teams[kingIndex].points++;
    renderRanking();
});

const timeValueEl = document.getElementById("timeValue");
const startTimerBtn = document.getElementById("startTimerBtn");

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');
    timeValueEl.textContent = `${minutes}:${seconds}`;
    
    if (timeLeft <= 30 && timeLeft > 0) {
        timeValueEl.style.color = '#ff9900';
    } else if (timeLeft === 0) {
        timeValueEl.style.color = '#cc0000';
    } else {
        timeValueEl.style.color = '#fff';
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

const nextRoundBtn = document.getElementById("nextRoundBtn");

function nextRound() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    
    teams.forEach(team => team.points = 0); 
    
    const teamInputs = teamsContainer.querySelectorAll(".team-input");
    
    if (teamInputs.length === 0) {
        teamsContainer.appendChild(createTeamInput(1));
        teamsContainer.appendChild(createTeamInput(2));
        teamsContainer.appendChild(createTeamInput(3));
    }
    
    gameDurationInput.value = 15;
    
    gameScreen.classList.remove("active");
    setupScreen.classList.add("active");
    
    startTimerBtn.textContent = '▶️';
    startTimerBtn.style.color = '#ff9900';
    timeValueEl.style.color = '#fff';
}

nextRoundBtn.addEventListener("click", nextRound);

document.addEventListener('DOMContentLoaded', () => {
    if (teamsContainer.children.length === 0) {
        teamsContainer.appendChild(createTeamInput(1));
        teamsContainer.appendChild(createTeamInput(2));
        teamsContainer.appendChild(createTeamInput(3));
    }
});