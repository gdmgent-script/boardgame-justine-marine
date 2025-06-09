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
        // Fetch the JSON file containing children's questions
        const response = await fetch(baseUrl + '/assets/questions/childrenQuestions.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
                    // Handle any errors that occurred during the fetch
        console.error('There was a problem with the loadChildrenQuestions fetch:', error);
    }
}

async function loadAdultsQuestions() {
    try {
                    // Fetch the JSON file containing adult questions
        const response = await fetch(baseUrl + '/assets/questions/adultQuestions.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
                    // Handle any errors that occurred during the fetch
        console.error('There was a problem with the loadAdultsQuestions fetch:', error);
    }
}

function loadPlayers() {
            // Load players from localStorage
    let spelers = JSON.parse(localStorage.getItem('spelers')) || [];

            // Load aantalSpelers from localStorage
    const aantalSpelers = JSON.parse(localStorage.getItem("aantalSpelers"))

            // Check if there are players, if not, return early
    if (spelers.count <= 0) {
        //TODO geen spelers gevonden
        return
    }

     // If there are less than 4 players, shuffle the order because every player has controls 2 continents
        // and we want to make sure that the player order is x y x y
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

 // Get a random question based on the player's age
    // and move to locig to show it on the screen
function questionLogic(typeOfNext) {
    if (isAdult(players[currentPlayerIndex].leeftijd))
        currentQuestion = getRandomQuestion(adultQuestions, typeOfNext)
    else
        currentQuestion = getRandomQuestion(childrensQuestions, typeOfNext)

    showQuestion(currentQuestion);
}

 // Check if the player is an adult based on their age
const isAdult = age => age >= 18;

 // Get a random question from the list of questions
function getRandomQuestion(questionList, typeOfNext) {
    const max = questionList.length - 1;
    const randomIndex = Math.floor(Math.random() * (max - 0) + 0);
    let question = questionList[randomIndex];
    // Remove question from the list if skipped
    if (typeOfNext == "next")
        questionList.splice(randomIndex, 1);

    return question;
}

// Show the question on the screen
    // Show the possible answers
    // Start the timer for the question
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

// Create an option button for the answers
function createOption(option) {
    const optionElement = document.createElement('button');
    optionElement.classList.add('antwoord');
    optionElement.textContent = option;
    optionElement.value = option;
    optionElement.addEventListener('click', selectAnswer);
    return optionElement
}

// Select an answer and highlight it
    // If the same answer is selected again, deselect it
    // If another answer is selected, highlight that one and deselect the previous one
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

// Start the timer for the question
    // Update the progress bar and move the elephant
    // When the time is up, check the answer
function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;

        const percentage = (timeLeft / duration) * 100;
        // Update progress bar width
        progressBar.style.width = `${percentage}%`;

        // Move the elephant
        elephant.style.right = `${100 - percentage}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            checkAnswer();
        }
    }, 1000);
}

// Stop the timer and reset the progress bar and elephant position
function stopTimer() {
    timeLeft = duration;
    progressBar.style.width = "100%"
    elephant.style.right = "0";
    clearInterval(timerInterval);
}

// Check the answer
    // Show the result and the correct answer
    // Show more information about the question
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

// Show more information about the question
function showMoreInfo() {

    document.getElementById('wistjedatje').innerHTML =
        `<span class="datje-heading">WIST JE DATJE:</span><br> ${currentQuestion.weetje}`;
    document.getElementById('wistjedatjeImg').src = currentQuestion.img;
}

// Show the next question and give the turn to the next player
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

    // Give the turn to the next player
function updateCurrentPlayer() {
    if (currentPlayerIndex + 1 <= players.length - 1)
        currentPlayerIndex += 1;
    else
        currentPlayerIndex = 0;
}

// Skip the question and give the turn to the next player
function skipQuestion() {
    selectedAnswer = "";
    updateCurrentPlayer();
    stopTimer();
    currentQuestion = [];
    questionLogic("skipped");
}

//Disable all answers so the player can't select them anymore
function disableAnswers() {
    var answers = document.querySelectorAll(".antwoord");
    answers.forEach(answer => {
        answer.disabled = true
    })
}

// Show the popup with the rules of the game
function openPopup() {
    popup.style.display = 'block';
    clearInterval(timerInterval);
}

// Close the popup and start the timer again
function closePopup() {
    popup.style.display = 'none';
    startTimer();
}

// Initialize the game by loading players and questions
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