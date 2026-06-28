alert("Le fichier JavaScript est bien lu par le navigateur !");
// --- BANQUE DE DONNES DU QUIZ PAR NIVEAU ---
const quizDatabase = {
    college: {
        anglais: [
            { q: "Quelle est la traduction de 'Cat' ?", o: ["Chien", "Chat", "Oiseau", "Poisson" ], a: 1 },
            { q: "Choisissez le bon pronom:'... am a student.'", o: ["He", "She", "I", "They"], a: 2 }
        ],
        physique: [
           { q: "Quelle est l'unité de la masse ?", o:  ["Newton", "Litre", "Kilogramme", "Mètre"], a: 2 },
           { q: "Le mouvement d'un objet en ligne droite est dit :", o: ["Circulaire", "Rectiligne", "Curviligne", "Accéléré"], a: 1 }
        ],
        maths: [
            { q: "Calculez : 7 x 8", o: ["54", "56", "62", "48"], a: 1 },
            { q: "Quelle est la somme des angles d'un triangle ?", o: ["90°", "180°", "360°", "120°"], a: 2 }
        ],
        chimie: [
            { q: "Quel est le symbole chimique de l'eau ?", o: ["CO2", "O2", "H2O", "H"], a: 2 },
            { q: "Un PH égale à 7 indique une solution :", o: ["Acide", "Basique", "Neutre", "Pure"], a: 2 }
        ]
    },
    lycee: {
        anglais: [
            { q: "What is the past tense of the verb 'to undertake' ?", o: ["Undertook", "Undertaken", "Undertakes", "Undertaked" ], a: 0 },
            { q: "Identify the synonym of 'Stunning':", o: ["Ugly", "Beautiful", "Boring", "Heavy"], a: 1 }
        ], 
        physique: [
           { q: "Quelle est la valeur approximative de la vitesse de la lumière ?", o:  ["300 000 km/s", "150 000 km/s", "30 000 km/s", "3 000 km/s"], a: 0 },
           { q: "La relation fondamentale de la dynamique s'écrit :", o: ["F = m x v", "F = m x a", "Ec = 1/2 m v²", "P = m x g"], a: 1 }
        ],
        maths: [
            { q: "Quelle est la dérivée de la fonction f(x) = x² ?", o: ["x", "2", "2x", "x³"], a: 2 },
            { q: "Quelle est la valeur de cos(0) ?", o: ["0", "1", "-1", "0.5"], a: 1 }
        ],
        chimie: [
            { q: "Quelle est la formule de la concentration molaire ?", o: ["C = m / v", "C = n / v", "C = v / n", "C = n x v"], a: 1 },
            { q: "Une réaction chimique qui dégage de la chaleur est :", o: ["Endothermique", "Exothermique", "Athermique", "Lente"], a: 1 }
        ]
    }
};
// --- ETATS DE L'APPLICATION --- 
let selectedLevel = "college"; // Par défaut
let currentMatiere = "";
let questionsMelangees = [];
let currentQuestionIndex = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 15;
let classement = JSON.parse(localStorage.getItem('quizLeaderboard')) || [];
// Gérer le changement de niveau (Boutons UI)
function changeLevel(level) {
    selectedLevel = level;
    const matieres = ['anglais', 'physique', 'maths', 'chimie'];
    matieres.forEach(m => {
        const btn = document.getElementById('btn-' + m);
        if (btn) {
            btn.removeAttribute('disabled');
            btn.style.opacity = "1";
            btn.style.pointerEvents = "auto";
            btn.onclick = () => startQuizForMatiere(m);
        }
    });
}
function startQuiz(matiere) {
    currentMatiere = matiere;
    score = 0;
    currentQuestionIndex = 0;
    // Récupère les questions de la matière sélectionnée
    const questionsMatiere = quizDatabase[selectedLevel][matiere];
    if (!questionsMatiere || questionsMatiere.lenght === 0) {
        console.error("Aucune question trouvée pour cette matière : " + matiere);
        return;
    }
    // Mélange les questions
    questionsMelangees =  [...questionsMatiere].sort(() => Math.random() - 0.5);
    // Changement d'écran de l'interface
      document.getElementById('chrono-badge').classList.remove('hidden');
    document.getElementById('screen-welcome').classList.add('hidden');
    document.getElementById('screen-quiz').classList.remove('hidden');
    showQuestion();
} 
// AFFICHAGE DE LA QUESTION EN COURS         
function showQuestion() {
    clearInterval(timerInterval);
    if (currentQuestionIndex >= questionsMelangees.length) {
        endQuiz();
        return;
    } 
    let currentQuestion = questionsMelangees[currentQuestionIndex];
    document.getElementById('question-text').textContent = currentQuestion.q;
    let progressPercent = ((currentQuestionIndex + 1) / questionsMelangees.length) * 100;
    document.getElementById('progress-bar').style.width =`${progressPercent}%`;
    const container = document.getElementById('options-container');
    container.innerHTML ="";
    currentQuestion.o.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerText = option;
        button.className = "option-item correct";
        button.onclick = function()  {
            selectAnswer(button, index, currentQuestion.a);
    };    
        container.appendChild(button);
    });
    startTimer();
}
function selectAnswer(button, indexSelectionne, indexCorrect) {
    clearInterval(timerInterval);
    const container = document.getElementById('options-container');
    const boutons = container.getElementsByTagName('button');
    for (let b of boutons) {
         b.disabled = true; 
    }    
    if (indexSelectionne === indexCorrect) {
        button.style.background = "#22c55e";
        score++;
    } else { 
        button.style.background = "#ef4444";
        if (boutons[indexCorrect]) { 
           boutons[indexCorrect].style.background = "#22c55e"; 
        }   
    }
    // Passage à la question suivante après 1,5 seconde              
    setTimeout(() => {
        currentQuestionIndex++;
            showQuestion();
    }, 1500);
}
// Gérer le chronomètre
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }    
    timeLeft = 15;
    const timerSpan = document.getElementById('timer');
    const badge = document.getElementById('chrono-badge');
    timerSpan.textContent = timeLeft;
    badge.className = "bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-mono";
    timerInterval = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = timeLeft;
        if (timeLeft <= 5 && timeLeft > 0) {
            badge.className = "bg-rose-500 text-white px-4 py-2 rounded-full font-mono"; 
        }
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            currentQuestionIndex++;
            if (currentQuestionIndex < questionsMelangees.length) {
                showQuestion();
            } else  {
                showResults();
            }
        }
    }, 1000);
}
function showResults() {
    document.getElementById('chrono-badge').classList.add('hidden'); 
    document.getElementById('screen-quiz').classList.add('hidden');
    document.getElementById('screen-results').classList.remove('hidden');
    document.getElementById('final-score').textContent = `${score}/${questionsMelangees.length}`;
    document.getElementById('leaderboard-subjet').textContent = `- ${currentMatiere.toUpperCase()} (${selectedLevel.toUpperCase()})`;
    displayLeaderboard();
}
function submitScore() {
    const input = document.getElementById('username');
    const username = input.value.trim() || "Joueur Anonyme";
    classement.push({ name: username, score: score, subject: `${currentMatiere}-${selectedLevel}` });
    classement.sort((a, b) => b.score - a.score);
    localStorage.setItem('quizLeaderboard', JSON.stringify(classement));
    document.getElementById('score-submission').classList.add('hidden');
    displayLeaderboard();
}
function displayLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = "";
    const scoresFiltres = classement.filter(item => item.subject === `${currentMatiere}-${selectedLevel}`).slice(0, 5);
    if (scoresFiltres.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-slate-400 italic">Aucun score enregistré</td></tr>`;
        return;
    }
    scoresFilters.forEach((player, index) => {
        const row = document.createElement('tr');
        row.className = "border-b border-slate-100 last:border-none";
        row.innerHTML = `
            <td class="p-3 font-bold text-indigo-600">#${index + 1}</td>
            <td class="p-3 font-medium text-slate-700">${player.name}</td>;
            <td class="p-3 text-right font-bold text-slate-900">${player.score} pts</td>
        `;
        tbody.appendChild(row);
    });
}
// Fin du quiz et affichage des scores
function endQuiz() {
    clearInterval(timerInterval); 
    document.getElementById('chrono-badge').classList.add('hidden'); 
    document.getElementById('screen-quiz').classList.add('hidden');
    const welcomeScreen = document.getElementById('screen-welcome');
    welcomeScreen.classList.remove('hidden');
    welcomeScreen.innerHTML = `
       <div style="text-align: center; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 12px;">
            <h2 style="font-size: 2rem; color: #fff; margin-bottom: 15px;"> Quiz Terminé !</h2>
            <p style="font-size: 1.3rem; color: #94a3b8; margin-bottom: 25px;">
                Ton score final est de : <strong style="color: #22c55e; font-size: 1.8rem;">${score}</strong> / ${questionsMelangees.length}
            </p>
            <button onclick="location.reload()" class="option-item correct" style="max-width: 220px; margin: 0 auto; display: block;">
                   Recommencer
            </button>
        </div>
    `;
} 
function goToHome() {
    document.getElementById('screen-results').classList.add('hidden');
    document.getElementById('screen-welcome').classList.remove('hidden');
    selectedLevel = "";
    document.getElementById('btn-college').style.background = "";
    document.getElementById('btn-lycee').style.background = "";
    ['anglais', 'physique', 'maths', 'chimie'].forEach(m => {
        const btn =document.getElementById('btn-' + m);
        if (btn) {
            btn.setAttribute('disabled', 'true');
            btn.style.opacity = "0.4";
            btn.style.pointerEvents = "none";
        }
    });
}
// ECOUTEURS D'EVENEMENTS (AU CLIC)
// 1. Gestion des clics sur les boutons de Niveau (Collège / Lycée)
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('btn-college').addEventListener('click', () => {
        changeLevel('college');
    });
    document.getElementById('btn-lycee').addEventListener('click', () => {
        changeLevel('lycee');
    });
// 2. Gestion des clics sur les boutons devMatières
// On écoute le clic sur chaque matière pour lancer le quiz correspondant
    document.getElementById('btn-anglais').addEventListener('click', () => {
        startQuiz('anglais');
    });
    document.getElementById('btn-physique').addEventListener('click', () => {
        startQuiz('physique');
    });
    document.getElementById('btn-maths').addEventListener('click', () => {
        startQuiz('maths');
    });
    document.getElementById('btn-chimie').addEventListener('click', () => {
        startQuiz('chimie'); 
    });
});