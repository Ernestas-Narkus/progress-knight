// Shows the first error on screen so a problem is never silent (the game would otherwise just look stuck)
function showFatalError(message) {
    if (document.getElementById("errorBanner")) return
    var banner = document.createElement("div")
    banner.id = "errorBanner"
    banner.setAttribute("role", "alert")
    banner.textContent = "Something went wrong: " + message + " - try a hard refresh (Ctrl+F5). If it keeps happening, tell me this message."
    document.body.appendChild(banner)
}
window.addEventListener("error", function(event) { showFatalError(event.message) })

function runSafely(step) {
    try { step() } catch (error) { console.error(error); showFatalError(error.message) }
}

// Newer interface pieces are looked up leniently, so a page that is missing one can never stop the game from starting
function byId(id) {
    return document.getElementById(id) || document.createElement("div")
}

var gameData = {
    taskData: {},
    itemData: {},

    coins: 0,
    collapsedCategories: {},
    days: 365 * 14,
    evil: 0,
    paused: false,
    timeWarpingEnabled: true,
    speedMultiplier: 1,

    loadouts: {},
    settings: {
        stickySidebar: false,
        autoPause: false,
    },

    martialRank: -1,
    cultivationRank: -1,

    rebirthOneCount: 0,
    rebirthTwoCount: 0,

    currentJob: null,
    currentSkill: null,
    currentProperty: null,
    currentMisc: null,
}

var tempData = {}

var skillWithLowestMaxXp = null

const autoPromoteElement = document.getElementById("autoPromote")
const autoLearnElement = document.getElementById("autoLearn")

const updateSpeed = 20

const baseLifespan = 365 * 70

const baseGameSpeed = 4

const permanentUnlocks = ["Scheduling", "Shop", "Automation", "Quick task display"]

// Rank ladders. gameData.martialRank / cultivationRank hold the index of the current rank (-1 = none yet).
// Future jobs, skills and areas can unlock from these through RankRequirement (see classes.js).
const martialArtsRanks = [
    "Martial Apprentice",
    "Martial Artist",
    "Senior Martial Artist",
    "Third Rate",
    "Second Rate",
    "First Rate",
    "Peak",
    "Enlightenment",
]

const cultivationRanks = [
    "Qi Training",
    "Foundation Establishment",
    "Core Formation",
    "Nascent Soul",
    "Soul Transformation",
    "Void Refinement",
    "Body Integration",
    "Mahayana",
    "Tribulation Transcendence",
    "True Immortal",
]

const jobBaseData = {
    "Beggar": {name: "Beggar", maxXp: 50, income: 5},
    "Farmer": {name: "Farmer", maxXp: 100, income: 9},
    "Fisherman": {name: "Fisherman", maxXp: 200, income: 15},
    "Miner": {name: "Miner", maxXp: 400, income: 40},
    "Blacksmith": {name: "Blacksmith", maxXp: 800, income: 80},
    "Merchant": {name: "Merchant", maxXp: 1600, income: 150},

    "Sweeper": {name: "Sweeper", maxXp: 100, income: 5},
    "Training Partner": {name: "Training Partner", maxXp: 1000, income: 50},
    "Sparring Partner": {name: "Sparring Partner", maxXp: 10000, income: 120},
    "Hall Guard": {name: "Hall Guard", maxXp: 100000, income: 300},
    "Junior Martial Instructor": {name: "Junior Martial Instructor", maxXp: 1000000, income: 1000},
    "Head Martial Instructor": {name: "Head Martial Instructor", maxXp: 7500000, income: 3000},
    "First Disciple": {name: "First Disciple", maxXp: 40000000, income: 15000},
    "Dojo Master": {name: "Dojo Master", maxXp: 150000000, income: 50000},

    "Outer Disciple": {name: "Outer Disciple", maxXp: 100000, income: 100},
    "Inner Disciple": {name: "Inner Disciple", maxXp: 1000000, income: 1000},
    "Core Disciple": {name: "Core Disciple", maxXp: 10000000, income: 7500},
    "Elder": {name: "Elder", maxXp: 100000000, income: 50000},
    "Grand Elder": {name: "Grand Elder", maxXp: 10000000000, income: 250000},
    "Sect Master": {name: "Sect Master", maxXp: 1000000000000, income: 1000000},
}

const skillBaseData = {
    "Concentration": {name: "Concentration", maxXp: 100, effect: 0.01, description: "Skill xp"},
    "Productivity": {name: "Productivity", maxXp: 100, effect: 0.01, description: "Job xp"},
    "Bargaining": {name: "Bargaining", maxXp: 100, effect: -0.01, description: "Expenses"},
    "Meditation": {name: "Meditation", maxXp: 100, effect: 0.01, description: "State of Mind"},

    "Conditioning": {name: "Conditioning", maxXp: 100, effect: 0.01, description: "Martial pay"},
    "Strategy": {name: "Strategy", maxXp: 100, effect: 0.01, description: "Job xp"},
    "Muscle Memory": {name: "Muscle Memory", maxXp: 100, effect: 0.01, description: "Conditioning xp"},

    "Qi Control": {name: "Qi Control", maxXp: 100, effect: 0.01, description: "Sect xp"},
    "Time warping": {name: "Time warping", maxXp: 100, effect: 0.01, description: "Gamespeed"},

    "Dark influence": {name: "Dark influence", maxXp: 100, effect: 0.01, description: "All xp"},
    "Evil control": {name: "Evil control", maxXp: 100, effect: 0.01, description: "Evil gain"},
    "Intimidation": {name: "Intimidation", maxXp: 100, effect: -0.01, description: "Expenses"},
    "Demon training": {name: "Demon training", maxXp: 100, effect: 0.01, description: "All xp"},
    "Blood meditation": {name: "Blood meditation", maxXp: 100, effect: 0.01, description: "Evil gain"},
    "Demon's wealth": {name: "Demon's wealth", maxXp: 100, effect: 0.002, description: "Job pay"},
    
}

const itemBaseData = {
    "Homeless": {name: "Homeless", expense: 0, effect: 1},
    "Tent": {name: "Tent", expense: 15, effect: 1.4},
    "Wooden hut": {name: "Wooden hut", expense: 100, effect: 2},
    "Cottage": {name: "Cottage", expense: 750, effect: 3.5},
    "House": {name: "House", expense: 3000, effect: 6},
    "Large house": {name: "Large house", expense: 25000, effect: 12},
    "Small palace": {name: "Small palace", expense: 300000, effect: 25},
    "Grand palace": {name: "Grand palace", expense: 5000000, effect: 60},

    "Book": {name: "Book", expense: 10, effect: 1.5, description: "Skill xp"},
    "Dumbbells": {name: "Dumbbells", expense: 50, effect: 1.5, description: "Conditioning xp"},
    "Personal squire": {name: "Personal squire", expense: 200, effect: 2, description: "Job xp"},
    "Steel longsword": {name: "Steel longsword", expense: 1000, effect: 2, description: "Martial xp"},
    "Butler": {name: "Butler", expense: 7500, effect: 1.5, description: "State of Mind"},
    "Sapphire charm": {name: "Sapphire charm", expense: 50000, effect: 3, description: "Qi xp"},
    "Study desk": {name: "Study desk", expense: 1000000, effect: 2, description: "Skill xp"},
    "Library": {name: "Library", expense: 10000000, effect: 1.5, description: "Skill xp"},
}

const jobCategories = {
    "Mortal Village": ["Beggar", "Farmer", "Fisherman", "Miner", "Blacksmith", "Merchant"],
    "Martial Arts Hall" : ["Sweeper", "Training Partner", "Sparring Partner", "Hall Guard", "Junior Martial Instructor", "Head Martial Instructor", "First Disciple", "Dojo Master"],
    "Sect" : ["Outer Disciple", "Inner Disciple", "Core Disciple", "Elder", "Grand Elder", "Sect Master"]
}

const skillCategories = {
    "Worldly": ["Bargaining", "Productivity", "Strategy"],
    "Mind": ["Concentration", "Meditation"],
    "Martial Skill": ["Conditioning", "Muscle Memory"],
    "Qi": ["Qi Control", "Time warping"],
    "Dark magic": ["Dark influence", "Evil control", "Intimidation", "Demon training", "Blood meditation", "Demon's wealth"]
}

const itemCategories = {
    "Properties": ["Homeless", "Tent", "Wooden hut", "Cottage", "House", "Large house", "Small palace", "Grand palace"],
    "Misc": ["Book", "Dumbbells", "Personal squire", "Steel longsword", "Butler", "Sapphire charm", "Study desk", "Library"]
}

const headerRowColors = {
    "Mortal Village": "#b6e2d0",
    "Martial Arts Hall": "#f5bccb",
    "Sect": "#d3bcf2",
    "Worldly": "#bccff3",
    "Mind": "#bccff3",
    "Martial Skill": "#f8d0aa",
    "Qi": "#c7bcf0",
    "Dark magic": "#a99bc8",
    "Properties": "#abdce9",
    "Misc": "#f0c6d8",
}

const tooltips = {
    "Beggar": "Struggle day and night for a couple of Spirit Stones. It feels like you are at the brink of death each day.",
    "Farmer": "Plow the fields and grow the crops. It's not much but it's honest work.",
    "Fisherman": "Reel in various fish and sell them for a handful of Spirit Stones. A relaxing but still a poor paying job.",
    "Miner": "Delve into dangerous caverns and mine valuable ores. The pay is quite meager compared to the risk involved.",
    "Blacksmith": "Smelt ores and carefully forge weapons for the military. A respectable and OK paying commoner job.",
    "Merchant": "Travel from town to town, bartering fine goods. The job pays decently well and is a lot less manually-intensive.",

    "Sweeper": "Placeholder description for Sweeper.",
    "Training Partner": "Placeholder description for Training Partner.",
    "Sparring Partner": "Placeholder description for Sparring Partner.",
    "Hall Guard": "Placeholder description for Hall Guard.",
    "Junior Martial Instructor": "Placeholder description for Junior Martial Instructor.",
    "Head Martial Instructor": "Placeholder description for Head Martial Instructor.",
    "First Disciple": "Placeholder description for First Disciple.",
    "Dojo Master": "Placeholder description for Dojo Master.",
    "Outer Disciple": "Placeholder description for Outer Disciple.",
    "Inner Disciple": "Placeholder description for Inner Disciple.",
    "Core Disciple": "Placeholder description for Core Disciple.",
    "Elder": "Placeholder description for Elder.",
    "Grand Elder": "Placeholder description for Grand Elder.",
    "Sect Master": "Placeholder description for Sect Master.",
    "Concentration": "Improve your learning speed through practising intense concentration activities.",
    "Productivity": "Learn to procrastinate less at work and receive more job experience per day.",
    "Bargaining": "Study the tricks of the trade and persuasive skills to lower any type of expense.",
    "Meditation": "Fill your mind with peace and tranquility to reach a calmer state of mind.",

    "Conditioning": "Condition your body and strength through harsh training. Stronger individuals are paid more in the martial arts hall.",
    "Strategy": "Create and revise strategies, improving experience gained in every job.",
    "Muscle Memory": "Strengthen your neurons through habit and repetition, improving conditioning gains throughout the body.",

    "Qi Control": "Strengthen your qi channels throughout your body, aiding you in becoming a more powerful cultivator.",
    "Time warping": "Bend space and time through forbidden techniques, resulting in a faster gamespeed.",

    "Dark influence": "Encompass yourself with formidable power bestowed upon you by evil, allowing you to pick up and absorb any job or skill with ease.",
    "Evil control": "Tame the raging and growing evil within you, improving evil gain in-between rebirths.",
    "Intimidation": "Learn to emit a devilish aura which strikes extreme fear into other merchants, forcing them to give you heavy discounts.",
    "Demon training": "A mere human body is too feeble and weak to withstand evil. Train with forbidden methods to slowly manifest into a demon, capable of absorbing knowledge rapidly.",
    "Blood meditation": "Grow and culture the evil within you through the sacrifise of other living beings, drastically increasing evil gain.",
    "Demon's wealth": "Through the means of dark magic, multiply the raw matter of the Spirit Stones you receive from your job.",

    "Homeless": "Sleep on the uncomfortable, filthy streets while almost freezing to death every night. It cannot get any worse than this.",
    "Tent": "A thin sheet of tattered cloth held up by a couple of feeble, wooden sticks. Horrible living conditions but at least you have a roof over your head.",
    "Wooden hut": "Shabby logs and dirty hay glued together with horse manure. Much more sturdy than a tent, however, the stench isn't very pleasant.",
    "Cottage": "Structured with a timber frame and a thatched roof. Provides decent living conditions for a fair price.",
    "House": "A building formed from stone bricks and sturdy timber, which contains a few rooms. Although quite expensive, it is a comfortable abode.",
    "Large house": "Much larger than a regular house, which boasts even more rooms and multiple floors. The building is quite spacious but comes with a hefty price tag.",
    "Small palace": "A very rich and meticulously built structure rimmed with fine metals such as silver. Extremely high expenses to maintain for a lavish lifestyle.",
    "Grand palace": "A grand residence completely composed of gold and silver. Provides the utmost luxurious and comfortable living conditions possible for a ludicrous price.",

    "Book": "A place to write down all your thoughts and discoveries, allowing you to learn a lot more quickly.",
    "Dumbbells": "Heavy tools used in strenuous exercise to toughen up and accumulate strength even faster than before. ",
    "Personal squire": "Assists you in completing day to day activities, giving you more time to be productive at work.",
    "Steel longsword": "A fine blade used to slay enemies even quicker in combat and therefore gain more experience.",
    "Butler": "Keeps your household clean at all times and also prepares three delicious meals per day, leaving you in a happier, stress-free mood.",
    "Sapphire charm": "Embedded with a rare sapphire, this charm activates more qi channels within your body, providing a much easier time learning qi skills.",
    "Study desk": "A dedicated area which provides many fine stationary and equipment designed for furthering your progress in research.",
    "Library": "Stores a collection of books, each containing vast amounts of information from basic life skills to complex magic spells.",
}

const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc", "No", "Dc", "Ud", "Dd", "Td", "Qd", "Qn", "Sxd", "Spd", "Ocd", "Nod", "Vg"];

const jobTabButton = document.getElementById("jobTabButton")

function setMartialRank(index) {
    gameData.martialRank = Math.max(-1, Math.min(index, martialArtsRanks.length - 1))
}

function setCultivationRank(index) {
    gameData.cultivationRank = Math.max(-1, Math.min(index, cultivationRanks.length - 1))
}

function createRankList(listId, ranks) {
    var list = byId(listId)
    ranks.forEach(function(name) {
        var item = document.createElement("li")
        item.className = "rank"
        item.textContent = name
        list.appendChild(item)
    })
}

function updateRankList(listId, displayId, ranks, rankIndex, emptyText) {
    byId(displayId).textContent = rankIndex >= 0 ? ranks[rankIndex] : emptyText
    var items = byId(listId).children
    for (var i = 0; i < items.length; i++) {
        items[i].classList.toggle("reached", i < rankIndex)
        items[i].classList.toggle("current", i == rankIndex)
    }
}

function updateRanks() {
    updateRankList("martialRankList", "martialRankDisplay", martialArtsRanks, gameData.martialRank, "Untrained")
    updateRankList("cultivationRankList", "cultivationRankDisplay", cultivationRanks, gameData.cultivationRank, "Mortal")
}

function setCategoryCollapsed(categoryName, collapsed) {
    gameData.collapsedCategories[categoryName] = collapsed
    var rows = document.querySelectorAll("[data-category]")
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].dataset.category == categoryName) rows[i].classList.toggle("collapsed", collapsed)
    }
    var headerRow = document.querySelector(".headerRow." + removeSpaces(categoryName))
    var button = headerRow.getElementsByClassName("collapse-btn")[0]
    button.textContent = collapsed ? "\u25B8" : "\u25BE"
    button.setAttribute("aria-expanded", String(!collapsed))
    button.setAttribute("aria-label", (collapsed ? "Expand " : "Collapse ") + categoryName)
}

function applyCollapsedCategories() {
    [jobCategories, skillCategories, itemCategories].forEach(function(categories) {
        for (var categoryName in categories) {
            setCategoryCollapsed(categoryName, !!gameData.collapsedCategories[categoryName])
        }
    })
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}
  
function getBindedTaskEffect(taskName) {
    var task = gameData.taskData[taskName]
    return task.getEffect.bind(task)
}

function getBindedItemEffect(itemName) {
    var item = gameData.itemData[itemName]
    return item.getEffect.bind(item)
}

function addMultipliers() {
    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]

        task.xpMultipliers = []
        if (task instanceof Job) task.incomeMultipliers = []

        task.xpMultipliers.push(task.getMaxLevelMultiplier.bind(task))
        task.xpMultipliers.push(getHappiness)
        task.xpMultipliers.push(getBindedTaskEffect("Dark influence"))
        task.xpMultipliers.push(getBindedTaskEffect("Demon training"))

        if (task instanceof Job) {
            task.incomeMultipliers.push(task.getLevelMultiplier.bind(task))
            task.incomeMultipliers.push(getBindedTaskEffect("Demon's wealth"))
            task.xpMultipliers.push(getBindedTaskEffect("Productivity"))
            task.xpMultipliers.push(getBindedTaskEffect("Strategy"))
            task.xpMultipliers.push(getBindedItemEffect("Personal squire"))    
        } else if (task instanceof Skill) {
            task.xpMultipliers.push(getBindedTaskEffect("Concentration"))
            task.xpMultipliers.push(getBindedItemEffect("Book"))
            task.xpMultipliers.push(getBindedItemEffect("Study desk"))
            task.xpMultipliers.push(getBindedItemEffect("Library"))
        }

        if (jobCategories["Martial Arts Hall"].includes(task.name)) {
            task.incomeMultipliers.push(getBindedTaskEffect("Conditioning"))
            task.xpMultipliers.push(getBindedItemEffect("Steel longsword"))
        } else if (task.name == "Conditioning") {
            task.xpMultipliers.push(getBindedTaskEffect("Muscle Memory"))
            task.xpMultipliers.push(getBindedItemEffect("Dumbbells"))
        } else if (skillCategories["Qi"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Sapphire charm"))
        } else if (jobCategories["Sect"].includes(task.name)) {
            task.xpMultipliers.push(getBindedTaskEffect("Qi Control"))
        } else if (skillCategories["Dark magic"].includes(task.name)) {
            task.xpMultipliers.push(getEvil)
        }
    }

    for (itemName in gameData.itemData) {
        var item = gameData.itemData[itemName]
        item.expenseMultipliers = []
        item.expenseMultipliers.push(getBindedTaskEffect("Bargaining"))
        item.expenseMultipliers.push(getBindedTaskEffect("Intimidation"))
    }
}

function setCustomEffects() {
    var bargaining = gameData.taskData["Bargaining"]
    bargaining.getEffect = function() {
        var multiplier = 1 - getBaseLog(7, bargaining.level + 1) / 10
        if (multiplier < 0.1) {multiplier = 0.1}
        return multiplier
    }

    var intimidation = gameData.taskData["Intimidation"]
    intimidation.getEffect = function() {
        var multiplier = 1 - getBaseLog(7, intimidation.level + 1) / 10
        if (multiplier < 0.1) {multiplier = 0.1}
        return multiplier
    }

    var timeWarping = gameData.taskData["Time warping"]
    timeWarping.getEffect = function() {
        var multiplier = 1 + getBaseLog(13, timeWarping.level + 1) 
        return multiplier
    }
}

function getHappiness() {
    var meditationEffect = getBindedTaskEffect("Meditation")
    var butlerEffect = getBindedItemEffect("Butler")
    var happiness = meditationEffect() * butlerEffect() * gameData.currentProperty.getEffect()
    return happiness
}

function getEvil() {
    return gameData.evil
}

function applyMultipliers(value, multipliers) {
    var finalMultiplier = 1
    multipliers.forEach(function(multiplierFunction) {
        var multiplier = multiplierFunction()
        finalMultiplier *= multiplier
    })
    var finalValue = Math.round(value * finalMultiplier)
    return finalValue
}

function applySpeed(value) {
    var finalValue = value * getGameSpeed() / updateSpeed
    return finalValue
}

function getEvilGain() {
    var evilControl = gameData.taskData["Evil control"]
    var bloodMeditation = gameData.taskData["Blood meditation"]
    var evil = evilControl.getEffect() * bloodMeditation.getEffect()
    return evil
}

function getGameSpeed() {
    var timeWarping = gameData.taskData["Time warping"]
    var timeWarpingSpeed = gameData.timeWarpingEnabled ? timeWarping.getEffect() : 1
    var gameSpeed = baseGameSpeed * +!gameData.paused * +isAlive() * timeWarpingSpeed * gameData.speedMultiplier
    return gameSpeed
}

function applyExpenses() {
    var coins = applySpeed(getExpense())
    gameData.coins -= coins
    if (gameData.coins < 0) {    
        goBankrupt()
    }
}

function getExpense() {
    var expense = 0
    expense += gameData.currentProperty.getExpense()
    for (misc of gameData.currentMisc) {
        expense += misc.getExpense()
    }
    return expense
}

function goBankrupt() {
    gameData.coins = 0
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []
}

function setTab(element, selectedTab) {

    var tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
    tabs.forEach(function(tab) {
        tab.style.display = "none"
    })
    document.getElementById(selectedTab).style.display = "block"

    var tabButtons = document.getElementsByClassName("tabButton")
    for (tabButton of tabButtons) {
        tabButton.classList.remove("w3-blue-gray")
    }
    element.classList.add("w3-blue-gray")
}

function setPause() {
    gameData.paused = !gameData.paused
}

// Clicking the active speed button again returns to x1
function setSpeedMultiplier(multiplier) {
    gameData.speedMultiplier = gameData.speedMultiplier == multiplier ? 1 : multiplier
}

function isUnlocked(name) {
    var requirement = gameData.requirements[name]
    return !requirement || requirement.isCompleted()
}

var statusTimer = null
function showStatus(text) {
    var element = byId("statusMessage")
    element.textContent = text
    clearTimeout(statusTimer)
    statusTimer = setTimeout(function() { element.textContent = "" }, 4000)
}

function setStickySidebar(sticky) {
    gameData.settings.stickySidebar = sticky
    byId("settingsStickySidebar").checked = sticky
    byId("info").classList.toggle("sticky", sticky)
}

function setAutoPause(enabled) {
    gameData.settings.autoPause = enabled
    byId("settingsAutoPause").checked = enabled
}

function initUI() {
    setStickySidebar(gameData.settings.stickySidebar)
    setAutoPause(gameData.settings.autoPause)
}

// Cycles through the tabs that are currently visible (the Story tab stays hidden until it unlocks)
function changeTab(direction) {
    var tabButtons = Array.prototype.slice.call(document.getElementsByClassName("tabButton"))
    var visible = tabButtons.filter(function(button) { return button.offsetParent !== null })
    var current = visible.findIndex(function(button) { return button.classList.contains("w3-blue-gray") })
    visible[(current + direction + visible.length) % visible.length].click()
}

// Loadouts remember your job, skill, property and items, and are saved with the game
function saveLoadout(slot) {
    gameData.loadouts[slot] = {
        job: gameData.currentJob.name,
        skill: gameData.currentSkill.name,
        property: gameData.currentProperty.name,
        misc: gameData.currentMisc.map(function(item) { return item.name }),
    }
    showStatus("Loadout " + slot + " saved")
}

function loadLoadout(slot) {
    var loadout = gameData.loadouts[slot]
    if (!loadout) {
        showStatus("Loadout " + slot + " is empty. Press Alt+" + slot + " to save one")
        return
    }

    var skipped = []
    function usable(name, data) {
        if (name in data && isUnlocked(name)) return true
        skipped.push(name)
        return false
    }

    if (usable(loadout.job, gameData.taskData)) setTask(loadout.job)
    if (usable(loadout.skill, gameData.taskData)) setTask(loadout.skill)
    if (usable(loadout.property, gameData.itemData)) setProperty(loadout.property)
    gameData.currentMisc = []
    loadout.misc.forEach(function(name) {
        if (usable(name, gameData.itemData)) setMisc(name)
    })

    // Auto-promote and auto-learn would immediately override the loadout, so they are switched off
    var autoWasOn = autoPromoteElement.checked || autoLearnElement.checked
    autoPromoteElement.checked = false
    autoLearnElement.checked = false

    var message = "Loadout " + slot + " loaded"
    if (autoWasOn) message += " (auto-promote and auto-learn turned off)"
    if (skipped.length > 0) message += ". Not available yet: " + skipped.join(", ")
    showStatus(message)
}

// Keys that are meant for typing (the import box etc.) never trigger shortcuts
function isTypingTarget(target) {
    if (!target) return false
    if (target.isContentEditable) return true
    if (target.tagName == "TEXTAREA" || target.tagName == "SELECT") return true
    if (target.tagName == "INPUT") return !["checkbox", "radio", "button", "submit"].includes(target.type)
    return false
}

function loadoutSlot(event) {
    var match = /^(?:Digit|Numpad)([1-3])$/.exec(event.code)
    return match ? Number(match[1]) : 0
}

window.addEventListener("keydown", function(event) {
    if (isTypingTarget(event.target) || event.ctrlKey || event.metaKey) return

    // event.code is used for the digits because Alt+1 types a different character on some keyboards
    var slot = loadoutSlot(event)
    if (slot && !event.shiftKey) {
        if (!event.repeat) event.altKey ? saveLoadout(slot) : loadLoadout(slot)
        event.preventDefault()
        return
    }
    if (event.altKey) return

    if (event.code == "Space") {
        if (!event.repeat) setPause()
        event.preventDefault() // no page scroll, and no second click on a focused button
    } else if (event.code == "ArrowRight" || event.code == "ArrowLeft") {
        if (!event.repeat) changeTab(event.code == "ArrowRight" ? 1 : -1)
        event.preventDefault()
    } else if (event.key.toLowerCase() == "l") {
        if (!event.repeat) autoLearnElement.checked = !autoLearnElement.checked
    } else if (event.key.toLowerCase() == "p") {
        if (!event.repeat) autoPromoteElement.checked = !autoPromoteElement.checked
    }
})

window.addEventListener("keyup", function(event) {
    if (event.code == "Space" && !isTypingTarget(event.target)) event.preventDefault()
})

function setTimeWarping() {
    gameData.timeWarpingEnabled = !gameData.timeWarpingEnabled
}

function setTask(taskName) {
    var task = gameData.taskData[taskName]
    task instanceof Job ? gameData.currentJob = task : gameData.currentSkill = task
}

function setProperty(propertyName) {
    var property = gameData.itemData[propertyName]
    gameData.currentProperty = property
}

function setMisc(miscName) {
    var misc = gameData.itemData[miscName]
    if (gameData.currentMisc.includes(misc)) {
        for (i = 0; i < gameData.currentMisc.length; i++) {
            if (gameData.currentMisc[i] == misc) {
                gameData.currentMisc.splice(i, 1)
            }
        }
    } else {
        gameData.currentMisc.push(misc)
    }
}

function createData(data, baseData) {
    for (key in baseData) {
        var entity = baseData[key]
        createEntity(data, entity)
    }
}

function createEntity(data, entity) {
    if ("income" in entity) {data[entity.name] = new Job(entity)}
    else if ("maxXp" in entity) {data[entity.name] = new Skill(entity)}
    else {data[entity.name] = new Item(entity)}
    data[entity.name].id = "row " + entity.name
}

function createRequiredRow(categoryName) {
    var requiredRow = document.getElementsByClassName("requiredRowTemplate")[0].content.firstElementChild.cloneNode(true)
    requiredRow.classList.add("requiredRow")
    requiredRow.classList.add(removeSpaces(categoryName))
    requiredRow.id = categoryName
    requiredRow.dataset.category = categoryName
    return requiredRow
}

function createHeaderRow(templates, categoryType, categoryName) {
    var headerRow = templates.headerRow.content.firstElementChild.cloneNode(true)
    headerRow.getElementsByClassName("category")[0].textContent = categoryName
    if (categoryType == jobCategories) headerRow.getElementsByClassName("levelHeader")[0].textContent = "Reputation"
    if (categoryType != itemCategories) {
        headerRow.getElementsByClassName("valueType")[0].textContent = categoryType == jobCategories ? "Income/day" : "Effect"
    }

    headerRow.style.backgroundColor = headerRowColors[categoryName]
    headerRow.classList.add(removeSpaces(categoryName))
    headerRow.classList.add("headerRow")
    headerRow.getElementsByClassName("collapse-btn")[0].onclick = function() {
        setCategoryCollapsed(categoryName, !gameData.collapsedCategories[categoryName])
    }
    
    return headerRow
}

function createRow(templates, name, categoryName, categoryType) {
    var row = templates.row.content.firstElementChild.cloneNode(true)
    row.getElementsByClassName("name")[0].textContent = name
    row.getElementsByClassName("tooltipText")[0].textContent = tooltips[name]
    row.id = "row " + name
    row.dataset.category = categoryName
    if (categoryType != itemCategories) {
        row.getElementsByClassName("progressBar")[0].onclick = function() {setTask(name)}
    } else {
        row.getElementsByClassName("button")[0].onclick = categoryName == "Properties" ? function() {setProperty(name)} : function() {setMisc(name)}
    }

    return row
}

function createAllRows(categoryType, tableId) {
    var templates = {
        headerRow: document.getElementsByClassName(categoryType == itemCategories ? "headerRowItemTemplate" : "headerRowTaskTemplate")[0],
        row: document.getElementsByClassName(categoryType == itemCategories ? "rowItemTemplate" : "rowTaskTemplate")[0],
    }

    var table = document.getElementById(tableId)

    for (categoryName in categoryType) {
        var headerRow = createHeaderRow(templates, categoryType, categoryName)
        table.appendChild(headerRow)
        
        var category = categoryType[categoryName]
        category.forEach(function(name) {
            var row = createRow(templates, name, categoryName, categoryType)
            table.appendChild(row)       
        })

        var requiredRow = createRequiredRow(categoryName)
        table.append(requiredRow)
    }
}

function updateQuickTaskDisplay(taskType) {
    var currentTask = taskType == "job" ? gameData.currentJob : gameData.currentSkill
    var quickTaskDisplayElement = document.getElementById("quickTaskDisplay")
    var progressBar = quickTaskDisplayElement.getElementsByClassName(taskType)[0]
    progressBar.getElementsByClassName("name")[0].textContent = currentTask.name + (taskType == "job" ? " rep " : " lvl ") + currentTask.level
    progressBar.getElementsByClassName("progressFill")[0].style.width = currentTask.xp / currentTask.getMaxXp() * 100 + "%"
}

function updateRequiredRows(data, categoryType) {
    var requiredRows = document.getElementsByClassName("requiredRow")
    for (requiredRow of requiredRows) {
        var nextEntity = null
        var category = categoryType[requiredRow.id] 
        if (category == null) {continue}
        for (i = 0; i < category.length; i++) {
            var entityName = category[i]
            if (i >= category.length - 1) break
            var requirements = gameData.requirements[entityName]
            if (requirements && i == 0) {
                if (!requirements.isCompleted()) {
                    nextEntity = data[entityName]
                    break
                }
            }

            var nextIndex = i + 1
            if (nextIndex >= category.length) {break}
            var nextEntityName = category[nextIndex]
            nextEntityRequirements = gameData.requirements[nextEntityName]

            if (!nextEntityRequirements.isCompleted()) {
                nextEntity = data[nextEntityName]
                break
            }       
        }

        if (nextEntity == null) {
            requiredRow.classList.add("hiddenTask")           
        } else {
            requiredRow.classList.remove("hiddenTask")
            var requirementObject = gameData.requirements[nextEntity.name]
            var requirements = requirementObject.requirements

            var coinElement = requiredRow.getElementsByClassName("coins")[0]
            var levelElement = requiredRow.getElementsByClassName("levels")[0]
            var evilElement = requiredRow.getElementsByClassName("evil")[0]

            coinElement.classList.add("hiddenTask")
            levelElement.classList.add("hiddenTask")
            evilElement.classList.add("hiddenTask")

            var finalText = ""
            if (data == gameData.taskData) {
                if (requirementObject instanceof EvilRequirement) {
                    evilElement.classList.remove("hiddenTask")
                    evilElement.textContent = format(requirements[0].requirement) + " evil"
                } else {
                    levelElement.classList.remove("hiddenTask")
                    for (requirement of requirements) {
                        var task = gameData.taskData[requirement.task]
                        if (task.level >= requirement.requirement) continue
                        var text = " " + requirement.task + (task instanceof Job ? " reputation " : " level ") + format(task.level) + "/" + format(requirement.requirement) + ","
                        finalText += text
                    }
                    finalText = finalText.substring(0, finalText.length - 1)
                    levelElement.textContent = finalText
                }
            } else if (data == gameData.itemData) {
                coinElement.classList.remove("hiddenTask")
                formatCoins(requirements[0].requirement, coinElement)
            }
        }   
    }
}

function updateTaskRows() {
    for (key in gameData.taskData) {
        var task = gameData.taskData[key]
        var row = document.getElementById("row " + task.name)
        row.getElementsByClassName("level")[0].textContent = task.level
        row.getElementsByClassName("xpGain")[0].textContent = format(task.getXpGain())
        row.getElementsByClassName("xpLeft")[0].textContent = format(task.getXpLeft())

        var maxLevel = row.getElementsByClassName("maxLevel")[0]
        maxLevel.textContent = task.maxLevel
        gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden")

        var progressFill = row.getElementsByClassName("progressFill")[0]
        progressFill.style.width = task.xp / task.getMaxXp() * 100 + "%"
        task == gameData.currentJob || task == gameData.currentSkill ? progressFill.classList.add("current") : progressFill.classList.remove("current")

        var valueElement = row.getElementsByClassName("value")[0]
        valueElement.getElementsByClassName("income")[0].style.display = task instanceof Job
        valueElement.getElementsByClassName("effect")[0].style.display = task instanceof Skill

        var skipSkillElement = row.getElementsByClassName("skipSkill")[0]
        skipSkillElement.style.display = task instanceof Skill && autoLearnElement.checked ? "table-cell" : "none"

        if (task instanceof Job) {
            formatCoins(task.getIncome(), valueElement.getElementsByClassName("income")[0])
        } else {
            valueElement.getElementsByClassName("effect")[0].textContent = task.getEffectDescription()
        }
    }
}

function updateItemRows() {
    for (key in gameData.itemData) {
        var item = gameData.itemData[key]
        var row = document.getElementById("row " + item.name)
        var button = row.getElementsByClassName("button")[0]
        button.disabled = gameData.coins < item.getExpense()
        var active = row.getElementsByClassName("active")[0]
        active.classList.toggle("on", gameData.currentMisc.includes(item) || item == gameData.currentProperty)
        row.getElementsByClassName("effect")[0].textContent = item.getEffectDescription()
        formatCoins(item.getExpense(), row.getElementsByClassName("expense")[0])
    }
}

function updateHeaderRows(categories) {
    for (categoryName in categories) {
        var className = removeSpaces(categoryName)
        var headerRow = document.getElementsByClassName(className)[0]
        var maxLevelElement = headerRow.getElementsByClassName("maxLevel")[0]
        gameData.rebirthOneCount > 0 ? maxLevelElement.classList.remove("hidden") : maxLevelElement.classList.add("hidden")
        var skipSkillElement = headerRow.getElementsByClassName("skipSkill")[0]
        skipSkillElement.style.display = categories == skillCategories && autoLearnElement.checked ? "table-cell" : "none"
    }
}

function updateText() {
    //Sidebar
    document.getElementById("ageDisplay").textContent = daysToYears(gameData.days)
    document.getElementById("dayDisplay").textContent = getDay()
    document.getElementById("lifespanDisplay").textContent = daysToYears(getLifespan())
    document.getElementById("pauseButton").textContent = gameData.paused ? "Play" : "Pause"

    formatCoins(gameData.coins, document.getElementById("coinDisplay"))
    setSignDisplay()
    formatCoins(getNet(), document.getElementById("netDisplay"), false)
    formatCoins(getIncome(), document.getElementById("incomeDisplay"), false)
    formatCoins(getExpense(), document.getElementById("expenseDisplay"), false)

    document.getElementById("happinessDisplay").textContent = getHappiness().toFixed(1)

    document.getElementById("evilDisplay").textContent = gameData.evil.toFixed(1)
    document.getElementById("evilGainDisplay").textContent = getEvilGain().toFixed(1)

    document.getElementById("timeWarpingDisplay").textContent = "x" + gameData.taskData["Time warping"].getEffect().toFixed(2)
    document.getElementById("timeWarpingButton").textContent = gameData.timeWarpingEnabled ? "Disable warp" : "Enable warp"

    byId("speedBoostDisplay").textContent = "x" + gameData.speedMultiplier
    document.querySelectorAll(".speed-btn").forEach(function(button) {
        var active = Number(button.dataset.speed) == gameData.speedMultiplier
        button.classList.toggle("on", active)
        button.setAttribute("aria-pressed", String(active))
    })
}

function setSignDisplay() {
    var signDisplay = document.getElementById("signDisplay")
    var netDisplay = document.getElementById("netDisplay")
    if (getIncome() > getExpense()) {
        signDisplay.textContent = "+"
        signDisplay.className = "c-income"
        netDisplay.className = "c-income"
    } else if (getExpense() > getIncome()) {
        signDisplay.textContent = "-"
        signDisplay.className = "c-expense"
        netDisplay.className = "c-expense"
    } else {
        signDisplay.textContent = ""
        signDisplay.className = "muted"
        netDisplay.className = ""
    }
}

function getNet() {
    var net = Math.abs(getIncome() - getExpense())
    return net
}

function hideEntities() {
    for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        var completed = requirement.isCompleted()
        for (element of requirement.elements) {
            if (completed) {
                element.classList.remove("hidden")
            } else {
                element.classList.add("hidden")
            }
        }
    }
}

function doCurrentTask(task) {
    task.increaseXp()
    if (task instanceof Job) {
        increaseCoins()
    }
}

function getIncome() {
    var income = 0
    income += gameData.currentJob.getIncome()
    return income
}

function increaseCoins() {
    var coins = applySpeed(getIncome())
    gameData.coins += coins
}

function daysToYears(days) {
    var years = Math.floor(days / 365)
    return years
}

function getCategoryFromEntityName(categoryType, entityName) {
    for (categoryName in categoryType) {
        var category = categoryType[categoryName]
        if (category.includes(entityName)) {
            return category
        }
    }
}

function getNextEntity(data, categoryType, entityName) {
    var category = getCategoryFromEntityName(categoryType, entityName)
    var nextIndex = category.indexOf(entityName) + 1
    if (nextIndex > category.length - 1) return null
    var nextEntityName = category[nextIndex]
    var nextEntity = data[nextEntityName]
    return nextEntity
}

function autoPromote() {
    if (!autoPromoteElement.checked) return
    var nextEntity = getNextEntity(gameData.taskData, jobCategories, gameData.currentJob.name)
    if (nextEntity == null) return
    var requirement = gameData.requirements[nextEntity.name]
    if (requirement.isCompleted()) gameData.currentJob = nextEntity
}

function checkSkillSkipped(skill) {
    var row = document.getElementById("row " + skill.name)
    var isSkillSkipped = row.getElementsByClassName("checkbox")[0].checked
    return isSkillSkipped
}

function setSkillWithLowestMaxXp() {
    var best = null
    var bestTime = Infinity

    for (var skillName in gameData.taskData) {
        var skill = gameData.taskData[skillName]
        if (!(skill instanceof Skill) || !isUnlocked(skillName) || checkSkillSkipped(skill)) continue

        var time = skill.getMaxXp() / skill.getXpGain()
        if (time < bestTime) {
            best = skill
            bestTime = time
        }
    }

    skillWithLowestMaxXp = best || gameData.taskData["Concentration"]
}

function autoLearn() {
    if (!autoLearnElement.checked || !skillWithLowestMaxXp) return
    gameData.currentSkill = skillWithLowestMaxXp
}

function yearsToDays(years) {
    var days = years * 365
    return days
}
 
function getDay() {
    var day = Math.floor(gameData.days - daysToYears(gameData.days) * 365)
    return day
}

const autoPauseDays = 365 * 1000

function increaseDays() {
    var increase = applySpeed(1)
    if (gameData.settings.autoPause && gameData.days < autoPauseDays && gameData.days + increase >= autoPauseDays) {
        gameData.paused = true
        showStatus("Auto-paused at age 1000")
    }
    gameData.days += increase
}

function format(number, decimals = 1) {

    // what tier? (determines SI symbol)
    var tier = Math.log10(number) / 3 | 0;

    // if zero, we don't need a suffix
    if(tier == 0) return number;

    // past the end of the suffix table, fall back to scientific notation
    if (tier >= units.length) return number.toExponential(2);

    // get suffix and determine scale
    var suffix = units[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add suffix
    return scaled.toFixed(decimals) + suffix;
}

// tint=false leaves the amount in the surrounding text colour (set by the element it sits in)
function formatCoins(coins, element, tint = true) {
    var amount = Math.floor(coins)
    var span = element.children[0]
    span.textContent = format(amount) + (amount == 1 ? " Spirit Stone" : " Spirit Stones")
    span.style.color = tint ? "var(--stone)" : ""
}

function getTaskElement(taskName) {
    var task = gameData.taskData[taskName]
    var element = document.getElementById(task.id)
    return element
}

function getItemElement(itemName) {
    var item = gameData.itemData[itemName]
    var element = document.getElementById(item.id)
    return element
}

function getElementsByClass(className) {
    var elements = document.getElementsByClassName(removeSpaces(className))
    return elements
}

function setLightDarkMode() {
    var body = document.getElementById("body")
    body.classList.contains("dark") ? body.classList.remove("dark") : body.classList.add("dark")
}

function removeSpaces(string) {
    var string = string.replace(/ /g, "")
    return string
}

function rebirthOne() {
    gameData.rebirthOneCount += 1

    rebirthReset()
}

function rebirthTwo() {
    gameData.rebirthTwoCount += 1
    gameData.evil += getEvilGain()

    rebirthReset()

    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]
        task.maxLevel = 0
    }    
}

function rebirthReset() {
    setTab(jobTabButton, "jobs")

    gameData.coins = 0
    gameData.days = 365 * 14
    gameData.currentJob = gameData.taskData["Beggar"]
    gameData.currentSkill = gameData.taskData["Concentration"]
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []
    gameData.martialRank = -1
    gameData.cultivationRank = -1

    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]
        if (task.level > task.maxLevel) task.maxLevel = task.level
        task.level = 0
        task.xp = 0
    }

    for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        if (requirement.completed && permanentUnlocks.includes(key)) continue
        requirement.completed = false
    }
}

function getLifespan() {
    // Lifespan will come purely from cultivation realms (not implemented yet), so for now it is the base value
    return baseLifespan
}

function isAlive() {
    var condition = gameData.days < getLifespan()
    var deathText = document.getElementById("deathText")
    if (!condition) {
        gameData.days = getLifespan()
        deathText.classList.remove("hidden")
    }
    else {
        deathText.classList.add("hidden")
    }
    return condition
}

function assignMethods() {

    for (key in gameData.taskData) {
        var task = gameData.taskData[key]
        if (task.baseData.income) {
            task.baseData = jobBaseData[task.name]
            task = Object.assign(new Job(jobBaseData[task.name]), task)
            
        } else {
            task.baseData = skillBaseData[task.name]
            task = Object.assign(new Skill(skillBaseData[task.name]), task)
        } 
        gameData.taskData[key] = task
    }

    for (key in gameData.itemData) {
        var item = gameData.itemData[key]
        item.baseData = itemBaseData[item.name]
        item = Object.assign(new Item(itemBaseData[item.name]), item)
        gameData.itemData[key] = item
    }

    for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        if (requirement.type == "task") {
            requirement = Object.assign(new TaskRequirement(requirement.elements, requirement.requirements), requirement)
        } else if (requirement.type == "coins") {
            requirement = Object.assign(new CoinRequirement(requirement.elements, requirement.requirements), requirement)
        } else if (requirement.type == "age") {
            requirement = Object.assign(new AgeRequirement(requirement.elements, requirement.requirements), requirement)
        } else if (requirement.type == "evil") {
            requirement = Object.assign(new EvilRequirement(requirement.elements, requirement.requirements), requirement)
        }

        var tempRequirement = tempData["requirements"][key]
        requirement.elements = tempRequirement.elements
        requirement.requirements = tempRequirement.requirements
        gameData.requirements[key] = requirement
    }

    gameData.currentJob = gameData.taskData[gameData.currentJob.name] || gameData.taskData["Beggar"]
    gameData.currentSkill = gameData.taskData[gameData.currentSkill.name] || gameData.taskData["Concentration"]
    gameData.currentProperty = gameData.itemData[gameData.currentProperty.name] || gameData.itemData["Homeless"]
    var newArray = []
    for (misc of gameData.currentMisc) {
        newArray.push(gameData.itemData[misc.name])
    }
    gameData.currentMisc = newArray
}

function replaceSaveDict(dict, saveDict) {
    for (key in dict) {
        if (!(key in saveDict)) {
            saveDict[key] = dict[key]
        } else if (dict == gameData.requirements) {
            if (saveDict[key].type != tempData["requirements"][key].type) {
                saveDict[key] = tempData["requirements"][key]
            }
        }
    }

    for (key in saveDict) {
        if (!(key in dict)) {
            delete saveDict[key]
        }
    }
}

var resetting = false

function saveGameData() {
    if (resetting) return
    localStorage.setItem("gameDataSave", JSON.stringify(gameData))
}

function loadGameData() {
    var gameDataSave = JSON.parse(localStorage.getItem("gameDataSave"))

    if (gameDataSave !== null) {
        replaceSaveDict(gameData, gameDataSave)
        replaceSaveDict(gameData.settings, gameDataSave.settings)
        replaceSaveDict(gameData.requirements, gameDataSave.requirements)
        replaceSaveDict(gameData.taskData, gameDataSave.taskData)
        replaceSaveDict(gameData.itemData, gameDataSave.itemData)

        gameData = gameDataSave
    }

    assignMethods()
}

function updateUI() {
    updateTaskRows()
    updateItemRows()
    updateRequiredRows(gameData.taskData, jobCategories)
    updateRequiredRows(gameData.taskData, skillCategories)
    updateRequiredRows(gameData.itemData, itemCategories)
    updateHeaderRows(jobCategories)
    updateHeaderRows(skillCategories)
    updateQuickTaskDisplay("job")
    updateQuickTaskDisplay("skill")
    hideEntities()
    updateText()  
    updateRanks()
}

function update() {
    increaseDays()
    autoPromote()
    autoLearn()
    doCurrentTask(gameData.currentJob)
    doCurrentTask(gameData.currentSkill)
    applyExpenses()
    updateUI()
}

function resetGameData() {
    resetting = true
    localStorage.removeItem("gameDataSave")
    localStorage.clear()
    location.reload()
}

function importGameData() {
    var importExportBox = document.getElementById("importExportBox")
    var data = JSON.parse(window.atob(importExportBox.value))
    gameData = data
    saveGameData()
    location.reload()
}

function exportGameData() {
    var importExportBox = document.getElementById("importExportBox")
    importExportBox.value = window.btoa(JSON.stringify(gameData))
}

//Init

createAllRows(jobCategories, "jobTable")
createAllRows(skillCategories, "skillTable")
createAllRows(itemCategories, "itemTable") 
runSafely(function() { createRankList("martialRankList", martialArtsRanks) })
runSafely(function() { createRankList("cultivationRankList", cultivationRanks) })

createData(gameData.taskData, jobBaseData)
createData(gameData.taskData, skillBaseData)
createData(gameData.itemData, itemBaseData) 

gameData.currentJob = gameData.taskData["Beggar"]
gameData.currentSkill = gameData.taskData["Concentration"]
gameData.currentProperty = gameData.itemData["Homeless"]
gameData.currentMisc = []

gameData.requirements = {
    //Other
    "Sect": new TaskRequirement(getElementsByClass("Sect"), [{task: "Concentration", requirement: 200}, {task: "Meditation", requirement: 200}]),
    "Dark magic": new EvilRequirement(getElementsByClass("Dark magic"), [{requirement: 1}]),
    "Shop": new CoinRequirement([document.getElementById("shopTabButton")], [{requirement: gameData.itemData["Tent"].getExpense() * 50}]),
    "Rebirth tab": new AgeRequirement([document.getElementById("rebirthTabButton")], [{requirement: 25}]),
    "Rebirth note 1": new AgeRequirement([document.getElementById("rebirthNote1")], [{requirement: 45}]),
    "Rebirth note 2": new AgeRequirement([document.getElementById("rebirthNote2")], [{requirement: 65}]),
    "Rebirth note 3": new AgeRequirement([document.getElementById("rebirthNote3")], [{requirement: 200}]),
    "Evil info": new EvilRequirement([document.getElementById("evilInfo")], [{requirement: 1}]),
    "Time warping info": new TaskRequirement([document.getElementById("timeWarping")], [{task: "Core Disciple", requirement: 10}]),
    "Automation": new AgeRequirement([document.getElementById("automation")], [{requirement: 20}]),
    "Quick task display": new AgeRequirement([document.getElementById("quickTaskDisplay")], [{requirement: 20}]),

    //Mortal Village
    "Beggar": new TaskRequirement([getTaskElement("Beggar")], []),
    "Farmer": new TaskRequirement([getTaskElement("Farmer")], [{task: "Beggar", requirement: 10}]),
    "Fisherman": new TaskRequirement([getTaskElement("Fisherman")], [{task: "Farmer", requirement: 10}]),
    "Miner": new TaskRequirement([getTaskElement("Miner")], [{task: "Conditioning", requirement: 10}, {task: "Fisherman", requirement: 10}]),
    "Blacksmith": new TaskRequirement([getTaskElement("Blacksmith")], [{task: "Conditioning", requirement: 30}, {task: "Miner", requirement: 10}]),
    "Merchant": new TaskRequirement([getTaskElement("Merchant")], [{task: "Bargaining", requirement: 50}, {task: "Blacksmith", requirement: 10}]),

    //Martial Arts Hall
    "Sweeper": new TaskRequirement([getTaskElement("Sweeper")], [{task: "Conditioning", requirement: 5}]),
    "Training Partner": new TaskRequirement([getTaskElement("Training Partner")], [{task: "Conditioning", requirement: 20}, {task: "Sweeper", requirement: 10}]),
    "Sparring Partner": new TaskRequirement([getTaskElement("Sparring Partner")], [{task: "Strategy", requirement: 40}, {task: "Training Partner", requirement: 10}]),
    "Hall Guard": new TaskRequirement([getTaskElement("Hall Guard")], [{task: "Conditioning", requirement: 100}, {task: "Sparring Partner", requirement: 10}]),
    "Junior Martial Instructor": new TaskRequirement([getTaskElement("Junior Martial Instructor")], [{task: "Strategy", requirement: 150}, {task: "Hall Guard", requirement: 10}]),
    "Head Martial Instructor": new TaskRequirement([getTaskElement("Head Martial Instructor")], [{task: "Conditioning", requirement: 300}, {task: "Junior Martial Instructor", requirement: 10}]),
    "First Disciple": new TaskRequirement([getTaskElement("First Disciple")], [{task: "Qi Control", requirement: 500}, {task: "Head Martial Instructor", requirement: 10}]),
    "Dojo Master": new TaskRequirement([getTaskElement("Dojo Master")], [{task: "Qi Control", requirement: 1000}, {task: "Strategy", requirement: 1000}, {task: "First Disciple", requirement: 10}]),

    //Sect
    "Outer Disciple": new TaskRequirement([getTaskElement("Outer Disciple")], [{task: "Concentration", requirement: 200}, {task: "Meditation", requirement: 200}]),
    "Inner Disciple": new TaskRequirement([getTaskElement("Inner Disciple")], [{task: "Qi Control", requirement: 400}, {task: "Outer Disciple", requirement: 10}]),
    "Core Disciple": new TaskRequirement([getTaskElement("Core Disciple")], [{task: "Qi Control", requirement: 700}, {task: "Inner Disciple", requirement: 10}]),
    "Elder": new TaskRequirement([getTaskElement("Elder")], [{task: "Qi Control", requirement: 1000}, {task: "Core Disciple", requirement: 10}]),
    "Grand Elder": new TaskRequirement([getTaskElement("Grand Elder")], [{task: "Qi Control", requirement: 1500}, {task: "Elder", requirement: 10}]),
    "Sect Master": new TaskRequirement([getTaskElement("Sect Master")], [{task: "Qi Control", requirement: 2000}, {task: "Grand Elder", requirement: 10}]),

    //Mind and Worldly
    "Concentration": new TaskRequirement([getTaskElement("Concentration")], []),
    "Productivity": new TaskRequirement([getTaskElement("Productivity")], [{task: "Concentration", requirement: 5}]),
    "Bargaining": new TaskRequirement([getTaskElement("Bargaining")], [{task: "Concentration", requirement: 20}]),
    "Meditation": new TaskRequirement([getTaskElement("Meditation")], [{task: "Concentration", requirement: 30}, {task: "Productivity", requirement: 20}]),

    //Martial Skill
    "Conditioning": new TaskRequirement([getTaskElement("Conditioning")], []),
    "Strategy": new TaskRequirement([getTaskElement("Strategy")], [{task: "Concentration", requirement: 20}]),
    "Muscle Memory": new TaskRequirement([getTaskElement("Muscle Memory")], [{task: "Concentration", requirement: 30}, {task: "Conditioning", requirement: 30}]),

    //Magic
    "Qi Control": new TaskRequirement([getTaskElement("Qi Control")], [{task: "Concentration", requirement: 200}, {task: "Meditation", requirement: 200}]),
    "Time warping": new TaskRequirement([getTaskElement("Time warping")], [{task: "Core Disciple", requirement: 10}]),

    //Dark magic
    "Dark influence": new EvilRequirement([getTaskElement("Dark influence")], [{requirement: 1}]),
    "Evil control": new EvilRequirement([getTaskElement("Evil control")], [{requirement: 1}]),
    "Intimidation": new EvilRequirement([getTaskElement("Intimidation")], [{requirement: 1}]),
    "Demon training": new EvilRequirement([getTaskElement("Demon training")], [{requirement: 25}]),
    "Blood meditation": new EvilRequirement([getTaskElement("Blood meditation")], [{requirement: 75}]),
    "Demon's wealth": new EvilRequirement([getTaskElement("Demon's wealth")], [{requirement: 500}]),

    //Properties
    "Homeless": new CoinRequirement([getItemElement("Homeless")], [{requirement: 0}]),
    "Tent": new CoinRequirement([getItemElement("Tent")], [{requirement: 0}]),
    "Wooden hut": new CoinRequirement([getItemElement("Wooden hut")], [{requirement: gameData.itemData["Wooden hut"].getExpense() * 100}]),
    "Cottage": new CoinRequirement([getItemElement("Cottage")], [{requirement: gameData.itemData["Cottage"].getExpense() * 100}]),
    "House": new CoinRequirement([getItemElement("House")], [{requirement: gameData.itemData["House"].getExpense() * 100}]),
    "Large house": new CoinRequirement([getItemElement("Large house")], [{requirement: gameData.itemData["Large house"].getExpense() * 100}]),
    "Small palace": new CoinRequirement([getItemElement("Small palace")], [{requirement: gameData.itemData["Small palace"].getExpense() * 100}]),
    "Grand palace": new CoinRequirement([getItemElement("Grand palace")], [{requirement: gameData.itemData["Grand palace"].getExpense() * 100}]),

    //Misc
    "Book": new CoinRequirement([getItemElement("Book")], [{requirement: 0}]),
    "Dumbbells": new CoinRequirement([getItemElement("Dumbbells")], [{requirement: gameData.itemData["Dumbbells"].getExpense() * 100}]),
    "Personal squire": new CoinRequirement([getItemElement("Personal squire")], [{requirement: gameData.itemData["Personal squire"].getExpense() * 100}]),
    "Steel longsword": new CoinRequirement([getItemElement("Steel longsword")], [{requirement: gameData.itemData["Steel longsword"].getExpense() * 100}]),
    "Butler": new CoinRequirement([getItemElement("Butler")], [{requirement: gameData.itemData["Butler"].getExpense() * 100}]),
    "Sapphire charm": new CoinRequirement([getItemElement("Sapphire charm")], [{requirement: gameData.itemData["Sapphire charm"].getExpense() * 100}]),
    "Study desk": new CoinRequirement([getItemElement("Study desk")], [{requirement: gameData.itemData["Study desk"].getExpense() * 100}]),
    "Library": new CoinRequirement([getItemElement("Library")], [{requirement: gameData.itemData["Library"].getExpense() * 100}]), 
}

tempData["requirements"] = {}
for (key in gameData.requirements) {
    var requirement = gameData.requirements[key]
    tempData["requirements"][key] = requirement
}

loadGameData()
runSafely(applyCollapsedCategories)
runSafely(initUI)

setCustomEffects()
addMultipliers()

document.getElementById("body").classList.add("dark")

setTab(jobTabButton, "jobs")

update()
setInterval(update, 1000 / updateSpeed)
setInterval(saveGameData, 3000)
setInterval(setSkillWithLowestMaxXp, 1000)