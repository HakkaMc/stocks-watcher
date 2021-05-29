export const round = (value: number | string | undefined, digits?: number) => {
  if (value === undefined || value === null) {
    return value
  }

  return parseFloat(value.toString()).toFixed(digits || 2)
}

export const parseNumber = (price: any) => {
  if (typeof price === 'number') {
    return price
  }

  if (typeof price === 'string') {
    const stringPrice = price.replace(',', '.').replace(/[^0-9.]/g, '')
    if (stringPrice.length) {
      return parseFloat(stringPrice)
    }
  }

  return Number.NaN
}
