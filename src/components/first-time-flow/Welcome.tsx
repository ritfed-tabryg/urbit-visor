import * as React from "react";
import UrbitLogo from "../ui/svg/UrbitLogo";
import "./Welcome.css";


export default function WelcomePage(){
    function handleContinue(){
        console.log('oh hai')
    }
  return(
    <div className="welcome-page-wrapper">
    <div className="welcome-page">
      <UrbitLogo
        fillColor = "blue"
        strokeColor = "red"
        strokeWidth = "2"
      />
      <div className="welcome-page__header"><p>oh hai</p></div>
      <div className="welcome-page__description">
        <p>Urrrr</p>
        <p>Bitttt</p>
      </div>
      <button onClick={handleContinue} className="first-time-flow__button">Come on in</button>
    </div>
  </div>
  )
}