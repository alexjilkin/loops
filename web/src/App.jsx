import React, {useState, useCallback, useEffect, useRef} from 'react';
import './App.scss'
import {Loops, subscribe} from '@loops/core'
import Oscilloscope from './Oscilloscope'
import Settings from './Settings';
import Click from './assets/korg-click.wav'
import CogIcon from './assets/cog.svg'

const loopsEngine = new Loops('browser');
var lastInputId = localStorage.getItem('inputId');

const App = () => {
  const [isRecording, setIsRecording] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [bpm, setBpm] = useState(null)
  const [taps, setTaps] = useState(0)
  const clickAudioRef = useRef(null)

  useEffect(() => {
    if (lastInputId) {
      loopsEngine.setInput(lastInputId)
    }
    loopsEngine.subscribeToClick(handleClick)
    document.addEventListener('keydown', handleKeyboard)
    document.addEventListener('keyup', () => {
      document.addEventListener('keydown', handleKeyboard)
    })

  }, [])

  const handleRecordingClick = useCallback(() => {
    const tapsCount = loopsEngine.tap(startRecord, stopRecord)
    setTaps(tapsCount)
  })

  const handleClick = () => {
    clickAudioRef.current.currentTime = 0
    clickAudioRef.current.play()
  }

  const startRecord = useCallback(async (bpm) => {
    setIsRecording(true)
    setBpm(bpm)
  })

  const stopRecord = async () => {
    setIsRecording(false)
  }

  const handleKeyboard = (e) => {
    document.removeEventListener('keydown', handleKeyboard)

    if(event.code === 'Space') {
      handleRecordingClick()
    }
  }

  const handleSettingsClick = useCallback(() => {
    setIsSettingsOpen(!isSettingsOpen)
  }, [isSettingsOpen])

  const handleInputChange = useCallback((inputId) => {
    loopsEngine.setInput(inputId)
    localStorage.setItem('inputId', inputId);
    setIsSettingsOpen(false)
  })

  return (
    <div styleName="container">
      <audio src={Click} ref={clickAudioRef}></audio>
      <div styleName="settings" onClick={handleSettingsClick}>
        <img src={CogIcon} />
      </div>
      {isSettingsOpen ? 
        <Settings getInputs={loopsEngine.getInputs} onInputSelect={handleInputChange} /> :
      <div>
      
        <button onClick={handleRecordingClick} styleName={`button ${isRecording ? 'stop' : ''}`}> 
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