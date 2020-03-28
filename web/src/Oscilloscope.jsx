import React, {useEffect, useRef} from 'react';

const width = 400;
const height = 200;
const yUnit = height * 10;

let x = 0;
let lastY = 0;

const Oscilloscope = ({subscribe}) => {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas.getContext) {

            const context = canvas.getContext('2d');
            subscribe((index, y) => {
                const canvasWorldX = x % width;
                const canvasWorldY = (height * (3/5)) + (y * yUnit)
                context.fillRect(canvasWorldX, canvasWorldY , 1, 1);

                if (canvasWorldX === 0) {
                    context.clearRect(0, 0, width, height)
                    context.beginPath();
                }
                context.moveTo(canvasWorldX - 1, lastY);
                context.lineTo(canvasWorldX, canvasWorldY);
                context.stroke();


                x++;
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