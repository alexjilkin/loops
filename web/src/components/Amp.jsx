import React, {useRef, useEffect, useCallback, useState} from 'react'
import {Amp} from '@loops/core'
import {useDelay} from '@jsynth/core/modules'
const delay = new Delay()

import './Amp.scss'

export default ({loopsEngine, inputId}) => {
    const [isOn, setIsOn] = useState(false)
    const [amp] = useAmp(inputId)
    const [delayTransform, frequency, setFrequency] = useDelay()

    useEffect(() => {
      loopsEngine.addMiddleware(amp.getTransferFunction())
      loopsEngine.addMiddleware(delayTransform)
    }, [])

    const handleToggle = useCallback(() => {
      setIsOn((isOn) => {
        if (!isOn) {
           loopsEngine.addMiddleware(amp.getTransferFunction())
        } else {
          // remove
        }
        return !isOn
      })
    }, [isOn])

    return (
      <div>
      Amp
        <div styleName="container">
          <div styleName="button" onClick={handleToggle}>
            {isOn ? 'On' : 'Off'} 
          </div>
        </div>
      </div>
    )
}


const useAmp = (inputId) => {
  const amp = useRef(new Amp(inputId))

  return [amp.current]
}