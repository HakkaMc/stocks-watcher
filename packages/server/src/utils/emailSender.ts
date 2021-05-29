import SendMail from 'sendmail'

const sendMailInstance = SendMail({})

export const sendEmail = (to: string, subject: string, body?: string) =>
  new Promise((resolve, reject) => {
    sendMailInstance(
      {
        from: 'Stocks Watcher <info@stockswatcher.com>',
        to,
        subject,
        html: body || ''
      },
      (error: any) => {
        if (error) {
          console.error('Send email error: ', error)
          reject(error)
        }
      }
    )
  })
