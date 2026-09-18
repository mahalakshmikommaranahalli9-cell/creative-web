let currentLevel = 0;
let board = [];
let moves = 0;
let seconds = 0;
let timerInterval = null;

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const completeScreen = document.getElementById("completeScreen");
const finalScreen = document.getElementById("finalScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const hintBtn = document.getElementById("hintBtn");
const nextBtn = document.getElementById("nextBtn");
const playAgainBtn = document.getElementById("playAgainBtn");

const boardElement = document.getElementById("board");
const levelName = document.getElementById("levelName");
const movesElement = document.getElementById("moves");
const timerElement = document.getElementById("timer");
const messageElement = document.getElementById("message");

const finalMoves = document.getElementById("finalMoves");
const finalTime = document.getElementById("finalTime");


/* =========================
   SCREEN CONTROL
========================= */

function showScreen(screen) {
    document.querySelectorAll(".screen").forEach(item => {
        item.classList.remove("active");
    });

    screen.classList.add("active");
}


/* =========================
   START GAME
========================= */

startBtn.addEventListener("click", () => {
    currentLevel = 0;
    startLevel();
});


function startLevel() {
    showScreen(gameScreen);

    loadLevel();
    startTimer();
}


/* =========================
   LOAD LEVEL
========================= */

function loadLevel() {

    const level = levels[currentLevel];

    if (!level) {
        showFinal();
        return;
    }

    levelName.textContent = level.name;

    moves = 0;
    movesElement.textContent = "0";

    messageElement.textContent =
        "Find an arrow with a clear path.";

    board = level.arrows.map(direction => ({
        direction: direction,
        removed: false,
        empty: direction === ""
    }));

    const expectedCells =
        level.size * level.size;

    if (board.length !== expectedCells) {

        console.error(
            "LEVEL ERROR:",
            level.name,
            "Expected:",
            expectedCells,
            "Got:",
            board.length
        );

        messageElement.textContent =
            "LEVEL DATA ERROR";

        return;
    }

    renderBoard();
}


/* =========================
   DRAW BOARD
========================= */

function renderBoard() {

    const level = levels[currentLevel];

    boardElement.innerHTML = "";

    boardElement.style.display = "grid";

    boardElement.style.gridTemplateColumns =
        `repeat(${level.size}, minmax(0, 1fr))`;

    boardElement.style.gridTemplateRows =
        `repeat(${level.size}, minmax(0, 1fr))`;


    board.forEach((cell, index) => {

        const cellElement =
            document.createElement("div");

        cellElement.className = "cell";


        /* Empty cell */

        if (cell.empty) {

            cellElement.classList.add("empty");

            boardElement.appendChild(cellElement);

            return;
        }


        /* Removed arrow */

        if (cell.removed) {

            cellElement.classList.add("removed");

            boardElement.appendChild(cellElement);

            return;
        }


        /* Arrow */

        const arrow =
            document.createElement("div");

        arrow.className = "arrow";

        arrow.textContent =
            cell.direction;

        cellElement.appendChild(arrow);


        /* Check if arrow can escape */

        if (canEscape(index)) {

            cellElement.classList.add("escape");

        } else {

            cellElement.classList.add("blocked");
        }


        /* Click */

        cellElement.addEventListener(
            "click",
            () => moveArrow(index, cellElement)
        );


        boardElement.appendChild(cellElement);
    });
}


/* =========================
   POSITION
========================= */

function getPosition(index) {

    const size =
        levels[currentLevel].size;

    return {
        row: Math.floor(index / size),
        col: index % size
    };
}


/* =========================
   NEXT CELL
========================= */

function getNextIndex(index, direction) {

    const size =
        levels[currentLevel].size;

    const position =
        getPosition(index);

    let row = position.row;
    let col = position.col;


    if (direction === "↑") {
        row--;
    }

    if (direction === "↓") {
        row++;
    }

    if (direction === "←") {
        col--;
    }

    if (direction === "→") {
        col++;
    }


    /* Outside board */

    if (
        row < 0 ||
        row >= size ||
        col < 0 ||
        col >= size
    ) {
        return -1;
    }


    return row * size + col;
}


/* =========================
   ESCAPE CHECK
========================= */

function canEscape(index) {

    const cell = board[index];

    if (
        !cell ||
        cell.empty ||
        cell.removed
    ) {
        return false;
    }


    let currentIndex = index;

    const visited = new Set();


    while (true) {

        /* Prevent infinite loops */

        if (visited.has(currentIndex)) {
            return false;
        }

        visited.add(currentIndex);


        const nextIndex =
            getNextIndex(
                currentIndex,
                board[currentIndex].direction
            );


        /* Arrow reaches outside */

        if (nextIndex === -1) {
            return true;
        }


        const nextCell =
            board[nextIndex];


        /* Empty or removed cell */

        if (
            nextCell.empty ||
            nextCell.removed
        ) {

            currentIndex = nextIndex;

            continue;
        }


        /* Another active arrow blocks it */

        return false;
    }
}


/* =========================
   MOVE ARROW
========================= */

function moveArrow(index, element) {

    const cell = board[index];

    if (
        !cell ||
        cell.empty ||
        cell.removed
    ) {
        return;
    }


    /* Blocked arrow */

    if (!canEscape(index)) {

        messageElement.textContent =
            "PATH BLOCKED — clear another arrow first.";


        element.animate(
            [
                {
                    transform: "translateX(0)"
                },
                {
                    transform: "translateX(-6px)"
                },
                {
                    transform: "translateX(6px)"
                },
                {
                    transform: "translateX(0)"
                }
            ],
            {
                duration: 250
            }
        );

        return;
    }


    /* Remove arrow */

    cell.removed = true;

    moves++;

    movesElement.textContent =
        moves;

    messageElement.textContent =
        "PATH CLEAR ✓";

    element.classList.add(
        "removing"
    );


    setTimeout(() => {

        renderBoard();

        checkComplete();

    }, 250);
}


/* =========================
   CHECK LEVEL COMPLETE
========================= */

function checkComplete() {

    const remaining =
        board.filter(cell =>
            !cell.empty &&
            !cell.removed
        );


    if (remaining.length > 0) {
        return;
    }


    stopTimer();


    finalMoves.textContent =
        moves;

    finalTime.textContent =
        formatTime(seconds);


    setTimeout(() => {

        showLevelComplete();

    }, 400);
}


/* =========================
   LEVEL COMPLETE SCREEN
========================= */

function showLevelComplete() {

    const level =
        levels[currentLevel];

    showScreen(completeScreen);


    const letter =
        document.getElementById(
            "completedLetter"
        );


    if (letter) {

        letter.textContent =
            level.letter || "";

        letter.style.display =
            level.letter ? "block" : "none";
    }


    if (
        currentLevel ===
        levels.length - 1
    ) {

        nextBtn.textContent =
            "FINISH →";

    } else {

        nextBtn.textContent =
            "NEXT LEVEL →";
    }
}


/* =========================
   NEXT LEVEL
========================= */

nextBtn.addEventListener(
    "click",
    () => {

        currentLevel++;


        if (
            currentLevel >=
            levels.length
        ) {

            showFinal();

            return;
        }


        startLevel();
    }
);


/* =========================
   FINAL SCREEN
========================= */

function showFinal() {

    stopTimer();

    showScreen(finalScreen);


    let reveal =
        document.getElementById(
            "nameReveal"
        );


    if (!reveal) {

        reveal =
            document.createElement(
                "div"
            );

        reveal.id =
            "nameReveal";

        reveal.className =
            "name-reveal";


        reveal.innerHTML = `

            <div class="name-small">
                THE ARROWS REVEALED
            </div>

            <div class="name-main">
                PRUTHVIRAJ
            </div>

            <div class="name-sub">
                CODE BLASTER
            </div>

        `;


        const content =
            finalScreen.querySelector(
                ".final-content"
            );


        content.insertBefore(
            reveal,
            content.firstChild
        );
    }
}


/* =========================
   PLAY AGAIN
========================= */

playAgainBtn.addEventListener(
    "click",
    () => {

        currentLevel = 0;

        startLevel();
    }
);


/* =========================
   RESTART
========================= */

restartBtn.addEventListener(
    "click",
    () => {

        stopTimer();

        loadLevel();

        startTimer();
    }
);


/* =========================
   HINT
========================= */

hintBtn.addEventListener(
    "click",
    () => {

        const available =
            board
                .map((cell, index) => ({
                    cell,
                    index
                }))
                .filter(item =>
                    !item.cell.empty &&
                    !item.cell.removed &&
                    canEscape(item.index)
                );


        if (available.length === 0) {

            messageElement.textContent =
                "No clear path.";

            return;
        }


        const chosen =
            available[
                Math.floor(
                    Math.random() *
                    available.length
                )
            ];


        const cells =
            boardElement.querySelectorAll(
                ".cell"
            );


        const target =
            cells[chosen.index];


        if (target) {

            target.classList.add(
                "hint-pulse"
            );
        }


        messageElement.textContent =
            "HINT — Try the highlighted arrow.";
    }
);


/* =========================
   TIMER
========================= */

function startTimer() {

    stopTimer();

    seconds = 0;

    timerElement.textContent =
        "00:00";


    timerInterval =
        setInterval(() => {

            seconds++;

            timerElement.textContent =
                formatTime(seconds);

        }, 1000);
}


function stopTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval = null;
    }
}


function formatTime(totalSeconds) {

    const minutes =
        Math.floor(
            totalSeconds / 60
        )
            .toString()
            .padStart(2, "0");


    const secondsPart =
        (
            totalSeconds % 60
        )
            .toString()
            .padStart(2, "0");


    return `${minutes}:${secondsPart}`;
}


/* =========================
   SERVICE WORKER
========================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register("./sw.js")
                .catch(error => {

                    console.log(
                        "Service worker error:",
                        error
                    );

                });

        }
    );
}


/* =========================
   DEBUG
========================= */

console.log(
    "ARROW//19.09 loaded:",
    levels.length,
    "levels"
);
