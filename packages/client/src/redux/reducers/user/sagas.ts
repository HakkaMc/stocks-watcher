import { all, call, cancel, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import gql from 'graphql-tag'
import { actions } from '../../index'
import { SelectedSymbols } from '../../../types/redux/user'

export function* setDashboardSelectedSymbols():any {
  const data: SelectedSymbols = [
    {
      description: 'APPLE INC',
      displaySymbol: 'AAPL',
      symbol: 'AAPL',
      type: 'Common Stock'
    },
    {
      description: 'NIO INC - ADR',
      displaySymbol: 'NIO',
      symbol: 'NIO',
      type: 'ADR'
    },
    {
      description: 'COINBASE BTC/USD',
      displaySymbol: 'BTC/USD',
      symbol: 'COINBASE:BTC-USD',
      type: 'Crypto'
    },
    {
      description: 'TESLA INC',
      displaySymbol: 'TSLA',
      symbol: 'TSLA',
      type: 'Common Stock'
    },
    {
      description: 'COINBASE XRP/USD',
      displaySymbol: 'XRP/USD',
      symbol: 'COINBASE:XRP-USD',
      type: 'Crypto'
    },
    {
      description: 'NOVAVAX INC',
      displaySymbol: 'NVAX',
      symbol: 'NVAX',
      type: 'Common Stock'
    },
    {
      description: 'MODERNA INC',
      displaySymbol: 'MRNA',
      symbol: 'MRNA',
      type: 'Common Stock'
    },
    {
      description: 'JAGUAR HEALTH INC',
      displaySymbol: 'JAGX',
      symbol: 'JAGX',
      type: 'Common Stock'
    },
    {
      description: 'BIONANO GENOMICS INC',
      displaySymbol: 'BNGO',
      symbol: 'BNGO',
      type: 'Common Stock'
    },
    {
      description: 'TRANSENTERIX INC',
      displaySymbol: 'TRXC',
      symbol: 'TRXC',
      type: 'Common Stock'
    },
    {
      description: 'OCUGEN INC',
      displaySymbol: 'OCGN',
      symbol: 'OCGN',
      type: 'Common Stock'
    },
    {
      description: 'GEVO INC',
      displaySymbol: 'GEVO',
      symbol: 'GEVO',
      type: 'Common Stock'
    },
    {
      description: 'SUNPOWER CORP',
      displaySymbol: 'SPWR',
      symbol: 'SPWR',
      type: 'Common Stock'
    },
    {
      description: 'XPENG INC - ADR',
      displaySymbol: 'XPEV',
      symbol: 'XPEV',
      type: 'ADR'
    },
    {
      description: 'LI AUTO INC - ADR',
      displaySymbol: 'LI',
      symbol: 'LI',
      type: 'ADR'
    },
    {
      description: 'COINBASE ETH/USD',
      displaySymbol: 'ETH/USD',
      symbol: 'COINBASE:ETH-USD',
      type: 'Crypto'
    }
  ]

  yield put(actions.user.setDashboardSelectedSymbols(data))
}
