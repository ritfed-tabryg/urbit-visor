import * as React from "react";
import { motion } from "framer-motion";


export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="about padding">
      <div className="about-title">
        <h4>Urbit Visor</h4>
      </div>
      <p>Version: 0.1.0</p>
      <div className="about-description">
        <p>Urbit Visor is an extension which transforms your web browser into a first class Urbit client. Its goal is to allow existing web tech to seamlessly integrate together with the novel functionality of Urbit.</p>
      </div>
      <div className="about-created-by">
        {/* <p>Created by:</p> */}
        <a href="https://dcspark.io" rel="noopener noreferrer" target="_blank">
          <img src="/dcsparklogo.png" alt="" />
        </a>
      </div>
    </motion.div>
  )
}
