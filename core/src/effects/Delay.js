import {sampleRate} from '../consts'

class Delay {
    constructor() {
      this.feedback = []
      this.delayAmount = 0.8
      this.delayDepth = 6
      this.gain = 0.6
      this.x = 0;

      this.transferFunc = this.transferFunc.bind(this)
    }

    transferFunc(y) {
        const feedbackSize = sampleRate * 4 * this.delayDepth;
        const cyclicX = this.x % feedbackSize
        this.feedback[cyclicX] = y;
        const delayAmountBySamples = this.delayAmount * sampleRate;
        this.x++;
        for(let i = 1; i < this.delayDepth; i++) {     
            const currentFeedbackIndex = cyclicX - (i * delayAmountBySamples) < 0 ? feedbackSize - (i * delayAmountBySamples) : cyclicX - (i * delayAmountBySamples)
            const currentFeedback = this.feedback[currentFeedbackIndex]
    
            // If still no feedback
            if (currentFeedback === undefined) {
                return y;
            }
            
            y = (y * 0.9) +  Math.pow(this.gain, i) * (y + currentFeedback)
        }

        
        return y;
    }
}

export default Delay