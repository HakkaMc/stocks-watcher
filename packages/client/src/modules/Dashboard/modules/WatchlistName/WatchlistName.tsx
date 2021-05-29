import React, { KeyboardEvent, useCallback, useState } from 'react'
import { Box, Icon, IconButton, Tooltip } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { useForm } from 'react-hook-form'
import { useSubscription, useMutation, useQuery, useLazyQuery } from '@apollo/client'

import { Input } from '../../../../form'
import { CHANGE_WATCHLIST_SETTINGS, GET_DASHBOARD } from '../../../../gqls'
import { Dashboard_getDashboard_watchlists } from '../../../../types/graphql/generated/Dashboard'

type FormValues = {
  name: string
}

type Props = {
  watchlist: Dashboard_getDashboard_watchlists
}

export const WatchlistName = ({ watchlist }: Props) => {
  const [editMode, setEditMode] = useState(false)

  const [changeWatchlistSettings] = useMutation(CHANGE_WATCHLIST_SETTINGS, {
    fetchPolicy: 'no-cache',
    refetchQueries: [
      {
        query: GET_DASHBOARD
      }
    ]
  })

  const form = useForm<FormValues>({
    defaultValues: {
      name: watchlist.name
    }
  })

  const submit = useCallback(() => {
    const values = form.getValues()

    if (values.name) {
      changeWatchlistSettings({
        variables: {
          id: watchlist._id,
          name: values.name
        }
      })
      form.reset()
      setEditMode(false)
    }
  }, [watchlist._id, form])

  const onKeyUp = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        form.reset()
        setEditMode(false)
      } else if (event.key === 'Enter') {
        // Run in new thread otherwise an error occur
        setTimeout(submit, 0)
      }
    },
    [setEditMode]
  )

  const onNameClick = useCallback(
    (value) => {
      setEditMode(value)
    },
    [setEditMode]
  )

  return (
    <>
      {!editMode && (
        <Box color={grey[600]} onClick={onNameClick}>
          {watchlist.name}
        </Box>
      )}
      {editMode && (
        <Box>
          <Input autoFocus form={form} name="name" onBlur={submit} onKeyUp={onKeyUp} placeholder="Search symbol" />
        </Box>
      )}
    </>
  )
}
