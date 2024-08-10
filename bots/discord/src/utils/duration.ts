export const parseDuration = (duration: string) => {
    if (!duration.length) return Number.NaN
    const matches = duration.match(/(?:(\d+y)?(\d+M)?(\d+w)?(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)/)!

    const [, years, months, weeks, days, hours, minutes, seconds] = matches.map(Number)
    return (
        (years || 0) * 290304e5 +
        (months || 0) * 24192e5 +
        (weeks || 0) * 6048e5 +
        (days || 0) * 864e5 +
        (hours || 0) * 36e5 +
        (minutes || 0) * 6e4 +
        (seconds || 0) * 1e3
    )
}

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
