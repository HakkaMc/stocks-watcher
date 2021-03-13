import React, {useCallback, useMemo, useState} from 'react'

import { Paper, Box, IconButton, Tooltip } from '@material-ui/core'
import { useQuery } from '@apollo/client'
import { Reminder as ReminderType } from '@sw/shared/src/graphql'

import { CloseIcon, AddCircleOutlineIcon } from '../../utils/icons'
import { ModalRoutes } from '../../constants'
import { useRedux } from '../../redux/useRedux'

import { GET_REMINDERS } from '../../gqls'
import { Item } from './modules/Item/Item'
import { Form } from './modules/Form/Form'

import styles from './styles.module.scss'

export const Reminder = () => {
  const [showAddForm, setShowAddForm] = useState(false)
  const { dispatchers } = useRedux()

  const getRemindersResponse = useQuery<{ getReminders: Array<ReminderType> }>(GET_REMINDERS)

  const close = useCallback(() => {
    dispatchers.modal.setRoute({ route: ModalRoutes.Reminder, value: false })
  }, [dispatchers])

  const reminders = useMemo(() => {
    if (getRemindersResponse?.data?.getReminders) {
      return getRemindersResponse?.data?.getReminders.map((reminder) => {
        return <Item data={reminder} key={reminder._id} />
      })
    }

    return null
  }, [getRemindersResponse.data])

  const toggleShowAddForm = useCallback(()=>{
    setShowAddForm(!showAddForm)
  }, [showAddForm, setShowAddForm])

  return (
    <Box p={6} className={styles.margin}>
      <Paper className={styles.paper}>
        <Box className={styles.header}>
          <IconButton onClick={close} className={styles.closeButton}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box className={styles.content}>
          {!showAddForm && <Box mr={3} mb={1} className={styles.addReminderIconWrapper}>
            <Tooltip title="Add new reminder">
            <IconButton onClick={toggleShowAddForm}>
              <AddCircleOutlineIcon color="primary"/>
            </IconButton>
            </Tooltip>
          </Box>}
          {showAddForm && <Form onClose={toggleShowAddForm}/>
          }
          <Box ml={3} mr={3} mb={3}>
            {reminders}
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
