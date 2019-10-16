from dataclasses import dataclass
from enum import Enum, auto
from pathlib import Path
from typing import Dict, List, Optional

from asyncio import create_task
from aiohttp import web
from aiofiles import open as asyncopen


class State(Enum):
    hello = auto()
    stop = auto()
    play = auto()
    pause = auto()


@dataclass
class Source:
    name: str
    state: State

    title: Optional[str] = None
    author: Optional[List[str]] = None
    collection: Optional[str] = None

    async def update_file(self):
        path = basepath / self.name
        async with asyncopen(path / 'title.txt', 'w') as wf:
            if self.state == State.play and self.title is not None:
                await wf.write(self.title)
        async with asyncopen(path / 'author.txt', 'w') as wf:
            if self.state == State.play and self.author is not None:
                await wf.write(', '.join(self.author))
        async with asyncopen(path / 'collection.txt', 'w') as wf:
            if self.state == State.play and self.collection is not None:
                await wf.write(self.collection)


basepath = Path('media-info')


routes = web.RouteTableDef()

@routes.get('/media-controls')
async def ws_handler(request):

    ws = web.WebSocketResponse()
    await ws.prepare(request)

    source: Optional[Source] = None

    async for msg in ws:
        if msg.type == web.WSMsgType.text:
            data = msg.json()
            print(data)

            state = State[data['state']]
            if state == State.hello:
                source = Source(data['source'], State.stop)
                (basepath / source.name).mkdir(parents=True, exist_ok=True)
                await ws.send_json({'state': 'hello'})

            else:
                source.state = state
                source.title = data.get('title', None)
                source.author = data.get('author', None)
                source.collection = data.get('collection', None)

            create_task(source.update_file())

    source.state = State.stop
    await source.update_file()

    return ws


app = web.Application()
app.add_routes(routes)
web.run_app(app, port=8190)
