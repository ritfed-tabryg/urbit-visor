import * as React from "react";
import { useState } from "react";
import Form from "./Form";
import Confirm from "./Confirm"
import Urbit from "@urbit/http-api";
import { fetchShipname } from "../../urbit";
import { storeCredentials } from "../../storage";
import { useHistory } from "react-router";

interface AddShipProps{
  add: (ship: string, url: string, code: string, pw: string) => void,
  cachedURL: string
}


export default function AddShip(props: AddShipProps) {

  async function getShipname(url: string) : Promise<void>{
    const shipname = await fetchShipname(url);
    setShip(shipname);
  }
  async function save(url: string, code: string, pw: string): Promise<any> {
    props.add(ship, url, code, pw);
  }

  const [url, setUrl] = useState(props.cachedURL);
  const [ship, setShip] = useState(null);
  const [code, setCode] = useState("hatlen-samnex-faswyl-maclex");
  const [confirm, setConfirm] = useState(false);
  const component =
    confirm
      ? <Confirm
        url={url.replace(/\/$/g, '')}
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