
import {bufferSize, sampleRate} from './consts'
let master;
const subscribers = []

let _loop;
let _nextLoop
export const browserPlay = (loop) => {
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
            if (loopIndex === 0 && _nextLoop) {
                _loop = _nextLoop
            }

            const value = _loop[loopIndex]

            subscribers.forEach(callback => callback(i, value))
            
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

export const subscribe = (callback) => {
    const index = subscribers.length
    subscribers.push(callback)

    return () => subscribers = [...subscribers.slice(0, index - 1), subscribers.slice(index)]
}