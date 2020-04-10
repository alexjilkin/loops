import {useRef} from 'react'
import {Loops} from '@loops/core'

const useLoops = (onTap) => {
    let loopsEngine = useRef(new Loops('browser', onTap));

    return loopsEngine.current
}

export default useLoops