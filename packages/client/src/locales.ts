import get from 'lodash/get'

type Message = {
  cs: string
  en: string
  [x: string]: string
}

let index = 0
const map: Record<string, Message> = {}
const t = (message: Message): string => {
  index += 1
  map[index] = message

  return `${index}`
}

export const dictionary: Record<string, Record<string, string>> = {
  cs: {},
  en: {}
}

export const messages = {
  carList: {
    title: t({
      cs: 'Seznam vozů',
      en: 'Car list'
    })
  }
}

const enhanceMessages = (path: string) => {
  const actualObject = path ? get(messages, path) : messages
  const keys = Object.keys(actualObject)

  keys.forEach((key: string) => {
    const fullPath: string = path ? `${path}.${key}` : key

    if (typeof actualObject[key] === 'object') {
      enhanceMessages(fullPath)
    } else if (typeof actualObject[key] === 'string') {
      const i: string = actualObject[key]
      const message: Message = map[i]

      dictionary.cs[fullPath] = message.cs
      dictionary.en[fullPath] = message.en

      Object.defineProperty(actualObject, key, {
        get: () => fullPath
      })
    }
  })
}

enhanceMessages('')
