import { useSelector } from 'react-redux'
import { dispatchers, ReduxState } from './index'

//
// type UseRedux<TSelect = unknown> = {
//   dispatchers: typeof dispatchers
//   state: TSelect
// }

// export const useStore<TSelected = unknown> = (
//   selectorCallback: (state: ReduxState) => void
// ): {
//   dispatchers: typeof dispatchers
//   state: TSelected
// } => {
//   return {
//     dispatchers
//   }
// }
//
// export function useRedux<TSelect = unknown>(selector: (state: ReduxState) => TSelect): UseRedux<TSelect> {
//   const state = useSelector((state: ReduxState) => state)
//
//   return {
//     dispatchers,
//     state: selector(state)
//   }
// }

export function useRedux<TSelected = unknown>(
  selector?: (reduxState: ReduxState) => TSelected
): { selectedState: TSelected; dispatchers: typeof dispatchers } {
  const wholeState = useSelector((state: ReduxState) => state)

  let selectedState = {} as TSelected
  if (selector) {
    selectedState = selector(wholeState)
  }

  return {
    dispatchers,
    selectedState
  }
}
