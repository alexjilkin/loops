import {useRef} from 'react'
import {Loops} from '@loops/core'

const useLoops = (startRecord, stopRecord, onTap) => {
    let loopsEngine = useRef(new Loops('browser', startRecord ,stopRecord,onTap));

    return loopsEngine.current
}

export default useLoops