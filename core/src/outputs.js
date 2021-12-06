
import {bufferSize, sampleRate} from './consts'
import {Subject} from 'rxjs'

let master;
let playbackMaster;
const subscribers = []

let _loop;
let _nextLoop

export const onTap$ = new Subject()
export const value$ = new Subject()
export const onNewLoop$ = new Subject()

export const browserLoopPlay = (loop, bpm) => {
    const samplesPerTap = Math.floor(sampleRate * 60 / bpm)

    _loop = loop;
    if (!master) {
        master = new AudioContext({sampleRate});
    }   

    const buffer = master.createBuffer(1, bufferSize, sampleRate)
    const source = master.createScriptProcessor(bufferSize, 1, 1);

    let index = 0;

    const createBuffer = (output) => {
        for (let i = 0; i < buffer.length; i++) {
            const loopIndex = (i + index) % _loop.length
            if (loopIndex % samplesPerTap === 0) {
                onTap$.next((loopIndex / samplesPerTap) + 1)
            }

            if (loopIndex === 0) {
                if (_nextLoop) {
                    _loop = _nextLoop
                }
                
                onNewLoop$.next()
                break;
            }

            const value = _loop[loopIndex]
            
            value$.next(value)
            output[i] = value
        }

        index += buffer.length
    }

    source.buffer = buffer;
    source.connect(master.destination);

    source.addEventListener('audioprocess', (e) => {
        createBuffer(e.outputBuffer.getChannelData(0))
    })
}

export const playFromGenerator = (generator) => {
    if (!playbackMaster) {
        playbackMaster = new AudioContext({sampleRate});
    }
    
    const buffer = playbackMaster.createBuffer(1, bufferSize, sampleRate)
    const source = playbackMaster.createScriptProcessor(bufferSize, 1, 1);

    const createBuffer = (output) => {
        for (let i = 0; i < buffer.length; i++) {
            let value;
            while (!value) {
                value = generator.next().value
            }
            
            value$.next(value)
            output[i] = value
        }
    }

    source.buffer = buffer;
    source.connect(playbackMaster.destination);

    source.addEventListener('audioprocess', (e) => {
        createBuffer(e.outputBuffer.getChannelData(0))
    })
}

export const setNextLoop = (nextLoop) => {
    _nextLoop = nextLoop
}
