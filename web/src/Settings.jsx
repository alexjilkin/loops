import React, {useEffect, useState, useCallback} from 'react';
import './Settings.scss'



const Settings = ({getInputs, onInputSelect}) => {
  const [inputs, setInputs] = useState([])

  useEffect(() => {
    async function init() {
      setInputs(await getInputs())
    }

    init()
  }, [])

  return (
    <div styleName="container">
      <div styleName="inputs">
        Select input
        {inputs.map(input =>
          <div key={input.deviceId} styleName="input" onClick={() => onInputSelect(input.deviceId)}>
            {input.label}
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;