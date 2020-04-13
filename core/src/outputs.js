
import {bufferSize, sampleRate} from './consts'
import {Subject} from 'rxjs'

let master;
const subscribers = []

let _loop;
let _nextLoop

export const tap$ = new Subject()
export const value$ = new Subject()
export const newLoop$ = new Subject()

export const browserPlay = (loop, bpm, onTap) => {
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
                tap$.next((loopIndex / samplesPerTap) + 1)
            }

            if (loopIndex === 0) {
                if (_nextLoop) {
                    _loop = _nextLoop
                }
                
                newLoop$.next()
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

export const updateLoop = (nextLoop) => {
    _nextLoop = nextLoop
}
