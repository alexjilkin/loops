export const track = (eventName) => {
    try {
        _paq.push(['trackEvent', 'loops', eventName])
    } catch(err) {
        console.error('failed to track')
    }
}