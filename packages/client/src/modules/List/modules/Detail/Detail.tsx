import React from 'react'
import { RocIndicator } from './modules/RocIndicator/RocIndicator'
import {Flags} from './modules/Flags/Flags'

type Props = {
  symbol: string
  shown: boolean
}

export const Detail = ({ symbol, shown }: Props) => {
  return (<>
      {shown && <div>
      <Flags/>
      <RocIndicator symbol={symbol} shown={shown} />
    </div>}
    </>
  )
}
