import React, { useCallback, useMemo, useState } from 'react'

import { Paper, Box, IconButton, Tooltip } from '@material-ui/core'
import { useQuery } from '@apollo/client'
import { Reminder as ReminderType } from '@sw/shared/src/graphql'

import { CloseIcon, AddCircleOutlineIcon } from '../../utils/icons'
import { ModalRoutes } from '../../constants'
import { dispatchers } from '../../redux'

import { GET_REMINDERS } from '../../gqls'
import { Item } from './modules/Item/Item'
import { Form } from './modules/Form/Form'

import styles from './styles.module.scss'
import { ModalTemplate } from '../../components'

type Props = {
  id: string
}

export const Reminder = ({ id: modalId }: Props) => {
  const [showAddForm, setShowAddForm] = useState(false)

  const getRemindersResponse = useQuery<{ getReminders: Array<ReminderType> }>(GET_REMINDERS)

  const reminders = useMemo(() => {
    if (getRemindersResponse?.data?.getReminders) {
      return getRemindersResponse?.data?.getReminders.map((reminder) => {
        return <Item data={reminder} key={reminder._id} />
      })
    }

    return null
  }, [getRemindersResponse.data])

  const toggleShowAddForm = useCallback(() => {
    setShowAddForm(!showAddForm)
  }, [showAddForm, setShowAddForm])

  return (
    <ModalTemplate modalId={modalId}>
      {!showAddForm && (
        <Box mr={3} mb={1} className={styles.addReminderIconWrapper}>
          <Tooltip title="Add new reminder">
            <IconButton onClick={toggleShowAddForm}>
              <AddCircleOutlineIcon color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      {showAddForm && <Form onClose={toggleShowAddForm} />}
      <Box ml={3} mr={3} mb={3}>
        {reminders}
      </Box>
    </ModalTemplate>
  )
}
