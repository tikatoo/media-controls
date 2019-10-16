(function() {
    'use strict'

    let mc
    try {
        mc = new MediaControls('monstercat')
    } catch (exc) {
        console.log(exc)
        return
    }

    function findPlaying() {
        let pauseBtn = document.querySelector('button.active[role=play-song]')
        let td = pauseBtn.parentElement
        let tr = td.parentElement

        let elements = tr.querySelectorAll('td.longer-width')

        let author = []
        let authorNodes = elements[2].querySelectorAll('span.artist')
        for (let i = 0; i < authorNodes.length; i += 1) {
            let text = authorNodes[i].textContent.trim()
            if (text.length > 0) {
                author.push(text)
            }
        }

        return {
            author,
            title: elements[0].textContent.trim(),
            collection: elements[1].textContent.trim(),
        }
    }

    let rolePlay = document.querySelector('[role=play]')

    let obs = new MutationObserver((mutations, observer) => {
        for (let mut of mutations) {
            if (mut.type == 'attributes' && mut.attributeName == 'class') {
                if (mut.target.classList.contains('fa-pause')) {
                    mc.activeMedia = findPlaying()
                    mc.mediaPlaying()
                    break
                } else if (mut.target.classList.contains('fa-play')) {
                    mc.mediaPausing()
                    break
                }
            }
        }
    })

    obs.observe(rolePlay, { attributes: true, attributeFilter: ['class'] })

    document.addEventListener('close', (ev) => {
        mc.mediaStopping()
    })

    if (rolePlay.classList.contains('fa-pause')) {
        mc.activeMedia = findPlaying()
        mc.mediaPlaying()
    }
}())
