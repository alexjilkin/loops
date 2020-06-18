import React, {useRef, useEffect, useCallback, useState} from 'react'
import {Amp} from '@loops/core'
import {useDelay} from '@jsynth/core/modules'
import {sampleRate} from '@loops/core'
import Switch from '@material-ui/core/Switch'
import './Amp.scss'

export default ({loopsEngine, inputId}) => {
    const [isTubeOn, setIsOn] = useState(true)
    const [isDelayOn, setIsDelayOn] = useState(false)
    const [amp] = useAmp(inputId)
    const [delayTransform, frequency, setFrequency] = useDelay(undefined, sampleRate)

    useEffect(() => {
      loopsEngine.addMiddleware(amp.getTransferFunction())
    }, [])

    const handleAmpToggle = useCallback(() => {
      setIsOn((isTubeOn) => {
        if (!isTubeOn) {
          loopsEngine.addMiddleware(amp.getTransferFunction())
        } else {
          loopsEngine.removeMiddleware(amp.getTransferFunction())
        }
        return !isTubeOn
      })
   }, [isTubeOn, loopsEngine])

    const handleDelayToggle = useCallback(() => {
      setIsDelayOn((isOn) => {
        if (!isDelayOn) {
          loopsEngine.addMiddleware(delayTransform)
        } else {
          loopsEngine.removeMiddleware(delayTransform)
        }
        return !isOn
      })
    }, [isDelayOn, loopsEngine])

    return (
      <div>
        <div styleName="container">
          <div styleName="effects">
            <div styleName="effect">
            <div styleName="title">Overdrive </div>
              <Switch color="primary" checked={isTubeOn} onChange={handleAmpToggle}/>
            </div>
            <div styleName="effect" >
              <div styleName="title">Delay </div>
              <Switch color="primary" checked={isDelayOn} onChange={handleDelayToggle} />
            </div>
          </div>
          
        </div>
      </div>
    )
}


const useAmp = (inputId) => {
  const amp = useRef(new Amp(inputId))

  return [amp.current]
}