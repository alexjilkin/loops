import React, {useState, useCallback, useEffect, useRef} from 'react';
import './App.scss'
import {subscribe} from '@loops/core'
import Oscilloscope from './components/Oscilloscope'
import Settings from './components/Settings';
import useKeyboard from './hooks/useKeyboard'
import Click from './assets/korg-click.wav'
import CogIcon from './assets/cog.svg'
import useLoops from './hooks/useLoops'

const App = () => {
  const [isRecording, setIsRecording] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [bpm, setBpm] = useState(null)
  const [taps, setTaps] = useState(0)
  const clickAudioRef = useRef(null)
  const buttonRef = useRef(null)

  const playTap = () => {
    clickAudioRef.current.currentTime = 0
    clickAudioRef.current.volume = 0.3
    clickAudioRef.current.play()
  }

  const handleTap = useCallback(() => {
    const tapsCount = loopsEngine.tap(startRecord, stopRecord)
    buttonRef.current.focus()
    setTaps(tapsCount)
  })

  const loopsEngine = useLoops(playTap)
  useKeyboard(handleTap)

  const startRecord = useCallback(async (bpm) => {
    setIsRecording(true)
    setBpm(bpm)
  })

  const stopRecord = async () => {
    setIsRecording(false)
  }

  const handleClick = (e) => {
    // If its not keyboard
    if(event.screenX !== 0 && !event.screenY !== 0) {
      handleTap()
    }
  }

  const handleSettingsClick = useCallback(() => {
    setIsSettingsOpen(!isSettingsOpen)
  }, [isSettingsOpen])


  return (
    <div styleName="container">
      <audio src={Click} ref={clickAudioRef}></audio>
      <div styleName="settings" onClick={handleSettingsClick}>
        <img src={CogIcon} />
      </div>
      {isSettingsOpen ? 
        <Settings loopsEngine={loopsEngine} onSettingsToggle={handleSettingsClick}/> :
      <div>
      
        <button ref={buttonRef} onClick={handleClick} styleName={`button ${isRecording ? 'stop' : ''}`}> 
          {isRecording ? 'Stop ' : 'Tap '}
        </button>
        <div styleName="taps">
          {
            Array.from({length: taps}).map((v, i) => (
              <div key={i} styleName="tap"></div>
            )) 
          }
        </div>
        <div styleName="bpm">
          {bpm && `BPM: ${bpm}`}
         </div>
        <div styleName="output-wave">
          <Oscilloscope subscribe={subscribe} />
        </div>
      </div>
      }

    </div>
  );
}

export default App;