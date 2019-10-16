
class MediaControls {
    constructor(sourceName, send = null) {
        this.sourceName = sourceName
        this.activeMedia = null

        if (send == null) {
            let port = browser.runtime.connect()
            port.onMessage.addListener((msg) => {
                this.receive(msg)
            })
            port.onDisconnect.addListener(() => {
                this.send = () => {}
            })
            this.send = (msg) => port.postMessage(msg)
        }
    }

    receive(msg) {
        if (msg == 'open') {
            this.send({ state: 'hello', source: this.sourceName })
        } else if (msg == 'error') {
            console.log(`MediaControls received error (source ${this.sourceName})`)
            this.send = () => {}
        } else {
            // TODO
        }
    }

    mediaPlaying(title, author, collection) {
        if (title != null) {
            this.activeMedia = {title, author, collection}
        } else if (this.activeMedia == null) {
            throw 'no media to play!'
        }

        if (typeof this.activeMedia.author == 'string') {
            this.activeMedia.author = [this.activeMedia.author]
        }

        this.send({ state: 'play', ...this.activeMedia })
    }

    mediaPausing() {
        this.send({ state: 'pause', ...this.activeMedia })
    }

    mediaStopping() {
        this.activeMedia = null
        this.send({ state: 'stop' })
    }
}
