// ======================================================
// TRIPLE HIT ACADEMY
// Smart Football Group Distribution System
// ======================================================

const MAX_PLAYERS = 24;
const MAX_GROUP_SIZE = 4;
const DISTRIBUTION_COUNT = 4;

// ------------------------------------------------------
// State
// ------------------------------------------------------

let players = [];
let distributions = [];
let undoStack = [];
let draggedPlayer = null;
let selectedPlayerForSwap = null;

// ------------------------------------------------------
// DOM
// ------------------------------------------------------

const playerForm = document.getElementById("playerForm");
const playerName = document.getElementById("playerName");
const playerLevel = document.getElementById("playerLevel");
const playersList = document.getElementById("playersList");
const playerCounter = document.getElementById("playerCounter");

const generateBtn = document.getElementById("generateBtn");
const demoBtn = document.getElementById("demoBtn");
const clearBtn = document.getElementById("clearBtn");
const undoBtn = document.getElementById("undoBtn");
const printBtn = document.getElementById("printBtn");

const distributionsBox = document.getElementById("distributions");
const statusBox = document.getElementById("status");

// ======================================================
// CHECK HTML
// ======================================================

function checkElements() {
    const elements = {
        playerForm,
        playerName,
        playerLevel,
        playersList,
        playerCounter,
        generateBtn,
        demoBtn,
        clearBtn,
        undoBtn,
        printBtn,
        distributionsBox,
        statusBox
    };

    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Missing HTML element: ${name}`);
            return false;
        }
    }

    return true;
}

// ======================================================
// BASIC HELPERS
// ======================================================

function createId() {
    return Date.now().toString(36) +
        Math.random().toString(36).substring(2);
}

function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[character];
    });
}

function shuffle(array) {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] =
            [result[j], result[i]];
    }

    return result;
}

function setStatus(message, type = "") {
    if (!statusBox) return;

    statusBox.textContent = message;
    statusBox.className = "status";

    if (type) {
        statusBox.classList.add(type);
    }
}

// ======================================================
// DYNAMIC GROUP SYSTEM
// ======================================================

function getGroupCount(playerCount) {
    return Math.ceil(playerCount / MAX_GROUP_SIZE);
}

function getGroupSizes(playerCount) {

    const groupCount = getGroupCount(playerCount);

    const baseSize =
        Math.floor(playerCount / groupCount);

    const extraPlayers =
        playerCount % groupCount;

    const sizes = [];

    for (let i = 0; i < groupCount; i++) {

        sizes.push(
            baseSize +
            (i < extraPlayers ? 1 : 0)
        );
    }

    return sizes;
}

// ======================================================
// EDIT PLAYER FUNCTIONALITY
// ======================================================

function editPlayer(id) {

    const player = players.find(p => p.id === id);

    if (!player) return;

    const newName =
        prompt("Edit Player Name:", player.name);

    if (newName === null) return;

    const trimmedName = newName.trim();

    if (!trimmedName) {

        setStatus(
            "Player name cannot be empty.",
            "error"
        );

        return;
    }

    const newLevelStr =
        prompt(
            "Edit Player Level (1, 2, 3, or 4):",
            player.level
        );

    if (newLevelStr === null) return;

    const newLevel = Number(newLevelStr);

    if (![1, 2, 3, 4].includes(newLevel)) {

        setStatus(
            "Invalid level. Please enter 1, 2, 3, or 4.",
            "error"
        );

        return;
    }

    player.name = trimmedName;
    player.level = newLevel;

    distributions = [];
    undoStack = [];
    selectedPlayerForSwap = null;

    if (undoBtn) {
        undoBtn.disabled = true;
    }

    renderPlayers();
    renderDistributions();

    setStatus(
        `Updated player details for "${trimmedName}". Please regenerate distributions.`,
        "warning"
    );
}

// ======================================================
// PLAYER RENDER & MANAGERS
// ======================================================

function renderPlayers() {

    if (!playerCounter || !playersList) return;

    playerCounter.textContent =
        `${players.length} / ${MAX_PLAYERS}`;

    playersList.innerHTML = "";

    if (players.length === 0) {

        playersList.innerHTML =
            `<p class="empty">No players added yet.</p>`;

        return;
    }

    players.forEach((player, index) => {

        const div = document.createElement("div");

        div.className = "player";

        div.innerHTML = `
            <div>
                <div class="player-name">
                    ${index + 1}. ${escapeHTML(player.name)}
                </div>

                <div class="player-level">
                    Level ${player.level}
                </div>
            </div>

            <div class="player-actions">

                <button
                    type="button"
                    class="edit"
                    data-id="${player.id}">
                    Edit
                </button>

                <button
                    type="button"
                    class="remove"
                    data-id="${player.id}">
                    Remove
                </button>

            </div>
        `;

        div.querySelector(".edit")
            .addEventListener("click", function () {

                editPlayer(player.id);

            });

        div.querySelector(".remove")
            .addEventListener("click", function () {

                players = players.filter(
                    p => p.id !== player.id
                );

                distributions = [];
                undoStack = [];
                selectedPlayerForSwap = null;

                if (undoBtn) {
                    undoBtn.disabled = true;
                }

                renderPlayers();
                renderDistributions();

                setStatus(
                    "Player removed. Generate the distributions again.",
                    "warning"
                );

            });

        playersList.appendChild(div);
    });
}

// ======================================================
// ADD PLAYER
// ======================================================

if (playerForm) {

    playerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const name =
                playerName.value.trim();

            const level =
                Number(playerLevel.value);

            if (!name) {

                setStatus(
                    "Please enter the player name.",
                    "error"
                );

                return;
            }

            if (![1, 2, 3, 4].includes(level)) {

                setStatus(
                    "Please select a valid level.",
                    "error"
                );

                return;
            }

            if (players.length >= MAX_PLAYERS) {

                setStatus(
                    "You already have 24 players.",
                    "error"
                );

                return;
            }

            players.push({
                id: createId(),
                name,
                level
            });

            playerName.value = "";
            playerLevel.value = "";

            renderPlayers();

            setStatus(
                `${players.length} player(s) added.`,
                "success"
            );
        }
    );
}

// ======================================================
// DEMO BUTTON
// ======================================================

if (demoBtn) {

    demoBtn.addEventListener(
        "click",
        function () {

            const names = [

                "Ahmad",
                "Omar",
                "Yazan",
                "Laith",
                "Zaid",
                "Hamza",

                "Sami",
                "Adam",
                "Ali",
                "Kareem",
                "Tareq",
                "Mohammad",

                "Basil",
                "Anas",
                "Fadi",
                "Rami",
                "Ayman",
                "Nour",

                "Yousef",
                "Malek",
                "Ibrahim",
                "Hadi",
                "Saeed",
                "Qais"
            ];

            players = names.map(
                (name, index) => ({

                    id: createId(),

                    name: name,

                    level:
                        Math.floor(index / 6) + 1
                })
            );

            distributions = [];
            undoStack = [];
            selectedPlayerForSwap = null;

            if (undoBtn) {
                undoBtn.disabled = true;
            }

            renderPlayers();
            renderDistributions();

            setStatus(
                "24 demo players loaded successfully.",
                "success"
            );
        }
    );
}

// ======================================================
// SCORE & CONSTRAINTS CHECKERS
// ======================================================

function getGroupScore(group) {

    return group.reduce(
        (total, player) =>
            total + Number(player.level),
        0
    );
}

function getOverlap(groupA, groupB) {

    const ids =
        new Set(
            groupA.map(player => player.id)
        );

    return groupB.filter(
        player => ids.has(player.id)
    ).length;
}

function isValidGroup(
    group,
    previousDistributions
) {

    // المجموعة بين 2 و 4 لاعبين
    if (
        group.length < 2 ||
        group.length > MAX_GROUP_SIZE
    ) {
        return false;
    }

    for (
        const distribution
        of previousDistributions
    ) {

        for (
            const oldGroup
            of distribution
        ) {

            if (
                getOverlap(group, oldGroup) > 2
            ) {

                return false;
            }
        }
    }

    return true;
}

function getLevelDifference(group) {

    if (group.length <= 1) {
        return 0;
    }

    const levels =
        group.map(
            p => Number(p.level)
        );

    return (
        Math.max(...levels) -
        Math.min(...levels)
    );
}

function isLevelCompatible(group, mode) {

    if (group.length === 0) {
        return true;
    }

    const difference =
        getLevelDifference(group);

    if (mode === 1 || mode === 2) {

        return difference <= 1;
    }

    return difference <= 2;
}

// ======================================================
// GENERATION ALGORITHM
// ======================================================

function generateDistribution(
    previousDistributions,
    mode = 1
) {

    const ATTEMPTS = 600;

    const TRY_COUNT =
        mode <= 2 ? 80 : 120;

    const groupSizes =
        getGroupSizes(players.length);

    const groupCount =
        groupSizes.length;

    let bestDistribution = null;

    let bestPenalty = Infinity;

    for (
        let attempt = 0;
        attempt < ATTEMPTS;
        attempt++
    ) {

        let remaining =
            shuffle(players);

        if (
            mode === 1 ||
            mode === 2
        ) {

            remaining.sort(
                (a, b) =>
                    Number(b.level) -
                    Number(a.level)
            );
        }

        const distribution = [];

        let failed = false;

        // ----------------------------------------------
        // CREATE GROUPS
        // ----------------------------------------------

        for (
            let groupIndex = 0;
            groupIndex < groupCount;
            groupIndex++
        ) {

            const requiredSize =
                groupSizes[groupIndex];

            let bestGroup = null;

            let bestGroupPenalty =
                Infinity;

            // ------------------------------------------
            // TRY DIFFERENT GROUP COMBINATIONS
            // ------------------------------------------

            for (
                let t = 0;
                t < TRY_COUNT;
                t++
            ) {

                let candidate = [];

                if (
                    mode === 1 ||
                    mode === 2
                ) {

                    const anchor =
                        remaining[0];

                    if (!anchor) {
                        continue;
                    }

                    const available =
                        remaining.filter(
                            p =>
                                Math.abs(
                                    Number(p.level) -
                                    Number(anchor.level)
                                ) <= 1
                        );

                    if (
                        available.length <
                        requiredSize
                    ) {

                        continue;
                    }

                    candidate =
                        shuffle(available)
                            .slice(
                                0,
                                requiredSize
                            );

                } else {

                    candidate =
                        shuffle(remaining)
                            .slice(
                                0,
                                requiredSize
                            );
                }

                if (
                    candidate.length ===
                    requiredSize &&

                    isLevelCompatible(
                        candidate,
                        mode
                    ) &&

                    isValidGroup(
                        candidate,
                        previousDistributions
                    )
                ) {

                    const penalty =
                        getLevelDifference(
                            candidate
                        ) * 100;

                    if (
                        penalty <
                        bestGroupPenalty
                    ) {

                        bestGroup =
                            candidate;

                        bestGroupPenalty =
                            penalty;
                    }
                }
            }

            // ------------------------------------------
            // GROUP FAILED
            // ------------------------------------------

            if (!bestGroup) {

                failed = true;

                break;
            }

            // ------------------------------------------
            // ADD GROUP
            // ------------------------------------------

            distribution.push(
                bestGroup
            );

            const selectedIds =
                new Set(
                    bestGroup.map(
                        p => p.id
                    )
                );

            remaining =
                remaining.filter(
                    p =>
                        !selectedIds.has(p.id)
                );
        }

        // ----------------------------------------------
        // FAILED ATTEMPT
        // ----------------------------------------------

        if (failed) {
            continue;
        }

        // ----------------------------------------------
        // MAKE SURE NO PLAYER REMAINS
        // ----------------------------------------------

        if (remaining.length !== 0) {
            continue;
        }

        // ----------------------------------------------
        // CALCULATE BALANCE
        // ----------------------------------------------

        const scores =
            distribution.map(
                getGroupScore
            );

        const spread =
            Math.max(...scores) -
            Math.min(...scores);

        const totalPenalty =
            spread * 50 +

            distribution.reduce(
                (sum, group) =>
                    sum +
                    getLevelDifference(group) *
                    10,
                0
            );

        // ----------------------------------------------
        // SAVE BEST RESULT
        // ----------------------------------------------

        if (
            totalPenalty <
            bestPenalty
        ) {

            bestPenalty =
                totalPenalty;

            bestDistribution =
                distribution;
        }

        // ----------------------------------------------
        // GOOD ENOUGH RESULT
        // ----------------------------------------------

        if (spread <= 2) {

            return distribution;
        }
    }

    return bestDistribution;
}

// ======================================================
// GENERATE BUTTON
// ======================================================

if (generateBtn) {

    generateBtn.addEventListener(
        "click",
        function () {

            // ------------------------------------------
            // MINIMUM PLAYERS
            // ------------------------------------------

            if (players.length < 4) {

                setStatus(
                    `At least 4 players are required. You currently have ${players.length}.`,
                    "error"
                );

                return;
            }

            // ------------------------------------------
            // RESET
            // ------------------------------------------

            distributions = [];
            undoStack = [];
            selectedPlayerForSwap = null;

            if (undoBtn) {
                undoBtn.disabled = true;
            }

            const groupCount =
                getGroupCount(players.length);

            const groupSizes =
                getGroupSizes(players.length);

            setStatus(
                `Generating ${DISTRIBUTION_COUNT} balanced distributions using ${groupCount} groups...`,
                ""
            );

            // ------------------------------------------
            // GENERATE
            // ------------------------------------------

            setTimeout(
                function () {

                    let failedAt = 0;

                    for (
                        let i = 0;
                        i < DISTRIBUTION_COUNT;
                        i++
                    ) {

                        const mode =
                            i + 1;

                        const distribution =
                            generateDistribution(
                                distributions,
                                mode
                            );

                        if (!distribution) {

                            failedAt =
                                i + 1;

                            break;
                        }

                        distributions.push(
                            distribution
                        );
                    }

                    // ----------------------------------
                    // FAILED
                    // ----------------------------------

                    if (
                        failedAt !== 0 ||
                        distributions.length !==
                        DISTRIBUTION_COUNT
                    ) {

                        distributions = [];

                        renderDistributions();

                        setStatus(
                            "Could not generate all 4 distributions. Please click Generate again.",
                            "error"
                        );

                        return;
                    }

                    // ----------------------------------
                    // SUCCESS
                    // ----------------------------------

                    renderDistributions();

                    setStatus(
                        `Successfully generated 4 balanced distributions for ${players.length} players!`,
                        "success"
                    );

                },
                30
            );
        }
    );
}

// ======================================================
// CLICK TO SWAP SYSTEM
// ======================================================

function handlePlayerClick(
    distIndex,
    groupIndex,
    playerId
) {

    const group =
        distributions[distIndex][groupIndex];

    const player =
        group.find(
            p => p.id === playerId
        );

    if (!player) return;

    // ----------------------------------------------
    // CANCEL SAME PLAYER
    // ----------------------------------------------

    if (
        selectedPlayerForSwap &&
        selectedPlayerForSwap.id === playerId
    ) {

        selectedPlayerForSwap = null;

        renderDistributions();

        setStatus(
            "Swap canceled.",
            "info"
        );

        return;
    }

    // ----------------------------------------------
    // SELECT FIRST PLAYER
    // ----------------------------------------------

    if (!selectedPlayerForSwap) {

        selectedPlayerForSwap = {

            distIndex,

            groupIndex,

            id: playerId,

            name: player.name
        };

        renderDistributions();

        setStatus(
            `Selected ${player.name}. Click another player in Distribution ${distIndex + 1} to swap.`,
            "info"
        );

        return;
    }

    // ----------------------------------------------
    // DIFFERENT DISTRIBUTION
    // ----------------------------------------------

    if (
        selectedPlayerForSwap.distIndex !==
        distIndex
    ) {

        setStatus(
            "You can only swap players within the same distribution.",
            "error"
        );

        return;
    }

    // ----------------------------------------------
    // SAME GROUP
    // ----------------------------------------------

    if (
        selectedPlayerForSwap.groupIndex ===
        groupIndex
    ) {

        setStatus(
            "Select a player from a DIFFERENT group to swap.",
            "warning"
        );

        return;
    }

    // ----------------------------------------------
    // SWAP
    // ----------------------------------------------

    saveUndoState();

    const sourceGroup =
        distributions[distIndex]
        [selectedPlayerForSwap.groupIndex];

    const targetGroup =
        distributions[distIndex]
        [groupIndex];

    const sourceIndex =
        sourceGroup.findIndex(
            p =>
                p.id ===
                selectedPlayerForSwap.id
        );

    const targetIndex =
        targetGroup.findIndex(
            p =>
                p.id === playerId
        );

    if (
        sourceIndex !== -1 &&
        targetIndex !== -1
    ) {

        const temp =
            sourceGroup[sourceIndex];

        sourceGroup[sourceIndex] =
            targetGroup[targetIndex];

        targetGroup[targetIndex] =
            temp;

        setStatus(
            `Swapped ${temp.name} with ${sourceGroup[sourceIndex].name}.`,
            "success"
        );
    }

    selectedPlayerForSwap = null;

    renderDistributions();
}

// ======================================================
// RENDER DISTRIBUTIONS
// ======================================================

function renderDistributions() {

    if (!distributionsBox) return;

    distributionsBox.innerHTML = "";

    if (distributions.length === 0) {

        distributionsBox.innerHTML = `
            <div class="empty-state">
                <p>
                    No distributions generated yet.
                    Click "Generate Distributions" above.
                </p>
            </div>
        `;

        return;
    }

    distributions.forEach(
        (dist, distIndex) => {

            const distCard =
                document.createElement("div");

            distCard.className =
                "distribution-card";

            distCard.innerHTML = `
                <h3>
                    Distribution ${distIndex + 1}
                </h3>

                <div
                    class="groups-grid"
                    data-dist-index="${distIndex}">
                </div>
            `;

            const groupsGrid =
                distCard.querySelector(
                    ".groups-grid"
                );

            dist.forEach(
                (group, groupIndex) => {

                    const groupScore =
                        getGroupScore(group);

                    const groupCard =
                        document.createElement("div");

                    groupCard.className =
                        "group-card";

                    groupCard.dataset.distIndex =
                        distIndex;

                    groupCard.dataset.groupIndex =
                        groupIndex;

                    groupCard.innerHTML = `
                        <div class="group-header">

                            <h4>
                                Group ${groupIndex + 1}
                            </h4>

                            <span class="group-score">
                                Total Score:
                                ${groupScore}
                            </span>

                        </div>

                        <div
                            class="group-players"
                            data-dist-index="${distIndex}"
                            data-group-index="${groupIndex}">
                        </div>
                    `;

                    const playersContainer =
                        groupCard.querySelector(
                            ".group-players"
                        );

                    // ----------------------------------
                    // DRAG EVENTS
                    // ----------------------------------

                    playersContainer.addEventListener(
                        "dragover",
                        handleDragOver
                    );

                    playersContainer.addEventListener(
                        "dragleave",
                        handleDragLeave
                    );

                    playersContainer.addEventListener(
                        "drop",
                        handleDrop
                    );

                    // ----------------------------------
                    // PLAYERS
                    // ----------------------------------

                    group.forEach(
                        player => {

                            const playerTag =
                                document.createElement(
                                    "div"
                                );

                            playerTag.className =
                                "group-player-tag";

                            // Selected player
                            if (
                                selectedPlayerForSwap &&
                                selectedPlayerForSwap.id ===
                                player.id
                            ) {

                                playerTag.classList.add(
                                    "selected-swap"
                                );
                            }

                            playerTag.draggable = true;

                            playerTag.dataset.playerId =
                                player.id;

                            playerTag.dataset.distIndex =
                                distIndex;

                            playerTag.dataset.groupIndex =
                                groupIndex;

                            playerTag.innerHTML = `
                                <span>
                                    ${escapeHTML(
                                        player.name
                                    )}
                                </span>

                                <small>
                                    Lvl ${player.level}
                                </small>
                            `;

                            // --------------------------------
                            // CLICK
                            // --------------------------------

                            playerTag.addEventListener(
                                "click",
                                function () {

                                    handlePlayerClick(
                                        distIndex,
                                        groupIndex,
                                        player.id
                                    );

                                }
                            );

                            // --------------------------------
                            // DRAG
                            // --------------------------------

                            playerTag.addEventListener(
                                "dragstart",
                                handleDragStart
                            );

                            playerTag.addEventListener(
                                "dragend",
                                handleDragEnd
                            );

                            playersContainer.appendChild(
                                playerTag
                            );
                        }
                    );

                    groupsGrid.appendChild(
                        groupCard
                    );
                }
            );

            distributionsBox.appendChild(
                distCard
            );
        }
    );
}

// ======================================================
// DRAG AND DROP
// ======================================================

function handleDragStart(e) {

    draggedPlayer = {

        id: this.dataset.playerId,

        distIndex:
            parseInt(
                this.dataset.distIndex,
                10
            ),

        groupIndex:
            parseInt(
                this.dataset.groupIndex,
                10
            )
    };

    this.classList.add("dragging");

    e.dataTransfer.effectAllowed =
        "move";

    e.dataTransfer.setData(
        "text/plain",
        this.dataset.playerId
    );
}

function handleDragEnd() {

    this.classList.remove(
        "dragging"
    );

    draggedPlayer = null;

    document
        .querySelectorAll(
            ".group-players"
        )
        .forEach(
            el =>
                el.classList.remove(
                    "drag-over"
                )
        );
}

function handleDragOver(e) {

    e.preventDefault();

    e.dataTransfer.dropEffect =
        "move";

    this.classList.add(
        "drag-over"
    );
}

function handleDragLeave() {

    this.classList.remove(
        "drag-over"
    );
}

function handleDrop(e) {

    e.preventDefault();

    this.classList.remove(
        "drag-over"
    );

    if (!draggedPlayer) return;

    const targetDistIndex =
        parseInt(
            this.dataset.distIndex,
            10
        );

    const targetGroupIndex =
        parseInt(
            this.dataset.groupIndex,
            10
        );

    // ----------------------------------------------
    // DIFFERENT DISTRIBUTION
    // ----------------------------------------------

    if (
        draggedPlayer.distIndex !==
        targetDistIndex
    ) {

        setStatus(
            "Players can only be swapped within the same distribution.",
            "error"
        );

        return;
    }

    // ----------------------------------------------
    // SAME GROUP
    // ----------------------------------------------

    if (
        draggedPlayer.groupIndex ===
        targetGroupIndex
    ) {

        return;
    }

    const sourceGroup =
        distributions[targetDistIndex]
        [draggedPlayer.groupIndex];

    const targetGroup =
        distributions[targetDistIndex]
        [targetGroupIndex];

    // ----------------------------------------------
    // GET MAX SIZE FOR TARGET GROUP
    // ----------------------------------------------

    const groupSizes =
        getGroupSizes(players.length);

    const targetMaxSize =
        groupSizes[targetGroupIndex];

    // ----------------------------------------------
    // PREVENT OVERFLOW
    // ----------------------------------------------

    if (
        targetGroup.length >=
        targetMaxSize
    ) {

        setStatus(
            `Group ${targetGroupIndex + 1} is already full.`,
            "error"
        );

        return;
    }

    // ----------------------------------------------
    // FIND PLAYER
    // ----------------------------------------------

    const playerIndex =
        sourceGroup.findIndex(
            p =>
                p.id ===
                draggedPlayer.id
        );

    if (playerIndex === -1) return;

    // ----------------------------------------------
    // SAVE UNDO
    // ----------------------------------------------

    saveUndoState();

    // ----------------------------------------------
    // MOVE PLAYER
    // ----------------------------------------------

    const [movedPlayer] =
        sourceGroup.splice(
            playerIndex,
            1
        );

    targetGroup.push(
        movedPlayer
    );

    selectedPlayerForSwap = null;

    renderDistributions();

    setStatus(
        `Moved ${movedPlayer.name} to Group ${targetGroupIndex + 1}.`,
        "warning"
    );
}

// ======================================================
// UNDO
// ======================================================

function saveUndoState() {

    undoStack.push(
        JSON.parse(
            JSON.stringify(
                distributions
            )
        )
    );

    if (undoBtn) {
        undoBtn.disabled = false;
    }
}

if (undoBtn) {

    undoBtn.addEventListener(
        "click",
        function () {

            if (
                undoStack.length === 0
            ) {
                return;
            }

            distributions =
                undoStack.pop();

            if (
                undoStack.length === 0
            ) {

                undoBtn.disabled =
                    true;
            }

            selectedPlayerForSwap =
                null;

            renderDistributions();

            setStatus(
                "Last change undone.",
                "info"
            );
        }
    );
}

// ======================================================
// CLEAR
// ======================================================

if (clearBtn) {

    clearBtn.addEventListener(
        "click",
        function () {

            players = [];
            distributions = [];
            undoStack = [];

            selectedPlayerForSwap =
                null;

            if (undoBtn) {
                undoBtn.disabled = true;
            }

            renderPlayers();
            renderDistributions();

            setStatus(
                "All data cleared.",
                "info"
            );
        }
    );
}

// ======================================================
// PRINT
// ======================================================

if (printBtn) {

    printBtn.addEventListener(
        "click",
        function () {

            if (
                distributions.length === 0
            ) {

                setStatus(
                    "Nothing to print. Generate distributions first.",
                    "error"
                );

                return;
            }

            window.print();
        }
    );
}

// ======================================================
// INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (checkElements()) {

            renderPlayers();

            renderDistributions();

            setStatus(
                "System ready. Add players or click Demo.",
                "success"
            );
        }
    }
);
