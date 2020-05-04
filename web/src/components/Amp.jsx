import React, {useRef, useEffect, useCallback, useState} from 'react'
import {Amp} from '@loops/core'
import './Amp.scss'

export default ({loopsEngine, inputId}) => {

    const [isPlaybackOn, setIsPlaybackOn] = useState(false)
    const [amp] = useAmp(inputId)

    useEffect(() => {
      loopsEngine.addMiddleware(amp.getTransferFunction())
    }, [])
    const handlePlayback = useCallback(() => {
      setIsPlaybackOn((isPlaybackOn) => {
        if (!isPlaybackOn) {
          amp.initRecording().then(() => {
            amp.monitor()
          })
        } else {
          amp.stopMonitor()
        }
        return !isPlaybackOn
      })
    }, [isPlaybackOn])

    return (
      <div>
      Amp
        <div styleName="container">
          <div styleName="button" onClick={handlePlayback}>
            {isPlaybackOn ? 'On' : 'Off'} 
          </div>
        </div>
      </div>
    )
}


const useAmp = (inputId) => {
  const amp = useRef(new Amp(inputId))

  return [amp.current]
}