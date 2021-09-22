import * as React from "react";
import { useState, useEffect } from "react";
import Form from "./Form";
import Confirm from "./Confirm"
import { useHistory } from "react-router";
import { Messaging } from "../../messaging";
import { motion } from "framer-motion";



export default function AddShip() {
  useEffect(()=>{
    let isMounted = true;
    Messaging.sendToBackground({action: "get_cached_url"})
      .then(res => {
        if (isMounted) setURL(res.cached_url)
      })
      return () => { isMounted = false }; 
  }, [])
  const history = useHistory();


  async function save(url: string, code: string, pw: string): Promise<any> {
    Messaging.sendToBackground({action: "add_ship", data: {ship: ship, url: url, code: code, pw: pw}})
      .then(res => history.push(`/ship/${ship}`));
  }

  const [url, setURL] = useState("http://localhost");
  const [ship, setShipName] = useState<string>(null);
  const [code, setCode] = useState("");
  const component =
    ship
      ? <Confirm
        url={url.replace(/\/$/g, '')}
        code={code}
        save={save}
        ship={ship}
        goBack={() => setShipName(null)}
      />
      : <Form
        url={url}
        code={code}
        setUrl={setURL}
        setCode={setCode}
        setShipName={setShipName}
      />
  return (
    <motion.div
    initial={{opacity: 0}}
    animate={{opacity: 1}}
    exit={{opacity: 0}}
    className="full-size"
    >
      {component}
    </motion.div>
  )
}