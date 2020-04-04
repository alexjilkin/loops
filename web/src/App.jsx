import React, {useState, useCallback, useEffect, useRef} from 'react';
import './App.scss'
import {Loops, subscribe} from '@loops/core'
import Oscilloscope from './Oscilloscope'
import Settings from './Settings';

import CogIcon from './assets/cog.svg'

const loopsEngine = new Loops('browser');
var lastInputId = localStorage.getItem('inputId');

const App = () => {
  const [stopRecording, _setStopRecording] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const stopRecordingRef = useRef(stopRecording)

  const setStopRecording = (value) => {
    stopRecordingRef.current = value;
    _setStopRecording(() => value);
  }
  useEffect(() => {
    if (lastInputId) {
      loopsEngine.setInput(lastInputId)
    }

    document.addEventListener('keydown', handleKeyboard)
  }, [])

  const handleRecordingClick = useCallback(() => {
    if (!stopRecordingRef.current) {
      startRecord()
    } else {
      stopRecord()
    }
  }, [stopRecording])

  const startRecord = async () => {
    const callback = await loopsEngine.addRecording()
    setStopRecording(callback)
  }

  const stopRecord = async () => {
    await stopRecordingRef.current()
    setStopRecording(undefined)
  }

  const handleKeyboard = (e) => {
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
      <div styleName="settings" onClick={handleSettingsClick}>
        <img src={CogIcon} />
      </div>
      {isSettingsOpen ? 
        <Settings getInputs={loopsEngine.getInputs} onInputSelect={handleInputChange} /> :
      <div>
        <button onClick={handleRecordingClick} styleName={`button ${stopRecording ? 'stop' : ''}`}>
          {stopRecording ? 'Stop ' : 'Start '}
        </button>
        <div styleName="output-wave">
          <Oscilloscope subscribe={subscribe} />
        </div>
      </div>
      }

    </div>
  );
}

export default App;