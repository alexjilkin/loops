
import {bufferSize, sampleRate} from './consts'

const recordings = []

let recordContext
export const start = () => {
  recordContext = new AudioContext({sampleRate});
  const recordingIndex = recordings.length
  recordings[recordingIndex] = []

  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then((stream) => {
      const source = recordContext.createMediaStreamSource(stream);
      const processor = recordContext.createScriptProcessor(bufferSize, 1, 1);

      source.connect(processor);
      processor.connect(recordContext.destination);

      processor.onaudioprocess = function({inputBuffer}) {
        const temp = new Float32Array(bufferSize)
        
        inputBuffer.copyFromChannel(temp, 0)

        temp.forEach(value => {
          recordings[recordingIndex].push(value)
        })
      };
    });
}

export const stop = () => {
    recordContext && recordContext.close()
}


export const play = () => {
  recordings.forEach(recording => {
    const master = new AudioContext({sampleRate});
    const buffer = master.createBuffer(1, bufferSize, sampleRate)
    const source = master.createScriptProcessor(bufferSize, 1, 1);
  
    let index = 0;
  
    const createBuffer = (output) => {
      for (let i = 0; i < buffer.length; i++) {
        output[i] = recording[(i + index) % recording.length]
      }
  
      index += buffer.length
    }
  
    source.buffer = buffer;
    source.connect(master.destination);
    
    source.addEventListener('audioprocess', (e) => {
      createBuffer(e.outputBuffer.getChannelData(0))
    })
  })
}