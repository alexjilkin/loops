import {sampleRate, bufferSize} from './consts'

export const getInputStreamByType = (type, onAudio, deviceId) => {
    if (type === 'browser') {
        return getBrowserInput(onAudio, deviceId)
    }
}

export const getBrowserInput = async (onAudio, deviceId) => {
    const recordContext = new AudioContext({sampleRate});

    const stream = await navigator.mediaDevices.getUserMedia({ audio: {deviceId}, video: false })

    const source = recordContext.createMediaStreamSource(stream);
    const processor = recordContext.createScriptProcessor(bufferSize, 1, 1);

    source.connect(processor);
    processor.connect(recordContext.destination);

    processor.onaudioprocess = ({inputBuffer}) => onAudio(inputBuffer)

    return () => recordContext.close()
}