import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box, IconButton } from '@material-ui/core'
import { useMutation } from '@apollo/client'

import { Input } from '../../../../form'
import { SaveIcon } from '../../../../utils/icons'
import styles from './styles.module.scss'
import { GET_REMINDERS, SET_REMINDER } from '../../../../gqls'

type FormValues = {
  title: string
  text: string
  timestamp: string
}

type Props = {
  onClose?: () => void
}

export const Form = ({ onClose }: Props) => {
  const form = useForm<FormValues>()

  const [saveReminder] = useMutation(SET_REMINDER, {
    fetchPolicy: 'no-cache',
    refetchQueries: [
      {
        query: GET_REMINDERS
      }
    ]
  })

  const save = useCallback(() => {
    const values = form.getValues()

    if (values.title || values.text) {
      saveReminder({
        variables: {
          title: values.title,
          text: values.text,
          timestamp: new Date(values.timestamp).getTime()
        }
      })

      form.reset()

      if (onClose) {
        onClose()
      }
    }
  }, [form])

  return (
    <Box m={3} mt={1} pt={2} pb={2} pl={2} className={styles.formWrapper}>
      <Box className={styles.firstRow}>
        <Box mr={2}>
          <Input form={form} name="title" placeholder="Title" autoFocus />
        </Box>

        <Box mr={0}>
          <Input form={form} name="timestamp" type="datetime-local" />
        </Box>
        <Box>
          <IconButton onClick={save}>
            <SaveIcon color="primary" />
          </IconButton>
        </Box>
      </Box>

      <Box className={styles.secondRow} mr={6} mt={2}>
        <Input form={form} name="text" placeholder="Text" />
      </Box>
    </Box>
  )
}
