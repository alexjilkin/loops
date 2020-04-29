import {useState, useRef, useEffect} from 'react'
import {Loops} from '@loops/core'

const useLoops = (startRecord, stopRecord, onTap) => {
    const [loops, setLoops] = useState([])
    let loopsEngine = useRef(new Loops('browser', startRecord ,stopRecord,onTap));

    useEffect(() => {
        loopsEngine.current.getLoops().subscribe(setLoops)
    }
    ,[])
    
    return [loopsEngine.current, loops]
}

export default useLoops