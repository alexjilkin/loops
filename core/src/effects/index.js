import Amp from './Amp'

const amp = new Amp()

export const transfer = (x, y) => {
    return amp.transfer(x, y)
}