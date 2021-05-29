import React from 'react'
import classNames from 'classnames'
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
          <b>{round(boughtPrice)} $</b>
        </td>
        <td>
          <b>{round(actualPrice)} $</b>
        </td>
        <td>=</td>
        <td
          className={classNames({
            [styles.green]: gain >= 0,
            [styles.red]: gain < 0
          })}
        >
          <b>{round(gain)} $</b>
        </td>
        <td
          className={classNames({
            [styles.green]: percentageGain >= 0,
            [styles.red]: percentageGain < 0
          })}
        >
          <b>{round(percentageGain)}%</b>
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
          <b>{deposit} $</b>
        </td>
        <td>
          <b>{round(actualPrice)} $</b>
        </td>
        <td>=</td>
        <td
          className={classNames({
            [styles.green]: overallGain >= 0,
            [styles.red]: overallGain < 0
          })}
        >
          <b>{round(overallGain)} $</b>
        </td>
        <td
          className={classNames({
            [styles.green]: overallGain >= 0,
            [styles.red]: overallGain < 0
          })}
        >
          <b>{round(overallPercentageGain)}%</b>
        </td>
        <td />
        <td />
      </tr>
    </>
  )
}
