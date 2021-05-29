import { roundToMidnight, floorToMinute } from '@sw/shared/src/time'
import { ReminderTsModel, ReminderTsType } from '../database/reminder/schema'
import { UserTsType } from '../database/user/schema'
import { sendEmail } from '../utils/emailSender'

type EnhancedReminder = ReminderTsType & { user: UserTsType }

const immediateIds: Array<string> = []
const mapByIds: Record<string, EnhancedReminder> = {}
const mapByTimestamp: Record<number, string[]> = {}

let fetchItemsToTimestamp = new Date()

const fetchItems = async () => {
  const now = Date.now()
  const midnight = roundToMidnight(now)
  const from = new Date(midnight)
  from.setDate(from.getDate() - 7)
  fetchItemsToTimestamp = new Date()
  fetchItemsToTimestamp.setMinutes(fetchItemsToTimestamp.getMinutes() + 10)

  const items: any = await ReminderTsModel.find({
    active: true,
    createdAt: { $gte: from },
    timestamp: { $lte: fetchItemsToTimestamp.getTime() }
  }).populate('user')

  if (Array.isArray(items) && items.length) {
    items.forEach((item: EnhancedReminder) => {
      mapByIds[item._id.toString()] = item

      const { timestamp } = item

      if (timestamp < now) {
        immediateIds.push(item._id.toString())
      } else {
        if (!mapByTimestamp[timestamp]) {
          mapByTimestamp[timestamp] = []
        }

        mapByTimestamp[timestamp].push(item._id.toString())
      }
    })
  }
}

export const modifiedReminderNotification = (timestamp: number) => {
  if (timestamp <= fetchItemsToTimestamp.getTime()) {
    fetchItems()
  }
}

const processSending = async () => {
  const now = floorToMinute(Date.now())

  let id = immediateIds.shift()

  while (id) {
    const item = mapByIds[id]

    if (item) {
      sendEmail(item.user.email, `Reminder: ${item.title}`, item.text).catch((error) => {
        console.log('Send reminder email error: ', error)
      })

      Promise.resolve(ReminderTsModel.updateOne({ _id: item._id }, { active: false }))

      // Release memory
      delete mapByIds[id]
    }

    id = immediateIds.shift()
  }

  for (let i = -5; i <= 0; i += 1) {
    const timestamp = new Date(now)
    timestamp.setMinutes(timestamp.getMinutes() - i)

    const array = mapByTimestamp[timestamp.getTime()]

    if (Array.isArray(array)) {
      let reminderId = array.shift()

      while (reminderId) {
        const item = mapByIds[reminderId]

        if (item) {
          sendEmail(item.user.email, `Reminder: ${item.title}`, item.text).catch((error) => {
            console.log('Send reminder email error: ', error)
          })

          Promise.resolve(ReminderTsModel.updateOne({ _id: item._id }, { active: false }))

          // Release memory
          delete mapByIds[reminderId]
        }

        reminderId = array.shift()
      }

      // Release memory
      delete mapByTimestamp[timestamp.getTime()]
    }
  }
}

export const startReminder = () => {
  fetchItems()

  setInterval(fetchItems, 10 * 60 * 1000)

  processSending()

  setInterval(processSending, 1 * 60 * 1000)
}
