import { client as WS, connection as Connection, IMessage } from 'websocket'

class WebsocketPinger {
  private onCloseCallback = false

  private connection: Connection

  private reconnect: () => void

  private counter = 0

  private sendPingTimeoutRef!: ReturnType<typeof setTimeout>

  private waitPongTimeoutRef!: ReturnType<typeof setTimeout>

  constructor(connection: Connection, reconnect: () => void) {
    this.connection = connection
    this.reconnect = reconnect

    this.startListening()
  }

  startListening() {
    clearTimeout(this.waitPongTimeoutRef)

    this.waitPongTimeoutRef = setTimeout(() => {
      if (!this.onCloseCallback) {
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

    if (!this.onCloseCallback) {
      this.sendPingTimeoutRef = setTimeout(() => {
        if (!this.onCloseCallback) {
          this.startListening()
        }
      }, 60 * 1000)
    }
  }

  public destroy() {
    this.onCloseCallback = true
    clearTimeout(this.sendPingTimeoutRef)
    clearTimeout(this.waitPongTimeoutRef)
  }
}

export class Websocket {
  private connectedTstamp = -1

  private lastPingPongTstamp = -1

  private socket: WS

  private connection!: Connection

  private name: string

  private pingPromise!: WebsocketPinger

  private connectionIntervalRef!: ReturnType<typeof setTimeout>

  private reconnectTimeoutRef!: ReturnType<typeof setTimeout>

  private pingTimeoutRef!: ReturnType<typeof setTimeout>

  private sendBuffer: Array<any> = []

  private wsUrl = ''

  private requestCount = 0

  private lazyConnect = false

  public onMessage!: (data: any) => void

  public onClose!: () => void

  public onConnect!: () => void

  public onDisconnect!: () => void

  constructor(params: { name: string; wsUrl: string; lazyConnect: boolean }) {
    this.name = params.name
    this.wsUrl = params.wsUrl
    this.lazyConnect = params.lazyConnect
    this.socket = new WS()

    this.socket.on('connectFailed', this.onConnectFailedCallback)

    this.socket.on('connect', this.onConnectCallback)

    this.connectionIntervalRef = setInterval(() => {
      if (this.connection?.connected) {
        // while (sendBuffer.length) {
        if (this.sendBuffer.length) {
          this.connection.sendUTF(this.sendBuffer.pop())
        }
      }
      // else {
      //   console.log(`${this.name} websocket is onCloseCallback`)
      // }
    }, 300)

    if (!this.lazyConnect) {
      console.log(`${this.name} websocket - call reconnect from constructor`)
      this.reconnect()
    }
  }

  private onConnectCallback = (connection: Connection) => {
    console.log(`${this.name} websocket connected`)

    this.connectedTstamp = Date.now()

    clearTimeout(this.reconnectTimeoutRef)
    clearTimeout(this.pingTimeoutRef)

    if (this.connection) {
      this.connection.close()
    }

    this.connection = connection

    if (this.pingPromise) {
      this.pingPromise.destroy()
    }

    this.pingPromise = new WebsocketPinger(connection, this.reconnect)

    connection.on('error', this.onErrorCallback)

    connection.on('close', this.onCloseCallback)

    connection.on('ping', this.onPingCallback)

    connection.on('pong', this.onPongCallback)

    connection.on('message', this.onMessageCallback)

    if (this.onConnect) {
      this.onConnect()
    }
  }

  private onConnectFailedCallback = (error: Error) => {
    console.error(`${this.name} websocket connect failed: `, error)
    if (this.pingPromise) {
      this.pingPromise.destroy()
    }
    if (this.connection) {
      this.connection.close()
    }
    this.reconnect()
  }

  private onCloseCallback = () => {
    console.error(`${this.name} websocket connection onCloseCallback`)
    this.pingPromise.destroy()
    this.connection.close()

    if (this.onDisconnect) {
      this.onDisconnect()
    }

    this.reconnect()
  }

  private onErrorCallback = (error: Error) => {
    console.error(`${this.name} websocket connection error: `, error)
    this.pingPromise.destroy()
    this.connection.close()

    if (this.onDisconnect) {
      this.onDisconnect()
    }

    this.reconnect()
  }

  private onPingCallback = () => {
    console.log(`${this.name} websocket ping received`)
    this.lastPingPongTstamp = Date.now()
  }

  private onPongCallback = (event: Buffer) => {
    console.log(`${this.name} websocket pong received`, event)
    this.lastPingPongTstamp = Date.now()
    this.pingPromise.resolve()
  }

  private onMessageCallback = (message: IMessage) => {
    this.pingPromise.resolve()

    if (this.name === 'Binance User') {
      console.log(`${this.name} websocket message`, message.type === 'utf8', !!message.utf8Data)
    }

    if (message.type === 'utf8' && message.utf8Data) {
      if (this.onMessage) {
        this.onMessage(JSON.parse(message.utf8Data))
      }
    }
  }

  public reconnect = () => {
    clearTimeout(this.reconnectTimeoutRef)
    clearTimeout(this.pingTimeoutRef)
    this.socket.abort()
    this.reconnectTimeoutRef = setTimeout(() => {
      this.socket.connect(this.wsUrl)
    }, 1000)
  }

  public get requestCounter() {
    return ++this.requestCount
  }

  public get connectedTimestamp() {
    return this.connectedTstamp
  }

  public get lastPingPongTimestamp() {
    return this.lastPingPongTstamp
  }

  public send = (message: any) => {
    if (!this.connection) {
      this.reconnect()
    }

    this.sendBuffer.push(message)
  }

  public destroy = () => {
    clearInterval(this.connectionIntervalRef)
    clearTimeout(this.reconnectTimeoutRef)
    clearTimeout(this.pingTimeoutRef)

    if (this.connection) {
      this.connection.close()
    }

    this.socket.abort()

    if (this.pingPromise) {
      this.pingPromise.destroy()
    }

    if (this.onDisconnect) {
      this.onDisconnect()
    }
  }
}
