var requirements = {}

function buildRequirements() {
    return {
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
}