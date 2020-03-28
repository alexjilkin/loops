
import {bufferSize, sampleRate} from './consts'
let master;
const subscribers = []

export const play = (loop) => {
    if (!master) {
        master = new AudioContext({sampleRate});
    }

    const buffer = master.createBuffer(1, bufferSize, sampleRate)
    const source = master.createScriptProcessor(bufferSize, 1, 1);

    let index = 0;

    const createBuffer = (output) => {
        for (let i = 0; i < buffer.length; i++) {
            const value = loop[(i + index) % loop.length]
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

export const subscribe = (callback) => {
    const index = subscribers.length
    subscribers.push(callback)

    return () => subscribers = [...subscribers.slice(0, index - 1), subscribers.slice(index)]
}