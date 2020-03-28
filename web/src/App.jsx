import React, {useState} from 'react';
import './App.scss'
import {addRecording, subscribe} from '@loops/core'
import Oscilloscope from './Oscilloscope'

const App = () => {
  const [stopRecording, setStopRecording] = useState(null)

  const handleRecordingClick = () => {
    if (!stopRecording) {
      startRecord()
    } else {
      stopRecord()
    }
  }

  const startRecord = () => {
    const callback = addRecording()
    setStopRecording(() => callback)
  }

  const stopRecord = () => {
    stopRecording()
    setStopRecording(undefined)
  }

  return (
    <div styleName="container">
      <button onClick={handleRecordingClick} styleName={`button ${stopRecording ? 'stop' : ''}`}>
        {stopRecording ? 'Stop ' : 'Start '}
      </button>
      <Oscilloscope subscribe={subscribe} />
    </div>
  );
}

export default App;