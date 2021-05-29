import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { Box, IconButton, Paper } from '@material-ui/core'
import { Input } from '../../form'
import { CloseIcon, SaveIcon } from '../../utils/icons'
import { ModalRoutes } from '../../constants'
import { dispatchers } from '../../redux'

import styles from './styles.module.scss'
import { ModalTemplate } from '../../components'

type FormValues = {
  idealBuyPrice: string
  buyPriceLimit: string
  takeProfitPrice: string
  trailingStopPrice: string
  trailingStopPriceLimit: string
  stopLossPrice: string
}

type Props = {
  id: string
}

export const BinanceOrder = ({ id: modalId }: Props) => {
  const form = useForm<FormValues>()

  const save = useCallback(() => {}, [])

  return (
    <ModalTemplate modalId={modalId}>
      <Box className={styles.columns}>
        <Box className={styles.formColumn}>
          <Box>
            <Box>Od jaké ceny aktivovat sledování k automatické koupi?</Box>
            <Box>
              <Input form={form} name="idealBuyPrice" />
            </Box>
          </Box>

          <Box mt={2}>
            <Box>
              Okolo jaké ceny určitě koupit pro případ, že algoritmus nenajde lepší kupní cenu? (musí být vyšší než cena
              předchozího bodu)
            </Box>
            <Box>
              <Input form={form} name="buyPriceLimit" />
            </Box>
          </Box>

          <Box mt={2}>
            <Box>Sebrání zisku (take-profit): Okolo jaké ceny bezpodmínečně prodat a vzít zisk?</Box>
            <Box>
              <Input form={form} name="takeProfitPrice" />
            </Box>
          </Box>

          <Box mt={2}>
            <Box>
              Od jaké ceny aktivovat sledování k automatickému prodeji se ziskem (trailing-stop) pro případ, že by cena
              začala klesat?
            </Box>
            <Box>
              <Input form={form} name="trailingStopPrice" />
            </Box>
          </Box>

          <Box mt={2}>
            <Box>
              Okolo jaké ceny prodat a vzít aktuální zisk (musí být nižší než cena předchozího bodu) v případě, že cena
              začala klesat?
            </Box>
            <Box>
              <Input form={form} name="trailingStopPriceLimit" />
            </Box>
          </Box>

          <Box mt={2}>
            <Box>Minimalizace ztrát (stop-loss): Okolo jaké ceny prodat a neprodělat ještě víc?</Box>
            <Box>
              <Input form={form} name="stopLossPrice" />
            </Box>
          </Box>
        </Box>
        <Box className={styles.chartColumn}>Chart</Box>
      </Box>
      <Box mt={4}>
        <IconButton onClick={save}>
          <SaveIcon color="primary" />
        </IconButton>
      </Box>
    </ModalTemplate>
  )
}
