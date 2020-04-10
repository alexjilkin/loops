import React, {useEffect, useState, useCallback} from 'react';
import './Settings.scss'

const lastInputId = localStorage.getItem('inputId');

const Settings = ({loopsEngine, onSettingsToggle}) => {
  const [inputs, setInputs] = useState([])

  useEffect(() => {
    async function init() {
      setInputs(await loopsEngine.getInputs())
    }

    init()
  }, [])

  useEffect(() => {
    if (lastInputId) {
      loopsEngine.setInput(lastInputId)
    }
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