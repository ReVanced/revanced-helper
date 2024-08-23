import parse from 'parse-duration'

export const parseDuration = (duration: string) => parse(duration, 'ms') ?? Number.NaN

export const durationToString = (duration: number) => {
    if (duration === 0) return '0s'

    const days = Math.floor(duration / (24 * 60 * 60 * 1000))
    const hours = Math.floor((duration % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((duration % (60 * 1000)) / 1000)

    return `${days ? `${days}d` : ''}${hours ? `${hours}h` : ''}${minutes ? `${minutes}m` : ''}${
        seconds ? `${seconds}s` : ''
    }`
}
