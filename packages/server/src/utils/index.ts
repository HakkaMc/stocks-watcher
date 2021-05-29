import { connection as Connection } from 'websocket'

export class WebsocketPinger {
  private closed = false

  private connection: Connection

  private reconnect: () => void

  private counter = 0

  private sendPingTimeoutRef: ReturnType<typeof setTimeout>

  private waitPongTimeoutRef: ReturnType<typeof setTimeout>

  constructor(connection: Connection, reconnect: () => void) {
    this.connection = connection
    this.reconnect = reconnect

    this.startListening()
  }

  startListening() {
    clearTimeout(this.waitPongTimeoutRef)

    this.waitPongTimeoutRef = setTimeout(() => {
      if (!this.closed) {
        console.log('Call reconnect from WebsocketPinger')
        this.connection.close()
        this.reconnect()
      }
    }, 60 * 1000)

    this.connection.ping(++this.counter)
  }

  public resolve() {
    clearTimeout(this.sendPingTimeoutRef)
    clearTimeout(this.waitPongTimeoutRef)

    if (!this.closed) {
      this.sendPingTimeoutRef = setTimeout(() => {
        if (!this.closed) {
          this.startListening()
        }
      }, 60 * 1000)
    }
  }

  public destroy() {
    this.closed = true
    clearTimeout(this.sendPingTimeoutRef)
    clearTimeout(this.waitPongTimeoutRef)
  }
}
