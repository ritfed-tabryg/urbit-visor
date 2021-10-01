import React, { useState, useRef } from "react";
import { useOnClickOutside } from '../../hooks/hooks';
import "./navbar.css";
import Sigil from "./svg/Sigil"
import visorLogo from "../../icons/visor.png"
import RocketIcon from "../../icons/rocket";
import SettingsIcon from "../../icons/settings";
import AboutIcon from "../../icons/info";
import { useHistory } from "react-router-dom";
import { EncryptedShipCredentials } from "../../types/types";
import { Messaging } from "../../messaging";
interface NavbarProps{
  active: EncryptedShipCredentials
  interacting: boolean
}
export default function NavBar({interacting, active}: NavbarProps) {
  const history = useHistory();
  const urbitlogo = useRef(null);
  const [modalOpen, toggleModal] = useState(false);
  const wrapperClass = active ? "navbar-sigil-wrapper active-navbar-sigil" : "navbar-sigil-wrapper inactive-navbar-sigil";
  const className = active ? "navbar-sigil" : "navbar-sigil blurry-sigil"
  const dummy =
    <div className="dummy-sigil">
    </div>
  const sigil =
    <div onClick={gotoSigil} className={className}>
      <Sigil size={50} patp={active?.shipName} />
    </div>
  function openMenu(){
    if (!interacting) toggleModal(!modalOpen)
  };
  function gotoSigil(){
    if (!interacting) {
      Messaging.sendToBackground({ action: "select_ship", data: { ship: active } })
            .then(res => history.push(`/ship/${active.shipName}`))
    }
  };
  const displaySigil = active ? sigil : dummy;

  return (<nav className="App-navbar">
    <img ref={urbitlogo} onClick={openMenu} src={visorLogo} className="Nav-logo" />
      <div className="navbar-title">
        <h4>Urbit Visor</h4>
      </div>
    <div className={wrapperClass}>
      {displaySigil}
    </div>
    {modalOpen &&
      <Modal
        parent={urbitlogo}
        hide={() => toggleModal(!modalOpen)}
      />
    }
  </nav>);
}

interface ModalProps{
  parent: any,
  hide: () => void,
}

function Modal({parent, hide}: ModalProps) {
  const history = useHistory();
  const ref = useRef(null);
  const refs = [ref, parent];
  const handleClickOutside = () => hide();
  function gotoShips() {
    hide();
    history.push("/ship_list");
  };
  function gotoSettings() {
    hide();
    history.push("/settings/menu");
  }
  function gotoAbout() {
    hide();
    history.push("/about");
  }
  useOnClickOutside(refs, handleClickOutside);
  return (
    <div ref={ref} className="navbar-modal">
      <div onClick={gotoShips} className="modal-link">
        <RocketIcon />
        <p>My Ships</p>
      </div>
      <div onClick={gotoSettings} className="modal-link">
       <SettingsIcon />
        <p>        Settings
        </p>
      </div>
      <div onClick={gotoAbout} className="modal-link">
        <AboutIcon />
        <p>About</p>
      </div>
    </div>
  )
}