export const convertTime = (time: string, fromTz: string, toTz: string) => {
  const date = new Date()
  const [hours, minutes] = time.split(':')
  date.setHours(parseInt(hours))
  date.setMinutes(parseInt(minutes))

  const fromTime = new Date(date.toLocaleString('en-US', { timeZone: fromTz }))
  const toTime = new Date(date.toLocaleString('en-US', { timeZone: toTz }))
  const diff = toTime.getTime() - fromTime.getTime()

  date.setTime(date.getTime() + diff)
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: toTz
  })
}

export const formatTimeForDisplay = (time: string, timezone: string) => {
  const date = new Date()
  const [hours, minutes] = time.split(':')
  date.setHours(parseInt(hours))
  date.setMinutes(parseInt(minutes))

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
    hour12: true
  })
} 