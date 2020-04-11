import React, {useEffect, useState, useCallback} from 'react';
import {getInputs} from '@loops/core'
import './Settings.scss'



const Settings = ({loopsEngine, onSettingsToggle}) => {
  const [inputs, setInputs] = useState([])

  useEffect(() => {
    async function init() {
      setInputs(await getInputs())
    }

    init()
  }, [])

  const setInputId = useCallback((inputId) => {
      loopsEngine.setInput(inputId)
      localStorage.setItem('inputId', inputId);
      onSettingsToggle(false)
  })

  return (
    <div styleName="container">
      <div styleName="inputs">
        Select input
        {inputs.map(input =>
          <div key={input.deviceId} styleName="input" onClick={() => setInputId(input.deviceId)}>
            {input.label}
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;