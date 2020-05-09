import React, {useEffect, useRef} from 'react';
import {throttleTime} from 'rxjs/operators';
const width = 400;
const height = 200;
const yUnit = height / 1.5 ;

let lastY = 0;

const Oscilloscope = ({value$}) => {
    const canvasRef = useRef(null)
    let x = useRef(0)

    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas.getContext) {

            const context = canvas.getContext('2d');

            value$.pipe(throttleTime(50)).subscribe((y) => {
                const canvasWorldX = x.current % width;
                const canvasWorldY = (height * (3/5)) + (y * yUnit)

                if (canvasWorldX === 0) {
                    context.beginPath();
                    lastY = 0;
                }

                context.clearRect(canvasWorldX + 2, 0, 2, height)
                context.moveTo(canvasWorldX - 2, lastY);
                context.lineTo(canvasWorldX, canvasWorldY);
                context.stroke();

                x.current = x.current + 2;
                lastY = canvasWorldY;
            })
        }
        
        
    }, [canvasRef])
    return (
        <canvas ref={canvasRef} {...{height, width}}>

        </canvas>
    )
}

export default Oscilloscope