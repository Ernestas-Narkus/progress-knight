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

// The one-line realm readouts in the player card on the left
function updateRealmLine(id, realms, index, emptyText) {
    var element = byId(id)
    var name = index >= 0 ? realms[index] : emptyText
    element.textContent = name
    element.title = name
}

function updateRanks() {
    updateRankList("martialRankList", "martialRankDisplay", martialArtsRanks, gameData.martialRank, "Untrained")
    updateRankList("cultivationRankList", "cultivationRankDisplay", cultivationRanks, gameData.cultivationRank, "Mortal")
    updateRealmLine("martialRealmDisplay", martialArtsRanks, gameData.martialRank, "Untrained")
    updateRealmLine("cultivationRealmDisplay", cultivationRanks, gameData.cultivationRank, "Mortal")
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

var statusTimer = null
function showStatus(text) {
    var element = byId("statusMessage")
    element.textContent = text
    clearTimeout(statusTimer)
    statusTimer = setTimeout(function() { element.textContent = "" }, 4000)
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
            var entityRequirement = requirements[entityName]
            if (entityRequirement && i == 0) {
                if (!entityRequirement.isCompleted()) {
                    nextEntity = data[entityName]
                    break
                }
            }

            var nextIndex = i + 1
            if (nextIndex >= category.length) {break}
            var nextEntityName = category[nextIndex]
            nextEntityRequirements = requirements[nextEntityName]

            if (!nextEntityRequirements.isCompleted()) {
                nextEntity = data[nextEntityName]
                break
            }       
        }

        if (nextEntity == null) {
            requiredRow.classList.add("hiddenTask")           
        } else {
            requiredRow.classList.remove("hiddenTask")
            var requirementObject = requirements[nextEntity.name]
            var requirementList = requirementObject.requirements

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
                    evilElement.textContent = format(requirementList[0].requirement) + " evil"
                } else {
                    levelElement.classList.remove("hiddenTask")
                    for (requirement of requirementList) {
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
                formatCoins(requirementList[0].requirement, coinElement)
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

function hideEntities() {
    for (key in requirements) {
        var requirement = requirements[key]
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
    var deathText = document.getElementById("deathText")
    deathText.classList.toggle("hidden", isAlive())
    updateText()  
    updateRanks()
}
