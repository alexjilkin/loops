import React, {useState} from 'react';
import './App.scss'
import {start, stop, getRecording, play} from '@loops/core'

const App = () => {
  const [isRecording, setIsRecording] = useState(false)

  const handleRecordingClick = () => {
    if (!isRecording) {
      startRecord()
    } else {
      stopRecord()
    }
  }

  const startRecord = () => {
    start()
    setIsRecording(true)
  }

  const stopRecord = () => {
    stop()
    setIsRecording(false)
    play()
  }

  return (
    <div styleName="container">
      <button onClick={handleRecordingClick}>
        {isRecording ? 'Stop ' : 'Start '} Recording
      </button>
    </div>
  );
}

export default App;