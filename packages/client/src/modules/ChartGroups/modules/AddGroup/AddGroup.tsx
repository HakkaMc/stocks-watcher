import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Checkbox, IconButton, Box } from '@material-ui/core'
import { Save as SaveIcon } from '@material-ui/icons'
import { useSubscription, useMutation, useQuery } from '@apollo/client'
import { Input } from '../../../../form'
import { CREATE_CHART_GROUP, GET_CHART_GROUPS } from '../../../../gqls'

import styles from './styles.module.scss'

type FormValues = {
  name: string
}

export const AddGroup = () => {
  const [createChartGroup] = useMutation(CREATE_CHART_GROUP, {
    fetchPolicy: 'no-cache',
    refetchQueries: [
      {
        query: GET_CHART_GROUPS
      }
    ]
  })

  const form = useForm<FormValues>()

  const save = useCallback(() => {
    const { name } = form.getValues()
    if (name) {
      createChartGroup({
        variables: {
          name
        }
      })

      form.reset({ name: '' })
    }
  }, [createChartGroup, form])

  return (
    <div className={styles.container}>
      <form>
        <Input form={form} name="name" placeholder="New group name" className={styles.input} />
        <IconButton onClick={save}>
          <SaveIcon color="primary" className={styles.saveIcon} />
        </IconButton>
      </form>
    </div>
  )
}
