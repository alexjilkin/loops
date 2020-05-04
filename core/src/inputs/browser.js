import {sampleRate, bufferSize} from '../consts'
let _recordContext

let source
let processor

export const getInputs = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(device => device.kind === 'audioinput');
}

export const initBrowserInput = (deviceId) => {
    console.log('init browser input')
    
    return navigator.mediaDevices.getUserMedia({audio: {deviceId, sampleRate}, video: false })
        .then(stream => {
            source = _recordContext.createMediaStreamSource(stream);
    
            processor = _recordContext.createScriptProcessor(bufferSize, 1, 1);
        })
}

export const getBrowserInput = async (onAudio) => {
    _recordContext = new AudioContext({sampleRate});


    source.connect(processor);
    processor.connect(_recordContext.destination);

    processor.onaudioprocess = ({inputBuffer}) => onAudio(inputBuffer)

    return () => _recordContext.close()
}