import { ResolverResolveParams } from 'graphql-compose'
import { reminderGraphql, ReminderTsModel } from './schema'
import { priceAlertGraphql, PriceAlertTsModel } from '../priceAlert/schema'
import { getLastPrice } from '../../cache'
import { modifiedReminderNotification } from '../../computes/reminder'

reminderGraphql.addResolver({
  kind: 'query',
  name: 'getReminders',
  type: [reminderGraphql],
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session

    const reminders = await ReminderTsModel.find({ user: userId, active: true })

    return reminders || []
  }
})

reminderGraphql.addResolver({
  kind: 'mutation',
  name: 'setReminder',
  args: {
    title: 'String!',
    text: 'String',
    timestamp: 'Float!'
  },
  type: 'String',
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session

    await new ReminderTsModel({
      active: true,
      user: userId,
      title: params.args.title,
      text: params.args.text,
      timestamp: params.args.timestamp
    }).save()

    modifiedReminderNotification(params.args.timestamp)

    return 'OK'
  }
})

reminderGraphql.addResolver({
  kind: 'mutation',
  name: 'removeReminder',
  args: {
    id: 'String!'
  },
  type: 'String',
  resolve: async (params: ResolverResolveParams<any, any, any>) => {
    const { userId } = params.context.session

    const reminder = await ReminderTsModel.findOneAndDelete({ user: userId, _id: params.args.id })

    if (reminder?.timestamp) {
      modifiedReminderNotification(reminder.timestamp)
    }

    return 'OK'
  }
})

export const reminderResolvers = {
  query: {
    getReminders: reminderGraphql.getResolver('getReminders')
  },
  mutation: {
    setReminder: reminderGraphql.getResolver('setReminder'),
    removeReminder: reminderGraphql.getResolver('removeReminder')
  }
}
