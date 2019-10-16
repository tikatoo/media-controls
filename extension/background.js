
browser.runtime.onConnect.addListener((port) => {
    let socket = new WebSocket('ws://localhost:8190/media-controls')

    socket.addEventListener('open', (ev) => {
        port.postMessage('open')
    })

    socket.addEventListener('close', (ev) => {
        port.disconnect()
    })

    socket.addEventListener('error', (ev) => {
        port.postMessage('error')
    })

    socket.addEventListener('message', (ev) => {
        port.postMessage(JSON.parse(ev.data))
    })

    port.onDisconnect.addListener(() => {
        socket.close()
    })

    port.onMessage.addListener((msg) => {
        socket.send(JSON.stringify(msg))
    })
})
