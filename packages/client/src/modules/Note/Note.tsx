import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { useMutation, useQuery } from '@apollo/client'
import { Note as NoteType } from '@sw/shared/src/graphql'

import { dispatchers } from '../../redux'
import styles from './styles.module.scss'
import { GET_NOTE, SAVE_NOTE } from '../../gqls'
import { ModalTemplate } from '../../components'

let saveTimoutRef: ReturnType<typeof setTimeout>

type Props = {
  id: string
}

// TODO - add backuping content before editing
export const Note = ({ id: modalId }: Props) => {
  const textareaRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  const getNoteResponse = useQuery<{ getNote: NoteType }>(GET_NOTE, { fetchPolicy: 'network-only' })
  const [saveNote, saveNoteResponse] = useMutation(SAVE_NOTE, {
    fetchPolicy: 'no-cache'
  })

  const getText = useCallback((): string | undefined => {
    if (textareaRef?.current) {
      const currentObject: any = textareaRef.current
      const value = currentObject?.value
      return value
    }

    return undefined
  }, [textareaRef])

  const save = useCallback(() => {
    const text = getText()

    if (loaded && text !== undefined) {
      saveNote({
        variables: {
          text
        }
      })
    }
  }, [saveNote, getText, loaded])

  const close = useCallback(() => {
    save()
    dispatchers.modal.close(modalId)
  }, [dispatchers, textareaRef, loaded, saveNote, getText])

  const escapeListener = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        close()
      }
    },
    [getText, loaded]
  )

  useEffect(() => {
    window.addEventListener('keyup', escapeListener)

    return () => {
      window.removeEventListener('keyup', escapeListener)
    }
  }, [loaded])

  const onKeyUp = useCallback(
    (event) => {
      clearTimeout(saveTimoutRef)

      if (event.key !== 'Escape') {
        saveTimoutRef = setTimeout(save, 10 * 1000)
      }
    },
    [textareaRef, loaded]
  )

  useEffect(() => {
    if (!getNoteResponse.error && !getNoteResponse.loading && getNoteResponse.data?.getNote) {
      if (textareaRef?.current) {
        const currentObject: any = textareaRef.current

        currentObject.value = getNoteResponse.data?.getNote?.text || ''
      }
      setLoaded(true)
    }
  }, [getNoteResponse])

  return (
    <ModalTemplate modalId={modalId}>
      <Box pl={3} pr={3} pb={3} className={styles.textareaWrapper}>
        <textarea
          disabled={!loaded}
          ref={textareaRef}
          className={styles.textarea}
          style={{ borderColor: grey[300] }}
          placeholder="Your notes"
          onKeyUp={onKeyUp}
        />
      </Box>
    </ModalTemplate>
  )
}
