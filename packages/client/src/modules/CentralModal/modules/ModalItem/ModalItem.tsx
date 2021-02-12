import React, {useCallback, useState} from 'react'
import { Modal as ModalComponent } from '@material-ui/core'
import { ModalConfig } from '../../../../types/redux/modal'
import {useRedux} from "../../../../redux/useRedux";

export type Props = {
  config: ModalConfig
}

export const ModalItem = ({config}: Props) => {
    return (
        <ModalComponent open>
            {config.data}
        </ModalComponent>
    )
}
