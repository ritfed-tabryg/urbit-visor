import * as React from "react";
import { motion } from "framer-motion";
import visorLogo from "../../icons/visor.png"


export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="about padding">
      <a href ="https://urbitvisor.com"><img src={visorLogo} className="about-visor-logo" /></a>
      <div className="about-version">
        <p>Version: 0.1.0</p>
      </div>
      <div className="about-description">
        <p>Urbit Visor is an extension which transforms your web browser into a first class Urbit client. Its goal is to allow existing web tech to seamlessly integrate together with the novel functionality of Urbit.</p>
      </div>
      <div className="about-created-by">
        <a href="https://dcspark.io" rel="noopener noreferrer" target="_blank">
          <img src="/dcsparklogo.png" alt="" className="about-dcspark-logo" />
        </a>
      </div>
    </motion.div>
  )
}
