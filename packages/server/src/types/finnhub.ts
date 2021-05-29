export type LastPriceData = {
  /**
   * Symbol.
   */
  s: string

  /**
   * Last price.
   */
  p: number

  /**
   * UNIX milliseconds timestamp
   */
  t: number

  /**
   * Volume.
   */
  v: number

  /**
   * List of trade conditions. A comprehensive list of trade conditions code can be found here
   */
  c: any
}

export type Trade = {
  /**
   * Message type.
   */
  type: string

  /**
   * List of trades or price updates.
   */
  data: Array<LastPriceData>
}
