import * as React from "react";
import { sigil, reactRenderer } from '@tlon/sigil-js'
interface SigilProps {
  patp: string,
  size: number
  // colors: string[]
}

const Sigil = (props: SigilProps) => {
  if (props.patp.length > 13) {
    return (
      <div className="comet-sigil"></div>
    )
  } else {
    return (
      <>
        {
          sigil({
            patp: props.patp,
            renderer: reactRenderer,
            size: props.size,
            colors: ['black', 'white'],
          })
        }
      </>
    )
  }
}

export default Sigil;