import React from 'react'

// export const storeContext = {
//     selectedSymbols: ['AAPL', 'BINANCE:BTCUSDC'],
//     addSymbol: (symbol: string) => {
//
//     }
// }

export type Action = {
  type: string
  payload: any
}

const initialState = {
  episodes: [],
  favourites: [],
  selectedSymbols: ['AAPL', 'BINANCE:BTCUSDC']
}

let disp = (action: Action) => {}

const storeContext = {
  state: initialState,
  dispatch: {
    addSymbol: (symbol: string) =>
      disp({
        type: 'ADD_SYMBOL',
        payload: symbol
      })
  }
}

export const StoreContext = React.createContext(storeContext)

//
// const initialState = {
//     selectedSymbols: ['AAPL', 'BINANCE:BTCUSDC'],
// }

const reducer = (state: any, action: Action) => {
  // switch (action.type) {
  //     case 'SET_VISIBILITY_FILTER':
  //         return action.payload;
  //     default:
  //         return state;
  // }
  switch (action.type) {
    case 'FETCH_DATA':
      return { ...state, episodes: action.payload }
    case 'ADD_SYMBOL':
      return { ...state, selectedSymbols: [...state.selectedSymbols, action.payload] }
      break
    default:
      return state
  }
}

export const StoreProvider = ({ children }: { children: any }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  disp = dispatch

  const value = {
    ...storeContext,
    state
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
