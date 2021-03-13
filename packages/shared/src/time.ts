export const roundToMidnight = (date: Date | number) => {
  const newDate = new Date(date)
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)

  return newDate
}

export const floorToMinute = (date: Date | number) => {
  const newDate = new Date(date)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)

  return newDate
}

export const ceilToMinute = (date: Date | number) => {
  const newDate = new Date(date)
  newDate.setMinutes(newDate.getMinutes() + 1)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)

  return newDate
}

export const getDayPoints = (date?: Date) => {
  const localDate = date ? new Date(date) : new Date()

  const midnightToday = roundToMidnight(localDate)
  const midnightTomorrow = new Date(midnightToday)
  midnightTomorrow.setDate(midnightTomorrow.getDate() + 1)

  const stockStart = new Date(midnightToday)
  stockStart.setHours(15)
  stockStart.setMinutes(30)

  const stockEnd = new Date(midnightToday)
  stockEnd.setHours(22)

  const premarketStart = new Date(midnightToday)
  premarketStart.setHours(10)

  const aftermarketEnd = new Date(midnightToday)
  aftermarketEnd.setHours(2)

  return {
    midnightToday,
    midnightTomorrow,
    premarketStart,
    aftermarketEnd,
    stockStart,
    stockEnd
  }
}
