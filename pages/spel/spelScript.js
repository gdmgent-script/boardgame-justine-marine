let childrensQuestions = [];
let adultQuestions = [];
let players = [];
let currentPlayerIndex = 0;
let currentQuestion = [];
let selectedAnswer = null;
let questionContainer = "";
let antwoordenDiv = "";
let answerContainer = "";
let showResult = "";
let correctie = "";
let timerInterval;
let duration = 30;
let timeLeft = duration;
let scores = [];
let popup = "";
let progressBar;
let elephant;


let baseUrl = window.location.origin;
if (!baseUrl.includes("127.0.0.1")) {
    baseUrl = baseUrl + "/boardgame-justine-marine"
}

async function loadChildrenQuestions() {
    try {
        // Haal het JSON-bestand op met de vragen voor kinderen (onder de 15 jaar)
        const response = await fetch(baseUrl + '/assets/questions/childrenQuestions.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        // Fout afhandelen die optrad tijdens het ophalen van de vragen
        console.error('There was a problem with the loadChildrenQuestions fetch:', error);
    }
}

async function loadAdultsQuestions() {
    try {
        // Haal het JSON-bestand op met de vragen voor volwassenen (boven de 15 jaar)
        const response = await fetch(baseUrl + '/assets/questions/adultQuestions.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        // Fout afhandelen die optrad tijdens het ophalen van de vragen
        console.error('There was a problem with the loadAdultsQuestions fetch:', error);
    }
}

function loadPlayers() {
    // Laad spelers uit localStorage
    let spelers = JSON.parse(localStorage.getItem('spelers')) || [];

    // Laad aantalSpelers uit localStorage
    const aantalSpelers = JSON.parse(localStorage.getItem("aantalSpelers"))

    // Controleer of er spelers zijn, zo niet, keer vroegtijdig terug
    if (spelers.count <= 0) {
        //TODO geen spelers gevonden
        return
    }

    // Als er minder dan 4 spelers zijn, herschik dan de volgorde zodat elke speler 2 continenten heeft
    // We willen ervoor zorgen dat de spelersvolgorde x y x y is
    if (aantalSpelers < 4) {
        let newOrder = [];

        for (let i = 0; i < spelers.length; i += 2) {
            newOrder.push(spelers[i])
        }

        for (let i = 1; i < spelers.length; i += 2) {
            newOrder.push(spelers[i])
        }

        spelers = newOrder;
    }

    console.log("spelers", spelers)
    return spelers;
}

// Haal een willekeurige vraag op gebaseerd op de leeftijd van de speler
// en toon deze op het scherm
function questionLogic(typeOfNext) {
    if (isAdult(players[currentPlayerIndex].leeftijd))
        currentQuestion = getRandomQuestion(adultQuestions, typeOfNext)
    else
        currentQuestion = getRandomQuestion(childrensQuestions, typeOfNext)

    showQuestion(currentQuestion);
}

// Controleer of de speler een volwassene is op basis van zijn/haar leeftijd
const isAdult = leeftijd => leeftijd >= 18;

// Haal een willekeurige vraag uit de lijst met vragen
function getRandomQuestion(questionList, typeOfNext) {
    const max = questionList.length - 1;
    const randomIndex = Math.floor(Math.random() * (max - 0) + 0);
    let question = questionList[randomIndex];
    // Verwijder de vraag uit de lijst als deze wordt overgeslagen
    if (typeOfNext == "next")
        questionList.splice(randomIndex, 1);

    return question;
}

// Toon de vraag op het scherm
// Toon de mogelijke antwoorden
// Start de timer voor de vraag
function showQuestion(question) {
    document.getElementById('spelerNaam').innerHTML = `<span class="vraag">Deze vraag is voor:<br> ${players[currentPlayerIndex].naam}  (${players[currentPlayerIndex].continent})</span>`;
    document.getElementById('vraagText').innerHTML = question.vraag;

    antwoordenDiv = document.getElementById('antwoorden');
    antwoordenDiv.innerHTML = "";
    question.opties.forEach(option => {

        let optionElement = createOption(option);

        antwoordenDiv.appendChild(optionElement);
    });
    startTimer(30);
}

// Maak een optieknop voor de antwoorden
function createOption(option) {
    const optionElement = document.createElement('button');
    optionElement.classList.add('antwoord');
    optionElement.textContent = option;
    optionElement.value = option;
    optionElement.addEventListener('click', selectAnswer);
    return optionElement
}

// Selecteer een antwoord en markeer het als geselecteerd
// Als hetzelfde antwoord opnieuw wordt geselecteerd, deselecteer het
// Als een ander antwoord wordt geselecteerd, markeer dat en deselecteer het vorige
function selectAnswer(e) {
    selectedAnswer = e.target.value
    for (const child of antwoordenDiv.children) {
        if (child.value == selectedAnswer && child.classList.contains("selected")) {
            child.classList.remove("selected");
            selectedAnswer = "";
        }
        else if (child.value == selectedAnswer)
            child.classList.add("selected")

        else
            child.classList.remove("selected")
    }
}

// Start de timer voor de vraag
// Update de voortgangsbalk en verplaats de olifant
// Wanneer de tijd om is, controleer het antwoord
function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;

        const percentage = (timeLeft / duration) * 100;
        // Werk de breedte van de voortgangsbalk bij
        progressBar.style.width = `${percentage}%`;

        // Verplaats de olifant
        elephant.style.right = `${100 - percentage}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            checkAnswer();
        }
    }, 1000);
}

// Stop de timer en reset de voortgangsbalk en olifantpositie
function stopTimer() {
    timeLeft = duration;
    progressBar.style.width = "100%"
    elephant.style.right = "0";
    clearInterval(timerInterval);
}

// Controleer het antwoord
// Toon het resultaat en het juiste antwoord
// Toon meer informatie over de vraag
function checkAnswer(e) {
    stopTimer();

    questionContainer.classList.remove("show");
    answerContainer.classList.add("show");

    if (!selectedAnswer) {
        showResult.classList.add("fout");
        showResult.textContent = `Geen antwoord geselecteerd`;
        correctie.textContent = `Correctie: ${currentQuestion.juist}`
    }
    else if (selectedAnswer == currentQuestion.juist) {
        showResult.classList.add("juist");
        showResult.innerHTML = `"${selectedAnswer}" <br> is juist`;
    }
    else {
        showResult.classList.add("fout");
        showResult.innerHTML = `"${selectedAnswer}" <br> is fout`;
        correctie.textContent = `Correctie: ${currentQuestion.juist}`
    }

    showMoreInfo();
}

// Toon meer informatie over de vraag
function showMoreInfo() {

    document.getElementById('wistjedatje').innerHTML =
        `<span class="datje-heading">WIST JE DATJE:</span><br> ${currentQuestion.weetje}`;
    document.getElementById('wistjedatjeImg').src = currentQuestion.img;
}

// Toon de volgende vraag en geef de beurt aan de volgende speler
function nextQuestion() {
    answerContainer.classList.remove("show");
    questionContainer.classList.add("show");
    showResult.classList.remove("fout");
    showResult.classList.remove("juist");
    correctie.textContent = "";

    updateCurrentPlayer();

    currentQuestion = [];
    questionLogic("next");
}

// Geef de beurt aan de volgende speler
function updateCurrentPlayer() {
    if (currentPlayerIndex + 1 <= players.length - 1)
        currentPlayerIndex += 1;
    else
        currentPlayerIndex = 0;
}

// Sla de vraag over en geef de beurt aan de volgende speler
function skipQuestion() {
    selectedAnswer = "";
    updateCurrentPlayer();
    stopTimer();
    currentQuestion = [];
    questionLogic("skipped");
}

//Schakel alle antwoorden uit zodat de speler ze niet meer kan selecteren
function disableAnswers() {
    var answers = document.querySelectorAll(".antwoord");
    answers.forEach(answer => {
        answer.disabled = true
    })
}

// Toon de popup met de spelregels
function openPopup() {
    popup.style.display = 'block';
    clearInterval(timerInterval);
}

// Sluit de popup en start de timer opnieuw
function closePopup() {
    popup.style.display = 'none';
    startTimer();
}

// Begin het spel door spelers en vragen te laden
async function init() {
    questionContainer = document.querySelector(".vraag-container");
    answerContainer = document.querySelector(".antwoord-container");
    showResult = document.getElementById("resultaat");
    correctie = document.getElementById("correctie");
    popup = document.getElementById('popup');
    progressBar = document.getElementById('progressBar');
    elephant = document.getElementById('elephant');

    players = loadPlayers();
    childrensQuestions = await loadChildrenQuestions();
    adultQuestions = await loadAdultsQuestions();

    if (childrensQuestions && adultQuestions && players) {
        questionLogic("next");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    init();
}); 