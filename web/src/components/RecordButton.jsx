import React, {useRef, useCallback, useState} from 'react'
import './RecordButton.scss'
import useKeyboard from '../hooks/useKeyboard'

const EightBitButton = ({loopsEngine, isRecording}) => {
    const buttonRef = useRef(null)
    const [taps, setTaps] = useState(0)

    const handleTap = useCallback(() => {
        const tapsCount = loopsEngine.tap()
        buttonRef.current.focus()
        setTaps(tapsCount)
    }, [loopsEngine])

    const handleClick = (e) => {
        // If its not keyboard
        if(event.screenX !== 0 && !event.screenY !== 0) {
            handleTap()
        }
    }

    useKeyboard(handleTap)

    return (
        <div styleName="container">
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
        </div>
    )
}

export default EightBitButton