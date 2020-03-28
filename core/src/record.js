import {bufferSize, sampleRate} from './consts'
import {play} from './play'

const loops = []

export const addRecording = () => {
  const recordContext = new AudioContext({sampleRate});
  const loopIndex = loops.length
  loops[loopIndex] = []

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
          loops[loopIndex].push(value)
        })
      };
    });
  
    return () => {
      recordContext.close()
      play(loops[loopIndex])
    };
}

export const getRecordings = () => recordings