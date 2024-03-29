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
            console.log(sampleRate)
            _recordContext = new AudioContext({sampleRate});
            source = _recordContext.createMediaStreamSource(stream);
            processor = _recordContext.createScriptProcessor(bufferSize, 1, 1);

            source.connect(processor);
            processor.connect(_recordContext.destination);

            return _recordContext;
        })
}

export const getSource = () => {
    return source
}

export const getBrowserInput = (onAudio) => {
    processor.onaudioprocess = ({inputBuffer}) => onAudio(inputBuffer)
    
    return () => _recordContext.close()
}