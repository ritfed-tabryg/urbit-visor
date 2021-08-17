import * as React from "react";
import { useState } from "react";
import Form from "./Form";
import Confirm from "./Confirm"
import Urbit from "@urbit/http-api";
import { initPerms } from "../../urbit";
import { storeCredentials } from "../../storage";
import { useHistory } from "react-router";

interface AddShipProps{
  add: (ship: string, url: string, code: string, pw: string) => void
}


export default function AddShip(props: AddShipProps) {

  async function getShipname(url: string, code: string) : Promise<void>{
    const res = await fetch(url.replace(/\/$/g, '') + "/~/login");
    const parser = new DOMParser();
    const htmlString = await res.text();
    const doc = parser.parseFromString(htmlString, "text/html");
    // TODO flag this as potentially changing at some point;
    const shipname = doc.querySelector('input').value;
    setShip(shipname.replace("~", ""));
  }
  async function save(url: string, code: string, pw: string): Promise<any> {
    props.add(ship, url, code, pw);
  }

  const history = useHistory();
  const [url, setUrl] = useState("http://localhost");
  const [ship, setShip] = useState(null);
  const [code, setCode] = useState("hatlen-samnex-faswyl-maclex");
  const [confirm, setConfirm] = useState(false);
  const component =
    confirm
      ? <Confirm
        url={url}
        code={code}
        save={save}
        ship={ship}
        goBack={() => setConfirm(false)}
      />
      : <Form
        url={url}
        code={code}
        setUrl={setUrl}
        setCode={setCode}
        getShipname={getShipname}
        setConfirm={setConfirm}
      />
  return (
    <>
      {component}
    </>
  )
}