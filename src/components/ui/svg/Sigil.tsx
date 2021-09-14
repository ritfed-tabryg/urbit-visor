import * as React from "react";
import { useState } from "react";
import { sigil, reactRenderer } from '@tlon/sigil-js';
import comet from "../../../icons/comet.svg";
interface SigilProps {
  patp: string,
  size: number
  // colors: string[]
}

const Sigil = (props: SigilProps) => {

  function setPatp(patp: string): string {
    if (props.patp.length > 28) return props.patp.slice(-13);
    else if (props.patp.length > 13) return props.patp.slice(-13);
    else return props.patp
  }
  function setColors(patp: string): any {
    if (props.patp.length > 28) return ['purple', 'yellow'];
    else if (props.patp.length > 13) return ['grey', 'white'];
    else return ['black', 'white'];
  }

  const styles = {
    height: props.size,
    width: props.size,
  };
  const cometStyle = { fill: "var(--foreground)" };
  if (props.patp.length > 28) return (
    <div style={styles}>
      <svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <g>
          <path style={cometStyle} d="M503.694,7.871c1.344-2.047,1.047-4.781-0.734-6.453c-1.781-1.703-4.5-1.891-6.484-0.438l-98.547,71.344
		c-1.891,1.359-4.484,1.266-6.266-0.25s-2.313-4.047-1.266-6.141l10.844-21.656c1.031-2.047,0.547-4.547-1.156-6.063
		c-1.719-1.531-4.25-1.719-6.172-0.469L83.006,230.137c-3.156,1.813-6.297,3.688-9.328,5.75l-0.25,0.156l0.016,0.016
		c-7.625,5.219-14.922,11.125-21.688,17.891c-59.047,59.031-59.047,154.75-0.016,213.766
		c29.531,29.516,68.219,44.281,106.906,44.281s77.359-14.766,106.891-44.281c6.766-6.766,12.656-14.047,17.875-21.672v0.016
		l0.109-0.172c1.844-2.703,3.516-5.484,5.172-8.281l188.375-302.078c1.203-1.844,1.094-4.25-0.281-5.953
		c-1.375-1.734-3.688-2.375-5.75-1.594l-46.829,17.563c-2.063,0.75-4.375,0.125-5.75-1.594s-1.484-4.125-0.266-5.953L503.694,7.871z
		 M158.647,464.73c-27.766,0-53.859-10.797-73.484-30.438c-40.5-40.5-40.5-106.406,0-146.922
		c6.813-6.797,14.422-12.469,22.578-17.063c7.406-4.172,15.297-7.391,23.5-9.641c0.766-0.203,1.547-0.375,2.344-0.578
		c3.172-0.797,6.406-1.422,9.672-1.906c1.031-0.156,2.047-0.328,3.078-0.453c4.047-0.484,8.156-0.797,12.313-0.797
		c27.75,0,53.828,10.813,73.453,30.438c2.344,2.328,4.516,4.781,6.578,7.281c0.688,0.813,1.297,1.672,1.938,2.5
		c1.344,1.734,2.641,3.469,3.859,5.25c0.703,1.031,1.359,2.063,2.016,3.109c1.047,1.656,2.047,3.344,3,5.063
		c0.609,1.109,1.219,2.234,1.797,3.359c0.859,1.719,1.656,3.484,2.422,5.234c0.5,1.141,1.031,2.266,1.484,3.422
		c0.813,2.063,1.516,4.172,2.188,6.266c0.656,2.031,1.219,4.063,1.75,6.125c0.391,1.563,0.813,3.109,1.141,4.688
		c0.344,1.703,0.609,3.438,0.875,5.156c0.188,1.219,0.375,2.438,0.516,3.656c0.219,1.875,0.391,3.75,0.5,5.625
		c0.063,1.016,0.109,2.047,0.156,3.063c0.063,2.047,0.109,4.094,0.047,6.141c-0.016,0.656-0.063,1.328-0.094,1.984
		c-0.453,10.406-2.438,20.766-6,30.688c-0.063,0.219-0.141,0.438-0.219,0.641c-0.891,2.422-1.875,4.813-2.938,7.188
		c-0.125,0.266-0.266,0.563-0.391,0.828c-1.125,2.406-2.313,4.781-3.609,7.094c-4.547,8.078-10.141,15.703-17,22.563
		C212.475,453.934,186.397,464.73,158.647,464.73z"></path>
        </g>
      </svg>

    </div>
  )
  else
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