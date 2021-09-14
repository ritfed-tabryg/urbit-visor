import * as React from "react";
import logo from "../../icons/urbit.svg";
import { useHistory } from "react-router";
import { motion } from "framer-motion";

export default function Welcome() {
  const history = useHistory();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="welcome padding flex-grow-wrapper">
      <div className="flex-grow">
        <img src={logo} className="App-logo" />
      </div>
      <button onClick={() => history.push("/setup")} className="single-button add-ship-button">Setup</button>
    </motion.div>
  );
}
