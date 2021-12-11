import React, { useState, useCallback, useEffect, useRef } from 'react';
import { value$ } from '@loops/core'
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
  const [isOn, setIsOn] = useState(false)

  const clickAudioRef = useRef(null)

  const playTap = (beatCount) => {
    clickAudioRef.current.currentTime = 0

    if (beatCount === 1) {
      clickAudioRef.current.volume = 0.7
    } else {
      clickAudioRef.current.volume = 0.3
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

  const handlePlayback = useCallback(() => {
    setIsOn((isOn) => {
      if (!isOn) {
        loopsEngine.startMonitor()
      } else {
        loopsEngine.stopMonitor()
      }

      return !isOn
    })
  }, [isOn])

  return (
    <div styleName="container">
      <div styleName="left-column">
        
        <span styleName={`turn-on ${isOn ? 'on' : ''}`} onClick={handlePlayback}>
          Turn On
        </span>
        
        <div>
          <Amp loopsEngine={loopsEngine} inputId={lastInputId} />
        </div>
        <audio src={Click} ref={clickAudioRef}></audio>
        <div styleName="settings" onClick={handleSettingsClick}>
          <img src={CogIcon} />
        </div>
        {!isOn 
          ? null 
          : isSettingsOpen
          ? <Settings loopsEngine={loopsEngine} onSettingsToggle={handleSettingsClick} /> 
          : <div>
              <div styleName="record-button-container">
                <RecordButton loopsEngine={loopsEngine} isRecording={isRecording} />
                <div styleName="bpm">
                  {bpm && `${bpm} bpm`}
                </div>
              </div>
              
              <div styleName="output-wave">
                <Oscilloscope value$={value$} />
              </div>
            </div>
        }
      </div>
      <div styleName="loops">
        {loops.map((loop, index) =>
          <div 
            key={index} 
            style={{width: loop.data.length / 1000}} 
            styleName={`loop ${loop.isPlaying ? '' : 'disabled'}`}
            onClick={() => loopsEngine.toggleLoop(index)}
          > 
            {index + 1}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;