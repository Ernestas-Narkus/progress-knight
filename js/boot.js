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