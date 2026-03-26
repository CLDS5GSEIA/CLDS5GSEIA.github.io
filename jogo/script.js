const countries = [
  "Afeganistão","África do Sul","Albânia","Alemanha","Andorra","Angola","Antígua e Barbuda","Arábia Saudita",
  "Argélia","Argentina","Arménia","Austrália","Áustria","Azerbaijão","Bahamas","Bangladesh","Barbados","Barém",
  "Bélgica","Belize","Benim","Bielorrússia","Bolívia","Bósnia e Herzegovina","Botsuana","Brasil","Brunei",
  "Bulgária","Burquina Faso","Burundi","Butão","Cabo Verde","Camarões","Camboja","Canadá","Catar","Cazaquistão",
  "Chade","Chile","China","Chipre","Colômbia","Comores","Congo","Coreia do Norte","Coreia do Sul","Costa do Marfim",
  "Costa Rica","Croácia","Cuba","Dinamarca","Djibuti","Dominica","Egito","El Salvador","Emirados Árabes Unidos",
  "Equador","Eritreia","Eslováquia","Eslovénia","Espanha","Estados Unidos da América","Estónia","Essuatíni","Etiópia",
  "Fiji","Filipinas","Finlândia","França","Gabão","Gâmbia","Gana","Geórgia","Granada","Grécia","Guatemala","Guiné",
  "Guiné-Bissau","Guiné Equatorial","Guiana","Haiti","Honduras","Hungria","Iémen","Ilhas Marshall","Índia","Indonésia",
  "Inglaterra","Irão","Iraque","Irlanda","Islândia","Israel","Itália","Jamaica","Japão","Jordânia","Kiribati","Koweit",
  "Laos","Lesoto","Letónia","Líbano","Libéria","Líbia","Liechtenstein","Lituânia","Luxemburgo","Macedónia do Norte",
  "Madagáscar","Malásia","Malawi","Maldivas","Mali","Malta","Marrocos","Maurícia","Mauritânia","México","Mianmar",
  "Micronésia","Moçambique","Moldávia","Mónaco","Mongólia","Montenegro","Namíbia","Nauru","Nepal","Nicarágua","Níger",
  "Nigéria","Noruega","Nova Zelândia","Omã","Países Baixos","Palau","Palestina","Panamá","Papua-Nova Guiné",
  "Paquistão","Paraguai","Peru","Polónia","Portugal","Quénia","Quirguistão","Reino Unido","República Centro-Africana",
  "República Checa","República Dominicana","Roménia","Ruanda","Rússia","Samoa","São Cristóvão e Neves","São Marino",
  "São Tomé e Príncipe","São Vicente e Granadinas","Seicheles","Senegal","Serra Leoa","Sérvia","Singapura","Síria",
  "Somália","Sri Lanka","Sudão","Sudão do Sul","Suécia","Suíça","Suriname","Tailândia","Taiwan","Tajiquistão",
  "Tanzânia","Timor-Leste","Togo","Tonga","Trindade e Tobago","Tunísia","Turcomenistão","Turquia","Tuvalu","Ucrânia",
  "Uganda","Uruguai","Uzbequistão","Vanuatu","Vaticano","Venezuela","Vietname","Zâmbia","Zimbábue"
];

const questions = [
  {
    id: "F6",
    level: "easy",
    points: 10,
    text: "O que significa interculturalidade?",
    answers: [
      "A convivência e interação respeitosa entre culturas diferentes",
      "A substituição de uma cultura por outra",
      "A separação total entre grupos culturais",
      "A existência de uma única cultura dominante"
    ],
    correct: 0
  },
  {
    id: "F7",
    level: "easy",
    points: 10,
    text: "Num contexto intercultural, qual destas atitudes é mais adequada?",
    answers: [
      "Respeitar diferenças culturais e promover diálogo",
      "Ignorar todas as diferenças culturais",
      "Obrigar todos a seguir os mesmos costumes",
      "Evitar o contacto entre pessoas de origens diferentes"
    ],
    correct: 0
  },
  {
    id: "F8",
    level: "easy",
    points: 10,
    text: "A diversidade cultural pode ser entendida como:",
    answers: [
      "Um obstáculo ao convívio",
      "Uma riqueza que amplia perspetivas e aprendizagens",
      "Um problema a evitar",
      "Uma realidade sem importância social"
    ],
    correct: 1
  },
  {
    id: "M1",
    level: "medium",
    points: 20,
    text: "Qual destas personalidades está associada à luta contra o apartheid na África do Sul?",
    answers: [
      "Martin Luther King Jr.",
      "Nelson Mandela",
      "Amílcar Cabral",
      "Yasser Arafat"
    ],
    correct: 1
  },
  {
    id: "M2",
    level: "medium",
    points: 20,
    text: "Qual destas instituições está mais diretamente associada à proteção internacional dos direitos das crianças?",
    answers: [
      "UNESCO",
      "UNICEF",
      "ACNUR",
      "OIM"
    ],
    correct: 1
  },
  {
    id: "M4",
    level: "medium",
    points: 20,
    text: "Qual destas personalidades está mais associada à Argentina?",
    answers: [
      "Eva Perón",
      "Frida Kahlo",
      "Simón Bolívar",
      "Pablo Neruda"
    ],
    correct: 0
  },
  {
    id: "M7",
    level: "medium",
    points: 20,
    text: "Qual destes países tem a maior população?",
    answers: [
      "Marrocos",
      "Argentina",
      "Venezuela",
      "Portugal"
    ],
    correct: 1
  },
  {
    id: "M8",
    level: "medium",
    points: 20,
    text: "Qual destes países tem um Prémio Nobel da Literatura?",
    answers: [
      "Chile",
      "Venezuela",
      "Palestina",
      "Marrocos"
    ],
    correct: 0
  },
  {
    id: "D2",
    level: "hard",
    points: 30,
    text: "Qual destes países tem o islamismo como religião maioritária?",
    answers: [
      "Índia",
      "Bangladesh",
      "Nepal",
      "China"
    ],
    correct: 1
  },
  {
    id: "D3",
    level: "hard",
    points: 30,
    text: "Qual destes países tem mais línguas oficiais reconhecidas?",
    answers: [
      "Bélgica",
      "Suíça",
      "África do Sul",
      "Canadá"
    ],
    correct: 2
  },
  {
    id: "D7",
    level: "hard",
    points: 30,
    text: "Qual destas personalidades está corretamente associada ao respetivo país?",
    answers: [
      "Pablo Neruda — Chile",
      "Simón Bolívar — Argentina",
      "Amílcar Cabral — Marrocos",
      "Eva Perón — Venezuela"
    ],
    correct: 0
  },
  {
    id: "D9",
    level: "hard",
    points: 30,
    text: "Qual destas combinações está correta?",
    answers: [
      "Chile — Pablo Neruda — poesia",
      "Chile — Simón Bolívar — teatro",
      "Chile — Eva Perón — literatura",
      "Chile — Martin Luther King Jr. — ensaio político"
    ],
    correct: 0
  },
  {
    id: "MD13",
    level: "very_hard",
    points: 50,
    text: "Que país já venceu um Prémio Nobel da Medicina?",
    answers: [
      "Espanha",
      "Itália",
      "Portugal",
      "Grécia"
    ],
    correct: 2
  },
  {
    id: "MD14",
    level: "very_hard",
    points: 50,
    text: "Guerra e Paz, uma das mais importantes obras da literatura mundial, foi escrita por quem?",
    answers: [
      "Ernest Hemingway",
      "Fiódor Dostoiévski",
      "Victor Hugo",
      "Liev Tolstói"
    ],
    correct: 3
  },
  {
    id: "MD15",
    level: "very_hard",
    points: 50,
    text: "Qual destas personalidades está corretamente associada à Índia?",
    answers: [
      "Rabindranath Tagore",
      "Muhammad Iqbal",
      "Premchand",
      "Bankim Chandra Chattopadhyay"
    ],
    correct: 0
  }
];

const reserves = {
  easy: {
    id: "F9",
    level: "easy",
    points: 10,
    text: "Qual destas práticas favorece melhor a inclusão num ambiente intercultural?",
    answers: [
      "Valorizar diferentes línguas, tradições e experiências",
      "Escolher apenas uma referência cultural para todos",
      "Evitar qualquer tema cultural",
      "Separar grupos por nacionalidade"
    ],
    correct: 0
  },
  medium: {
    id: "M6",
    level: "medium",
    points: 20,
    text: "Qual destas personalidades está mais associada à Venezuela?",
    answers: [
      "Simón Bolívar",
      "José Martí",
      "Benito Juárez",
      "José de San Martín"
    ],
    correct: 0
  },
  hard: {
    id: "RD2",
    level: "hard",
    points: 30,
    text: "Qual destes países utiliza o dirham como moeda oficial?",
    answers: [
      "Marrocos",
      "Tunísia",
      "Argélia",
      "Egito"
    ],
    correct: 0
  },
  very_hard: {
    id: "MD6",
    level: "very_hard",
    points: 50,
    text: "Qual destes países tem um Prémio Nobel da Literatura?",
    answers: [
      "Portugal",
      "Argentina",
      "Venezuela",
      "Marrocos"
    ],
    correct: 0
  }
};

let currentQuestionIndex = 0;
let selectedAnswerIndex = null;
let startTimestamp = null;
let timerInterval = null;
let score = 0;
let answersLog = [];
let swapUsed = false;

const screens = {
  home: document.getElementById("screen-home"),
  register: document.getElementById("screen-register"),
  game: document.getElementById("screen-game"),
  result: document.getElementById("screen-result"),
  ranking: document.getElementById("screen-ranking")
};

const countriesDatalist = document.getElementById("countries");
const rulesBox = document.getElementById("rules-box");

const btnStart = document.getElementById("btn-start");
const btnRules = document.getElementById("btn-rules");
const btnBackHome = document.getElementById("btn-back-home");
const registerForm = document.getElementById("register-form");
const btnConfirmAnswer = document.getElementById("btn-confirm-answer");
const btnSwapQuestion = document.getElementById("btn-swap-question");
const btnViewRanking = document.getElementById("btn-view-ranking");
const btnRestart = document.getElementById("btn-restart");
const btnRankingHome = document.getElementById("btn-ranking-home");

const currentQuestionNumber = document.getElementById("current-question-number");
const questionNumberInside = document.getElementById("question-number-inside");
const progressFill = document.getElementById("progress-fill");
const timerDisplay = document.getElementById("timer-display");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const finalScore = document.getElementById("final-score");
const finalTime = document.getElementById("final-time");
const reviewContainer = document.getElementById("review-container");
const rankingBody = document.getElementById("ranking-body");
const top3 = document.getElementById("top3");

function showScreen(name) {
  Object.values(screens).forEach(screen => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getElapsedSeconds() {
  if (!startTimestamp) return 0;
  return Math.floor((Date.now() - startTimestamp) / 1000);
}

function updateTimer() {
  timerDisplay.textContent = formatTime(getElapsedSeconds());
}

function fillCountries() {
  countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country;
    countriesDatalist.appendChild(option);
  });
}

function renderQuestion() {
  const q = questions[currentQuestionIndex];
  selectedAnswerIndex = null;

  currentQuestionNumber.textContent = currentQuestionIndex + 1;
  questionNumberInside.textContent = currentQuestionIndex + 1;
  questionText.textContent = q.text;
  progressFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;

  answersContainer.innerHTML = "";
  q.answers.forEach((answer, index) => {
    const div = document.createElement("div");
    div.className = "answer-option";
    div.innerHTML = `<strong>${String.fromCharCode(65 + index)})</strong> ${answer}`;
    div.addEventListener("click", () => {
      document.querySelectorAll(".answer-option").forEach(el => el.classList.remove("selected"));
      div.classList.add("selected");
      selectedAnswerIndex = index;
    });
    answersContainer.appendChild(div);
  });
}

function getLevelKeyByQuestion(q) {
  return q.level;
}

function swapCurrentQuestion() {
  if (swapUsed) {
    alert("Já utilizaste a ajuda de mudar pergunta.");
    return;
  }

  const current = questions[currentQuestionIndex];
  const reserve = reserves[getLevelKeyByQuestion(current)];

  if (!reserve) return;

  questions[currentQuestionIndex] = { ...reserve };
  swapUsed = true;
  btnSwapQuestion.disabled = true;
  renderQuestion();
}

function submitAnswer() {
  if (selectedAnswerIndex === null) {
    alert("Seleciona uma resposta antes de confirmar.");
    return;
  }

  const q = questions[currentQuestionIndex];
  const isCorrect = selectedAnswerIndex === q.correct;
  if (isCorrect) score += q.points;

  answersLog.push({
    question: q.text,
    answers: q.answers,
    chosen: selectedAnswerIndex,
    correct: q.correct,
    isCorrect
  });

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    finishGame();
  }
}

function finishGame() {
  clearInterval(timerInterval);

  const elapsed = getElapsedSeconds();
  finalScore.textContent = score;
  finalTime.textContent = formatTime(elapsed);

  const participant = {
    fullName: document.getElementById("fullName").value.trim(),
    firstLastName: getFirstLastName(document.getElementById("fullName").value.trim()),
    score,
    time: elapsed,
    timestamp: Date.now()
  };

  saveParticipant(participant);
  renderReview();
  renderRanking();
  showScreen("result");
}

function getFirstLastName(fullName) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return fullName;
  return `${parts[0]} ${parts[parts.length - 1]}`;
}

function renderReview() {
  reviewContainer.innerHTML = "";

  answersLog.forEach((item, index) => {
    const wrap = document.createElement("div");
    wrap.className = "review-item";

    const correctAnswer = item.answers[item.correct];
    const chosenAnswer = item.answers[item.chosen];

    wrap.innerHTML = `
      <h4>Pergunta ${index + 1}</h4>
      <p><strong>${item.question}</strong></p>
      <p>A tua resposta: ${chosenAnswer}</p>
      <p class="review-status ${item.isCorrect ? "correct" : "incorrect"}">
        ${item.isCorrect ? "✔ Correta" : "✘ Incorreta"}
      </p>
      ${item.isCorrect ? "" : `<p><strong>Resposta correta:</strong> ${correctAnswer}</p>`}
    `;

    reviewContainer.appendChild(wrap);
  });
}

function saveParticipant(participant) {
  const data = JSON.parse(localStorage.getItem("quizRanking") || "[]");
  data.push(participant);

  data.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.time !== b.time) return a.time - b.time;
    return a.timestamp - b.timestamp;
  });

  localStorage.setItem("quizRanking", JSON.stringify(data));
}

function renderRanking() {
  const data = JSON.parse(localStorage.getItem("quizRanking") || "[]");

  top3.innerHTML = "";
  rankingBody.innerHTML = "";

  data.slice(0, 3).forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "top3-card";
    card.innerHTML = `
      <h3>${index + 1}º Lugar</h3>
      <p><strong>${item.firstLastName}</strong></p>
      <p>${item.score} pontos</p>
      <p>${formatTime(item.time)}</p>
    `;
    top3.appendChild(card);
  });

  data.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.firstLastName}</td>
      <td>${item.score}</td>
      <td>${formatTime(item.time)}</td>
    `;
    rankingBody.appendChild(tr);
  });
}

function resetGame() {
  currentQuestionIndex = 0;
  selectedAnswerIndex = null;
  startTimestamp = null;
  score = 0;
  answersLog = [];
  swapUsed = false;
  btnSwapQuestion.disabled = false;
  clearInterval(timerInterval);

  // repor pergunta original se houve swap
  questions[0] = questions[0];
}

btnRules.addEventListener("click", () => {
  rulesBox.classList.toggle("hidden");
});

btnStart.addEventListener("click", () => {
  showScreen("register");
});

btnBackHome.addEventListener("click", () => {
  showScreen("home");
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!document.getElementById("rgpdConsent").checked) {
    alert("É necessário aceitar o RGPD para continuar.");
    return;
  }

  resetGame();
  showScreen("game");
  startTimestamp = Date.now();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
  renderQuestion();
});

btnConfirmAnswer.addEventListener("click", submitAnswer);
btnSwapQuestion.addEventListener("click", swapCurrentQuestion);

btnViewRanking.addEventListener("click", () => {
  renderRanking();
  showScreen("ranking");
});

btnRestart.addEventListener("click", () => {
  showScreen("home");
});

btnRankingHome.addEventListener("click", () => {
  showScreen("home");
});

fillCountries();
renderRanking();
