export const parseDuration = (duration: string) => {
    if (!duration.length) return Number.NaN
    const matches = duration.match(/(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/)!

    const [, days, hours, minutes, seconds] = matches.map(Number)
    return (
        (days || 0) * 24 * 60 * 60 * 1000 +
        (hours || 0) * 60 * 60 * 1000 +
        (minutes || 0) * 60 * 1000 +
        (seconds || 0) * 1000
    )
}

export const durationToString = (duration: number) => {
    const days = Math.floor(duration / (24 * 60 * 60 * 1000))
    const hours = Math.floor((duration % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000))
    const seconds = Math.floor((duration % (60 * 1000)) / 1000)

    return `${days ? `${days}d` : ''}${hours ? `${hours}h` : ''}${minutes ? `${minutes}m` : ''}${
        seconds ? `${seconds}s` : ''
    }`
}
