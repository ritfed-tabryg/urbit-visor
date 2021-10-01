import * as React from "react";
import { useState } from "react";
import { useHistory } from "react-router";
import { Messaging } from "../../messaging";
import { motion } from "framer-motion";


export default function Setup() {
    const history = useHistory();
    const [pw, setpw] = useState("");
    const [tooltip, setTooltip] = useState(false);
    const [confirmationpw, setconfirmation] = useState("");
    const [error, setError] = useState("");
    function showTooltip() { setTooltip(true) };
    function hideTooltip() { setTooltip(false) };
    function validate(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (pw === confirmationpw) {
            setError("");
            Messaging.sendToBackground({ action: "set_master_password", data: { password: pw } })
                .then(res => {
                    history.push("/add_ship");
                })
        } else {
            setError("Passwords do not match")
        }
    }
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="setup padding flex-grow-wrapper">
            <p>Please set up a master password for this extension.
                <span
                    className="tooltip-trigger"
                    onMouseLeave={hideTooltip}
                    onMouseOver={showTooltip}>
                    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" className="iconify iconify--clarity" width="18" height="18" preserveAspectRatio="xMidYMid meet" viewBox="0 0 36 36"><path className="clr-i-solid clr-i-solid-path-1" d="M18 6a12 12 0 1 0 12 12A12 12 0 0 0 18 6zm-2 5.15a2 2 0 1 1 2 2a2 2 0 0 1-2.1-2zM23 24a1 1 0 0 1-1 1h-7a1 1 0 1 1 0-2h2v-6h-1a1 1 0 0 1 0-2h4v8h2a1 1 0 0 1 1 1z" fill="currentColor"></path></svg>
                </span></p>
            {tooltip && <div className="tooltip"><p>The password will be used to encrypt the credentials to access your Urbit ships.</p></div>}
            <form onSubmit={validate} className="form flex-grow-wrapper">
                <div className="inputs flex-grow">
                    <label>Password<input onChange={(e) => setpw(e.currentTarget.value)} type="password" /></label>
                    <label>Confirm password<input onChange={(e) => setconfirmation(e.currentTarget.value)} type="password" /></label>
                    <p className="errorMessage">{error}</p>
                </div>
                <button className="single-button submit-setup-button">Submit</button>
            </form>
        </motion.div>
    );
}
