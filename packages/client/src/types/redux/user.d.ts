import { SearchedSymbolObj } from '../finnhub'

export type SelectedSymbol = SearchedSymbolObj

export type SelectedSymbols = Array<SelectedSymbol>

export type User = {
  dashboard: {
    selectedSymbols: SelectedSymbols
  }
}

// export type SetDashboardSelectedSymbolsPayload = SelectedSymbols
