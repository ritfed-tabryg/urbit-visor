import * as React from "react";
import {useState} from "react";
import { sigil, reactRenderer } from '@tlon/sigil-js'
interface SigilProps {
  patp: string,
  size: number
  // colors: string[]
}

const Sigil = (props: SigilProps) => {
  
  function setPatp(patp: string): string{
    if(props.patp.length > 28) return props.patp.slice(-13);
    else if(props.patp.length > 13) return props.patp.slice(-13);
    else return props.patp
  }
  function setColors(patp: string): any{
    if (props.patp == "sampel-palnet") return ["white", "red"]
    else if(props.patp.length > 28) return ['purple', 'yellow'];
    else if(props.patp.length >  13) return ['grey', 'white'];
    else return ['black', 'white'];
  }

  const styles = {
    height: props.size,
    width: props.size
  };
    return (
      <>
        {
          sigil({
            patp: setPatp(props.patp),
            renderer: reactRenderer,
            size: props.size,
            colors: setColors(props.patp),
          })
        }
      </>
    )
  }


export default Sigil;