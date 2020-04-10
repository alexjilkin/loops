import {useEffect} from 'react'

const useKeyboard = (onSpace) => {
    useEffect(() => {
        document.addEventListener('keydown', handleKeyboard)
        document.addEventListener('keyup', () => {
          document.addEventListener('keydown', handleKeyboard)
        })
    
      }, [])

      const handleKeyboard = (e) => {
        document.removeEventListener('keydown', handleKeyboard)
    
        if(event.code === 'Space') {
          onSpace()
        }
      }
}

export default useKeyboard