function newTutorialFunctions() {
    thisObject = {
        play: play
    }
    const HEIGHT = 800
    const WIDTH = 500
    const MARGIN = 300
    return thisObject

    function play(node) {
        let docAppDiv = document.getElementById('tutorialStepDiv')
        tutorialPosition = {
            x: MARGIN,
            y: (browserCanvas.height - HEIGHT) / 2
        }
     
        docAppDiv.style = '   ' + 
        'position:fixed; top:' + tutorialPosition.y + 'px; ' + 
        'left:' + tutorialPosition.x + 'px; ' + 
        'width: ' + WIDTH + 'px;' +
        'height: ' + HEIGHT + 'px;' + 
        'z-index:1;'
    }
}
