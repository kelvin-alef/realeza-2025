let teams = [];
let kingIndex = 0;
let totalGameDuration = 0;
let timerInterval = null;
let timeLeft;
let tournamentHistory = [];
let useTimeTiebreaker = true;

const setupScreen = document.getElementById("setupScreen");
const gameScreen = document.getElementById("gameScreen");
const resultsScreen = document.getElementById("resultsScreen"); 
const teamsContainer = document.getElementById("teamsContainer");
const gameDurationInput = document.getElementById("gameDuration"); 
const useTimeTiebreakerInput = document.getElementById("useTimeTiebreaker");
const startTimerBtn = document.getElementById("startTimerBtn");
const addPointsBtn = document.getElementById("addPoints");
const timeValueEl = document.getElementById("timeValue");
const kingNameEl = document.getElementById("kingName");
const kingCardEl = document.getElementById("kingCard");
const challengerListEl = document.getElementById("challengerList");
const rankingListEl = document.getElementById("rankingList");
const showResultsBtn = document.getElementById("showResultsBtn");
const tournamentHistoryDisplayEl = document.getElementById("tournamentHistoryDisplay");
const startNewRoundBtn = document.getElementById("startNewRoundBtn");
const resetGameBtn = document.getElementById("resetGameBtn");
const downloadResultsBtn = document.getElementById("downloadResultsBtn");
const resultsContainerEl = document.getElementById("resultsContainer");

function createTeamInput(index) {
  const div = document.createElement("div");
  div.classList.add("team-input");
  div.innerHTML = `
    <input type="text" id="teamName${index}" placeholder="Nome do time" required>
    <input type="color" id="teamColor${index}" value="#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}">
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
  
  if (teams.length === 0 || confirm("Deseja iniciar um NOVO TORNEIO? Isso apagará o histórico de rodadas.")) {
      teams = [];
      tournamentHistory = []; 
  }

  const inputs = teamsContainer.querySelectorAll(".team-input");
  inputs.forEach((input, i) => {
    const name = input.querySelector('input[type="text"]').value || `Time ${i+1}`;
    const color = input.querySelector('input[type="color"]').value;
    
    let existingTeam = teams.find(t => t.id === i);
    if (!existingTeam) {
        teams.push({ name, color, points: 0, id: i, timeAsKing: 0 });
    } else {
        existingTeam.name = name;
        existingTeam.color = color;
        existingTeam.points = 0;
        existingTeam.timeAsKing = 0;
    }
  });
  
  teams.forEach((team, i) => team.id = i); 
  
  if (teams.length < 2) { alert("Adicione pelo menos 2 times!"); return; }

  useTimeTiebreaker = useTimeTiebreakerInput.checked; 
    
  totalGameDuration = parseInt(gameDurationInput.value) * 60; 
  timeLeft = totalGameDuration;
  
  kingIndex = Math.floor(Math.random() * teams.length);
  
  setupScreen.classList.remove("active");
  gameScreen.classList.add("active");
  renderTeams();
  renderRanking();
  updateTimerDisplay(); 
  
  document.getElementById("showResultsBtn").disabled = true; 
  addPointsBtn.disabled = true;
  
  startTimerBtn.textContent = '▶️';
  startTimerBtn.style.color = '#ff9900';
  timeValueEl.style.color = '#fff';
});

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

addPointsBtn.addEventListener("click", () => {
  if (!timerInterval) {
    alert("Inicie o cronômetro antes de adicionar pontos.");
    return;
  }
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
  const sorted = [...teams].sort((a,b) => {
      if (b.points !== a.points) {
          return b.points - a.points;
      }
      
      if (useTimeTiebreaker) {
          return b.timeAsKing - a.timeAsKing; 
      }
      return 0;
  });
  rankingListEl.innerHTML = "";

  sorted.forEach((team, index) => {
    const div = document.createElement("div");
    div.classList.add("rank-item");
    
    if (team.id === teams[kingIndex].id) {
        div.classList.add("king-rank");
    }
    
    div.dataset.teamId = team.id; 
    
    div.innerHTML = `
        <span>${index + 1}.</span>
        <span style="background-color: ${team.color};">${team.name}</span>
        <span>${team.points}</span>
    `;
    
    div.addEventListener('click', (e) => {
        const clickedTeamId = parseInt(e.currentTarget.dataset.teamId);
        const newKingIndex = teams.findIndex(t => t.id === clickedTeamId);
        if (newKingIndex !== -1) {
            swapKing(newKingIndex);
        }
    });

    rankingListEl.appendChild(div);
  });
}

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
        document.getElementById("showResultsBtn").disabled = false; 
    }
}

function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        startTimerBtn.textContent = '▶️'; 
        startTimerBtn.style.color = '#ff9900'; 
        addPointsBtn.disabled = true;
        return;
    }
    
    document.getElementById("showResultsBtn").disabled = true; 

    if (timeLeft <= 0) {
        timeLeft = totalGameDuration;
    }
    
    startTimerBtn.textContent = '⏹️'; 
    startTimerBtn.style.color = '#cc0000'; 
    addPointsBtn.disabled = false;

    timerInterval = setInterval(() => {
        timeLeft--;
        
        teams[kingIndex].timeAsKing++;
        
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            startTimerBtn.textContent = '▶️';
            startTimerBtn.style.color = '#ff9900'; 
            addPointsBtn.disabled = true;
        }
    }, 1000);
}

startTimerBtn.addEventListener("click", startTimer);
showResultsBtn.addEventListener("click", showResultsScreen);
downloadResultsBtn.addEventListener("click", downloadResultsAsImage);

function resolveTie(roundIndex, winnerId) {
    const round = tournamentHistory[parseInt(roundIndex)];
    round.manualWinnerId = parseInt(winnerId);
    
    renderTournamentHistory();
}

function showResultsScreen() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    
    const sortedFinal = [...teams].sort((a,b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        }
        
        if (useTimeTiebreaker) {
            return b.timeAsKing - a.timeAsKing; 
        }
        return 0;
    });
    
    let isTie = false;
    let tiedTeams = [];
    if (sortedFinal.length > 1) {
        const team1 = sortedFinal[0];
        const team2 = sortedFinal[1];
        
        const tiedByPoints = team1.points === team2.points;
        const tiedByTime = team1.timeAsKing === team2.timeAsKing;
        
        if (tiedByPoints && (!useTimeTiebreaker || tiedByTime)) {
            isTie = true;
            
            const topPoints = team1.points;
            const topTime = team1.timeAsKing;
            
            tiedTeams = sortedFinal.filter(team => {
                const matchPoints = team.points === topPoints;
                const matchTime = useTimeTiebreaker ? team.timeAsKing === topTime : true;
                return matchPoints && matchTime;
            });
        }
    }
    
    const winner = isTie ? null : sortedFinal[0];
    
    const roundResult = {
        roundNumber: tournamentHistory.length + 1,
        winnerName: winner ? winner.name.toUpperCase() : null,
        winnerId: winner ? winner.id : null,
        summary: sortedFinal.map(team => ({
            name: team.name,
            color: team.color,
            points: team.points,
            time: team.timeAsKing,
            id: team.id
        })),
        isTie: isTie, 
        tiedTeamIds: tiedTeams.map(t => t.id), 
        manualWinnerId: null 
    };
    
    tournamentHistory.push(roundResult);

    renderTournamentHistory();
    
    gameScreen.classList.remove("active");
    resultsScreen.classList.add("active");
}

function renderTournamentHistory() {
    const resultsTitleEl = resultsContainerEl.querySelector('h1'); 
    tournamentHistoryDisplayEl.innerHTML = '';
    
    const lastRound = tournamentHistory[tournamentHistory.length - 1];

    if (lastRound && lastRound.isTie && !lastRound.manualWinnerId) {
        resultsTitleEl.innerHTML = `🏆 EMPATE! Escolha quem venceu.`;
    } else {
        resultsTitleEl.innerHTML = `🏆 Histórico da Rodada`;
    }

    tournamentHistory.forEach((round, roundIndex) => {
        const roundDiv = document.createElement("div");
        roundDiv.classList.add("round-summary-card");
        
        const h2 = document.createElement("h2");
        let currentTitle = `ROUND ${round.roundNumber}: `;
        
        if (round.isTie && !round.manualWinnerId && roundIndex === tournamentHistory.length - 1) {
            currentTitle = `EM DESEMPATE...`;
        } else if (round.manualWinnerId) {
            const winner = round.summary.find(s => s.id === round.manualWinnerId);
            currentTitle += `${winner ? winner.name.toUpperCase() : 'VENCEDOR MANUAL'} VENCEU! 🥇`;
        } else if (round.winnerName) {
            currentTitle += `${round.winnerName} VENCEU! 🥇`;
        }
        
        h2.innerHTML = currentTitle;

        let tableHtml = `
            <div class="results-table">
                <div class="header">
                    <span>POSIÇÃO</span>
                    <span>TIME</span>
                    <span>PONTOS</span>
                    <span>TEMPO REALEZA</span>
                    <span>VENCEDOR</span>
                </div>
        `;

        round.summary.forEach((team, index) => {
            let rowClasses = "row";
            let actionHtml = '';
            
            const isLatestRound = roundIndex === tournamentHistory.length - 1;

            if (round.isTie && round.tiedTeamIds.includes(team.id)) {
                if (!round.manualWinnerId && isLatestRound) {
                    rowClasses += " tied-rank";
                    actionHtml = `<button class="tiebreaker-btn" data-round-index="${roundIndex}" data-winner-id="${team.id}">Vencedor</button>`;
                } else if (round.manualWinnerId === team.id) {
                    rowClasses += " final-winner-highlight";
                }
            } else if (!round.isTie && index === 0) {
                 rowClasses += " final-winner-highlight";
            }
            
            if (round.isTie && round.manualWinnerId && round.manualWinnerId === team.id && !isLatestRound) {
                 rowClasses += " final-winner-highlight";
            }

            tableHtml += `
                <div class="${rowClasses}">
                    <span>${index + 1}.</span>
                    <span style="background-color: ${team.color};">${team.name}</span>
                    <span>${team.points}</span>
                    <span>${formatTime(team.time)}</span>
                    <span>${actionHtml}</span>
                </div>
            `;
        });
        
        tableHtml += `</div><hr class="summary-separator">`;
        
        roundDiv.appendChild(h2);
        roundDiv.innerHTML += tableHtml;
        tournamentHistoryDisplayEl.appendChild(roundDiv);
    });

    if (lastRound && lastRound.isTie && !lastRound.manualWinnerId) {
        startNewRoundBtn.disabled = true;
        startNewRoundBtn.textContent = 'Selecione o vencedor do empate acima para continuar';
    } else if (lastRound) {
        const winnerId = lastRound.manualWinnerId || lastRound.winnerId;
        startNewRoundBtn.dataset.winnerId = winnerId;
        startNewRoundBtn.disabled = teams.length <= 2;
        startNewRoundBtn.textContent = teams.length <= 2 ? "Última Rodada Finalizada!" : "Iniciar Próximo Round";
    }
}

function downloadResultsAsImage() {
    const actions = document.querySelector('.results-actions');
    actions.style.display = 'none';
    resultsContainerEl.style.backgroundColor = '#1a2a3a'; 
    
    html2canvas(resultsContainerEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#1a2a3a'
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Torneio_Realeza_Rodada_${tournamentHistory.length}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        actions.style.display = 'flex';
        resultsContainerEl.style.backgroundColor = '';
        
        alert("Imagem dos resultados baixada com sucesso!");
    });
}


function startNewRound() {
    const lastRound = tournamentHistory[tournamentHistory.length - 1];
    const winnerId = parseInt(lastRound.manualWinnerId || lastRound.winnerId);
    
    const winnerName = teams.find(t => t.id === winnerId)?.name || "Vencedor";
    
    teams = teams.filter(team => team.id !== winnerId);
    
    if (teams.length < 2) {
        alert(`O time ${winnerName} foi removido. A próxima será a rodada final!`);
    }
    
    teams.forEach(team => {
        team.points = 0;
        team.timeAsKing = 0;
    });

    kingIndex = teams.length > 0 ? Math.floor(Math.random() * teams.length) : 0;
    timeLeft = totalGameDuration;

    resultsScreen.classList.remove("active");
    gameScreen.classList.add("active");
    renderTeams();
    renderRanking();
    updateTimerDisplay();
}

function resetGame() {
    teams = [];
    tournamentHistory = [];
    teamsContainer.innerHTML = ''; 
    
    teamsContainer.appendChild(createTeamInput(1));
    teamsContainer.appendChild(createTeamInput(2));
    teamsContainer.appendChild(createTeamInput(3));
    gameDurationInput.value = 15;
    useTimeTiebreakerInput.checked = true;
    
    resultsScreen.classList.remove("active");
    setupScreen.classList.add("active");
}

startNewRoundBtn.addEventListener("click", startNewRound);
resetGameBtn.addEventListener("click", resetGame);

tournamentHistoryDisplayEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('tiebreaker-btn')) {
        const roundIndex = e.target.dataset.roundIndex;
        const winnerId = e.target.dataset.winnerId;
        
        resolveTie(roundIndex, winnerId);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (teamsContainer.children.length === 0) {
        teamsContainer.appendChild(createTeamInput(1));
        teamsContainer.appendChild(createTeamInput(2));
        teamsContainer.appendChild(createTeamInput(3));
    }
});