import React from 'react'
import classNames from 'classnames'
import { FormattedNumber } from 'react-intl'
import styles from '../styles.module.scss'
import { useStore } from '../store'

const round = (value: number | string | undefined, digits?: number) => {
  if (value === undefined || value === null) {
    return value
  }

  return parseFloat(value.toString()).toFixed(digits || 2)
}

export const SummaryRows = () => {
  const { deposit, boughtPrice, actualPrice, gain, overallGain, overallPercentageGain, percentageGain } = useStore()

  return (
    <>
      <tr>
        <td />
        <td />
        <td />
        <td />
        <td>
          <b>
            <FormattedNumber value={boughtPrice} minimumFractionDigits={2} style="currency" currency="USD" />
          </b>
        </td>
        <td>
          <b>
            <FormattedNumber value={actualPrice} minimumFractionDigits={2} style="currency" currency="USD" />
          </b>
        </td>
        <td>=</td>
        <td
          className={classNames({
            [styles.green]: gain >= 0,
            [styles.red]: gain < 0
          })}
        >
          <b>
            <FormattedNumber value={gain} minimumFractionDigits={2} style="currency" currency="USD" />
          </b>
        </td>
        <td
          className={classNames({
            [styles.green]: percentageGain >= 0,
            [styles.red]: percentageGain < 0
          })}
        >
          <b>
            <FormattedNumber value={percentageGain / 100} minimumFractionDigits={2} style="percent" />
          </b>
        </td>
        <td />
        <td />
      </tr>
      <tr>
        <td />
        <td />
        <td />
        <td />
        <td>
          <b>
            <FormattedNumber value={deposit} minimumFractionDigits={2} style="currency" currency="USD" />
          </b>
        </td>
        <td>
          <b>
            <FormattedNumber value={actualPrice} minimumFractionDigits={2} style="currency" currency="USD" />
          </b>
        </td>
        <td>=</td>
        <td
          className={classNames({
            [styles.green]: overallGain >= 0,
            [styles.red]: overallGain < 0
          })}
        >
          <b>
            <FormattedNumber value={overallGain} minimumFractionDigits={2} style="currency" currency="USD" />
          </b>
        </td>
        <td
          className={classNames({
            [styles.green]: overallGain >= 0,
            [styles.red]: overallGain < 0
          })}
        >
          <b>
            <FormattedNumber value={overallPercentageGain / 100} minimumFractionDigits={2} style="percent" />
          </b>
        </td>
        <td />
        <td />
      </tr>
    </>
  )
}
