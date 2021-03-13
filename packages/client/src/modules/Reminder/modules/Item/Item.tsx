import React from 'react'
import { Paper, Box, IconButton, Button, Grid } from '@material-ui/core'
import { useSubscription, useMutation, useQuery } from '@apollo/client'
import { Reminder as ReminderType } from '@sw/shared/src/graphql'
import { FormattedDate, FormattedTime } from 'react-intl'
import { CloseIcon } from '../../../../utils/icons'

import { SET_REMINDER, GET_REMINDERS, REMOVE_REMINDER, GET_DASHBOARD } from '../../../../gqls'

import styles from './styles.module.scss'

type Props = {
  data: ReminderType
}

export const Item = ({ data }: Props) => {
  const [removeReminder] = useMutation(REMOVE_REMINDER, {
    refetchQueries: [
      {
        query: GET_REMINDERS
      }
    ]
  })

  return (
    <Box className={styles.item} mb={2}>
      <Box className={styles.content} pt={2} pl={2}>
        <strong>{data.title}</strong> <span>{data.text}</span>
      </Box>
      <Box className={styles.rest}>
        <div>
          <FormattedDate value={new Date(data.timestamp)} day="2-digit" month="2-digit" year="numeric" />{' '}
          <FormattedTime value={new Date(data.timestamp)}/>
        </div>
        <IconButton>
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  )
}
