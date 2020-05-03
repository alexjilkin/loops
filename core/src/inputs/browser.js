import {sampleRate, bufferSize} from '../consts'
let _recordContext
let _stream

export const getInputs = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(device => device.kind === 'audioinput');
}

export const initBrowserInput = (deviceId) => {
    console.log('init browser input')
    
    return navigator.mediaDevices.getUserMedia({audio: {deviceId, sampleRate}, video: false })
        .then(stream => _stream = stream)
}

export const getBrowserInput = async (onAudio) => {
    _recordContext = new AudioContext({sampleRate});
    const source = _recordContext.createMediaStreamSource(_stream);
    
    const processor = _recordContext.createScriptProcessor(bufferSize, 4, 4);

    source.connect(processor);
    processor.connect(_recordContext.destination);

    processor.onaudioprocess = ({inputBuffer}) => onAudio(inputBuffer)

    return () => _recordContext.close()
}