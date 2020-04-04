import React, {useEffect, useRef} from 'react';

const width = 400;
const height = 200;
const yUnit = height ;

let lastY = 0;

const Oscilloscope = ({subscribe}) => {
    const canvasRef = useRef(null)
    let x = useRef(0)

    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas.getContext) {

            const context = canvas.getContext('2d');
            subscribe((index, y) => {
                if (Math.random() < 0.98) {
                    return;
                }
                const canvasWorldX = x.current % width;
                const canvasWorldY = (height * (3/5)) + (y * yUnit)
                //context.fillRect(canvasWorldX, canvasWorldY , 1, 1);

                if (canvasWorldX === 0) {
                    context.beginPath();
                    lastY = 0;
                }

                context.clearRect(canvasWorldX + 1, 0, 1, height)
                context.moveTo(canvasWorldX - 1, lastY);
                context.lineTo(canvasWorldX, canvasWorldY);
                context.stroke();

                x.current = x.current + 1;
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