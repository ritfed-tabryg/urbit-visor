import React, { useState, useRef } from "react";
import { useOnClickOutside } from '../../hooks/hooks';
import "./navbar.css";
import Sigil from "./svg/Sigil"
import logo from "../../urbit.svg";
import { Link, useHistory } from "react-router-dom";
import { EncryptedShipCredentials } from "../../types/types";
import { processName } from "../../utils"



interface NavBarProps {
  ships: EncryptedShipCredentials[],
  selected: EncryptedShipCredentials,
  active: EncryptedShipCredentials,
  switchShip: (s: EncryptedShipCredentials) => void;
}

export default function NavBar(props: NavBarProps) {
  const history = useHistory();
  const urbitlogo = useRef(null);
  const [modalOpen, toggleModal] = useState(false);
  const wrapperClass = props.active ? "navbar-sigil-wrapper active-navbar-sigil" : "navbar-sigil-wrapper inactive-navbar-sigil";
  const className = props.active ? "navbar-sigil" : "navbar-sigil blurry-sigil"
  const dummy =
    <div className={className}>
      <Sigil size={50} patp={"sampel-palnet"} />
    </div>
  const sigil =
    <div onClick={() => history.push("/ship")} className={className}>
      <Sigil size={50} patp={props.active?.shipName} />
    </div>

  const displaySigil = props.active ? sigil : dummy;
  return (<nav className="App-navbar">
    <img ref={urbitlogo} onClick={() => toggleModal(!modalOpen)} src={logo} className="Nav-logo" />
    <Link to="/">
      <h4>Urbit Visor</h4>
    </Link>
    <div className={wrapperClass}>
      {displaySigil}
    </div>
    {modalOpen &&
      <Modal
        parent={urbitlogo}
        hide={() => toggleModal(!modalOpen)}
        select={(s: EncryptedShipCredentials) => props.switchShip(s)}
        {...props}
      />
    }
  </nav>);
}

interface ModalProps extends NavBarProps {
  parent: any,
  hide: () => void,
  select: (s: EncryptedShipCredentials) => void
}

function Modal(props: ModalProps) {
  const history = useHistory();
  const ref = useRef(null);
  const refs = [ref, props.parent];
  const handleClickOutside = () => props.hide();
  function gotoShips() {
    props.hide();
    history.push("/ship_list");
  };
  function gotoSettings() {
    props.hide();
    history.push("/settings/menu");
  }
  function gotoAbout() {
    props.hide();
    history.push("/about");
  }
  useOnClickOutside(refs, handleClickOutside);
  return (
    <div ref={ref} className="navbar-modal">
      <div onClick={gotoShips} className="modal-link">My Ships</div>
      <div onClick={gotoSettings} className="modal-link">Settings</div>
      <div onClick={gotoAbout} className="modal-link">About</div>
    </div>
  )
}