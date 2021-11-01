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

export const getPrecision = (value: any, minimumFractionDigits: number | undefined = 0) => {
  let retValue = 0
  const numericValue = parseNumber(value)

  if(!Number.isNaN(numericValue)){
    const stringValue = value.toString()
    if (stringValue.includes('.')) {
      retValue = Math.min(stringValue.split('.')[1].length, 8)
    }
  }

  if(minimumFractionDigits>0){
    retValue = Math.max(minimumFractionDigits, retValue)
  }

  return retValue
}

export const roundToDigits = (value: any, maximumDigits?: number) =>{
  let retValue = value
  const numericValue = parseNumber(value)
  if(!Number.isNaN(numericValue)){
    let md = 8
    if(maximumDigits!==undefined) {
      md = maximumDigits
    }

    retValue = parseFloat(numericValue.toString().substring(0, numericValue.toString().includes('.') ? md+2 : md+1))

  }

  return retValue
}
