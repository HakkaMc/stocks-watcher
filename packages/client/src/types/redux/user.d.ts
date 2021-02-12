import { SearchedSymbolObj } from '../finnhub'

export type SelectedSymbol = SearchedSymbolObj

export type SelectedSymbols = Array<SelectedSymbol>

export type User = {
  authorized: boolean
}

// export type SetDashboardSelectedSymbolsPayload = SelectedSymbols
