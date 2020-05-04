import {useState, useRef, useEffect} from 'react'
import {Loops} from '@loops/core'

const useLoops = (onTap, setBpm) => {
    const [loops, setLoops] = useState([])
    let loopsEngine = useRef(new Loops('browser', (bpm) => setBpm(bpm)));

    useEffect(() => {
        loopsEngine.current.getLoops().subscribe(setLoops)
        loopsEngine.current.getTap().subscribe(onTap)
    }
    ,[])
    
    return [loopsEngine.current, loops]
}

export default useLoops