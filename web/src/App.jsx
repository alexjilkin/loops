import React, {useState, useCallback, useEffect, useRef} from 'react';
import {value$} from '@loops/core'
import Oscilloscope from './components/Oscilloscope'
import Settings from './components/Settings';
import RecordButton from './components/RecordButton'
import Click from './assets/korg-click.wav'
import CogIcon from './assets/cog.svg'
import useLoops from './hooks/useLoops'
import Amp from './components/Amp'

import './App.scss'
const lastInputId = localStorage.getItem('inputId');


const App = () => {
  const [isRecording, setIsRecording] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [bpm, setBpm] = useState(null)

  const clickAudioRef = useRef(null)

  const playTap = (beatCount) => {
    clickAudioRef.current.currentTime = 0

    if (beatCount === 1) {
      clickAudioRef.current.volume = 0.3
    } else {
      clickAudioRef.current.volume = 0.1
    }
    
    clickAudioRef.current.play()
  }
  
  const [loopsEngine, loops] = useLoops(playTap, setBpm)

  useEffect(() => {
    loopsEngine.isRecording$.subscribe(setIsRecording)
    
    if (lastInputId) {
      loopsEngine.setInput(lastInputId)
    }
    
  }, [])

  const handleSettingsClick = useCallback(() => {
    setIsSettingsOpen(!isSettingsOpen)
  }, [isSettingsOpen])

  return (
    <div styleName="container">
      <div style={{marginBottom: 20}}>
        <Amp loopsEngine={loopsEngine} inputId={lastInputId} />
      </div>
      <audio src={Click} ref={clickAudioRef}></audio>
      <div styleName="settings" onClick={handleSettingsClick}>
        <img src={CogIcon} />
      </div>
      {isSettingsOpen ? 
        <Settings loopsEngine={loopsEngine} onSettingsToggle={handleSettingsClick}/> :
      <div>

      <RecordButton loopsEngine={loopsEngine} isRecording={isRecording} />
      <div styleName="bpm">
        {bpm && `BPM: ${bpm}`}
      </div>
      <div styleName="loops">
        {loops.map((loop, index) => 
          <div key={index} styleName="loop"> {index} </div>
        )}
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