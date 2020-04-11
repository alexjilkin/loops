
export const getInputStreamByType = (type, onAudio, deviceId) => {
    if (type === 'browser') {
        return getBrowserInput(onAudio, deviceId)
    }
}

