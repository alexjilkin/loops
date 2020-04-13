import React, {useState, useCallback, useEffect, useRef} from 'react';
import './App.scss'
import {value$} from '@loops/core'
import Oscilloscope from './components/Oscilloscope'
import Settings from './components/Settings';
import useKeyboard from './hooks/useKeyboard'
import Click from './assets/korg-click.wav'
import CogIcon from './assets/cog.svg'
import useLoops from './hooks/useLoops'

let loopsEngine;
const lastInputId = localStorage.getItem('inputId');

const App = () => {
  const [isRecording, setIsRecording] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [bpm, setBpm] = useState(null)
  const [taps, setTaps] = useState(0)
  const clickAudioRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    loopsEngine.isRecording$.subscribe(setIsRecording)
    loopsEngine.getTap().subscribe(playTap)
    if (lastInputId) {
      loopsEngine.setInput(lastInputId)
    }
  }, [])

  const playTap = (beatCount) => {
    clickAudioRef.current.currentTime = 0

    if (beatCount === 1) {
      clickAudioRef.current.volume = 0.3
    } else {
      clickAudioRef.current.volume = 0.1
    }
    
    clickAudioRef.current.play()
  }

  const handleTap = useCallback(() => {
    const tapsCount = loopsEngine.tap()
    buttonRef.current.focus()
    setTaps(tapsCount)
  })

  useKeyboard(handleTap)

  const startRecord = useCallback(async (bpm) => {

    setBpm(bpm)
  })

  const stopRecord = async () => {
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

  loopsEngine = useLoops(startRecord, stopRecord)

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
          <Oscilloscope value$={value$} />
        </div>
      </div>
      }

    </div>
  );
}

export default App;