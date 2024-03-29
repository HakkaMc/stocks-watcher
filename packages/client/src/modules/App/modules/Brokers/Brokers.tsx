import React, { useMemo } from 'react'
import { Box, Icon } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import { Add as AddIcon } from '@material-ui/icons'

import eToroIcon from '../../../../assets/imgs/eToro.png'
import degiroIcon from '../../../../assets/imgs/degiro.jpg'
import trading212Icon from '../../../../assets/imgs/trading212.png'
import xtbIcon from '../../../../assets/imgs/xtb.png'
import binanceIcon from '../../../../assets/imgs/binance.png'
import interactiveBrokersIcon from '../../../../assets/imgs/interactiveBrokers.png'
import tradeStationIcon from '../../../../assets/imgs/tradeStation.png'
import tradingView from '../../../../assets/imgs/tradingView.jpg'

import styles from './styles.module.scss'

const links = [
  { link: 'https://www.etoro.com', name: 'eToro', icon: eToroIcon, shortcut: 'eTr' },
  { link: 'https://xstation5.xtb.com', name: 'XTB', icon: xtbIcon, shortcut: 'XTB' },
  { link: 'https://live.trading212.com', name: 'Trading 212', icon: trading212Icon, shortcut: '212' },
  { link: 'https://trader.degiro.nl', name: 'Degiro', icon: degiroIcon, shortcut: 'Deg' },
  { link: 'https://www.binance.com', name: 'Binance', icon: binanceIcon, shortcut: 'Bin' },
  {
    link: 'https://www.interactivebrokers.com',
    name: 'Interactive Brokers',
    icon: interactiveBrokersIcon,
    shortcut: 'IB'
  },
  { link: 'https://www.tradestation.com', name: 'Trade Station', icon: tradeStationIcon, shortcut: 'TrS' },
  { link: 'https://www.tradingview.com', name: 'Trading View', icon: tradingView, shortcut: 'TrV' }
]

// /*<IconButton style={{ color: grey[100] }}>*/
// /*    <KeyboardBackspaceIcon />              */
// /*</IconButton>*/

export const Brokers = () => {
  const linksComponent = useMemo(() => {
    const ret: any = []

    links.forEach((linkObj) =>
      ret.push(
        <a href={linkObj.link} target="_blank" rel="noreferrer" key={linkObj.link}>
          <img src={linkObj.icon} alt="icon" />
        </a>
      )
    )

    // for (let i = 0; i < 8 - links.length; i += 1) {
    //   ret.push(
    //     <div key={`empty_${0}`} className={styles.emptyWrapper}>
    //       <div>
    //         <Icon>
    //           <AddIcon />
    //         </Icon>
    //       </div>
    //     </div>
    //   )
    // }

    return ret
  }, [])

  return (
    <Box pl={5} bgcolor={grey[800]} className={styles.container}>
      <div className={styles.grid}>{linksComponent}</div>
    </Box>
  )
}
