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

var skillWithLowestMaxXp = null

const autoPromoteElement = document.getElementById("autoPromote")
const autoLearnElement = document.getElementById("autoLearn")

const jobTabButton = document.getElementById("jobTabButton")

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

requirements = buildRequirements()

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