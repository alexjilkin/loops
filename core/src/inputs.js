import {sampleRate, bufferSize} from './consts'
let _recordContext
let _stream

export const getInputStreamByType = (type, onAudio, deviceId) => {
    if (type === 'browser') {
        return getBrowserInput(onAudio, deviceId)
    }
}

export const initBrowserInput = (deviceId) => {
    navigator.mediaDevices.getUserMedia({audio: {deviceId, sampleRate}, video: false })
        .then(stream => _stream = stream)
    console.log('init browser input')
}

export const getBrowserInput = async (onAudio) => {
    _recordContext = new AudioContext({sampleRate});
    const source = _recordContext.createMediaStreamSource(_stream);
    
    const processor = _recordContext.createScriptProcessor(bufferSize, 1, 1);

    source.connect(processor);
    processor.connect(_recordContext.destination);

    processor.onaudioprocess = ({inputBuffer}) => onAudio(inputBuffer)

    return () => _recordContext.close()
}