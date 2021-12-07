import React, {useRef, useEffect, useCallback, useState} from 'react'
import {Amp} from '@loops/core'
import {useDelay, useLowpass} from '@jsynth/core/modules'
import {sampleRate} from '@loops/core'
import Switch from '@material-ui/core/Switch'
import Slider from '@material-ui/core/Slider'
import './Amp.scss'

export default ({loopsEngine, inputId}) => {
    const [isTubeOn, setIsOn] = useState(true)
    const [isDelayOn, setIsDelayOn] = useState(false)
    const [isLowpassOn, setIsLowpassOn] = useState(false)

    const [amp] = useAmp(inputId)
    const [delayTransform, time, setTime, depth, setDepth, gain, setGain] = useDelay({time: 0.2, depth: 5, gain: 0.5}, sampleRate)
    const [lowpassTransform, lowpassFrequency, setLowpassFrequency] = useLowpass(undefined, sampleRate)

    const [distortion, setDistortion] = useState(2.2)
    useEffect(() => {
      loopsEngine.addMiddleware(amp.getTransferFunction())
    }, [])

    useEffect(() => {
      amp.setR(distortion)
    }, [distortion])

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

    const handleLowpassToggle = useCallback(() => {
      setIsLowpassOn((isOn) => {
        if (!isLowpassOn) {
          loopsEngine.addMiddleware(lowpassTransform)
        } else {
          loopsEngine.removeMiddleware(lowpassTransform)
        }
        return !isOn
      })
    }, [isLowpassOn, loopsEngine])

    return (
      <div>
        <div styleName="container">
          <div styleName="effects">
            <div styleName="effect">
            <div styleName="title">Amp </div>
              <Switch color="primary" checked={isTubeOn} onChange={handleAmpToggle}/>
              <Slider min={0.5} max={10} value={distortion} onChange={(e, v) => setDistortion(v)} aria-labelledby="continuous-slider" />
            </div>
            <div styleName="effect" >
              <div styleName="title">Delay </div>
              <Switch color="primary" checked={isDelayOn} onChange={handleDelayToggle} />
              <Slider step={0.1} min={0.1} max={2} value={time} onChange={(e, v) => setTime(v)} aria-labelledby="continuous-slider" />
            </div>
            <div styleName="effect" >
              <div styleName="title">Lowpass filter</div>
              <Switch color="primary" checked={isLowpassOn} onChange={handleLowpassToggle} />
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