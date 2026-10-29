const updateSpeed = 20
const baseLifespan = 365 * 70
const baseGameSpeed = 4

const permanentUnlocks = ["Scheduling", "Shop", "Automation", "Quick task display"]

const autoPauseDays = 365 * 1000

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