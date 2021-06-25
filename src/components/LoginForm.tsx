import * as React from "react";
import "./Button.css";
import { withRouter } from "react-router-dom";
import {RouteComponentProps} from "react-router";
var CryptoJS = require("crypto-js");

type FormValues = {
  shipName: string;
  shipURL: string;
  shipCode: string;
  encryptionPassword: string;
};

class LoginForm extends React.Component<RouteComponentProps, FormValues> {
    componentWillMount() {
        this.setState({
            shipName: '',
            shipURL: '',
            shipCode: '',
            encryptionPassword: ''
        })
    }

    onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        // Encrypt the ship URL and ship +code
        let encryptedURL = CryptoJS.AES.encrypt(this.state.shipURL, this.state.encryptionPassword).toString();
        let encryptedCode = CryptoJS.AES.encrypt(this.state.shipCode, this.state.encryptionPassword).toString();

        // Save the unencrypted ship name together with the encrypted ship URL & +code
        let encryptedCredentials = {
            shipName: this.state.shipName,
            encryptedShipURL: encryptedURL,
            encryptedShipCode: encryptedCode,
        }

        // Store new encrypted credentials into ship list
        chrome.storage.local.get("ships", (res) => {
            if (res["ships"]) {
                let new_ships = res["ships"];
                new_ships.push(encryptedCredentials)
                chrome.storage.local.set({ ships: new_ships });
            } else {
                let new_ships = [encryptedCredentials];
                chrome.storage.local.set({ ships: new_ships });
            }
        });

        this.props.history.push("/ship-added")
        chrome.storage.local.set({ location: this.props.history.location });
        this.props.history.replace("/ship-added")
    };

    onChangeName = (e: React.FormEvent<HTMLInputElement>): void => {
        this.setState({
            shipName: e.currentTarget.value
        })
    };
    onChangeURL = (e: React.FormEvent<HTMLInputElement>): void => {
        this.setState({
            shipURL: e.currentTarget.value,
        })
    };
    onChangeCode = (e: React.FormEvent<HTMLInputElement>): void => {
        this.setState({
            shipCode: e.currentTarget.value
        })
    };
    onChangePassword = (e: React.FormEvent<HTMLInputElement>): void => {
        this.setState({
            encryptionPassword: e.currentTarget.value
        })
    };


    render() {
        return (
            <form onSubmit={this.onSubmit}>
            <div>
                <input
                    name='shipName'
                    id='loginFormShipName'
                    className='loginFormInput'
                    placeholder='Ship Name'
                    onChange={this.onChangeName}
                    required
                    />
                <input
                    name='shipURL'
                    id='loginFormShipURL'
                    className='loginFormInput'
                    placeholder='Ship URL'
                    onChange={this.onChangeURL}
                    required
                    />
                <input
                    name='shipCode'
                    id='loginFormShipCode'
                    className='loginFormInput'
                    placeholder='Ship +code'
                    onChange={this.onChangeCode}
                    required
                    />
                <input
                    name='encryptionPassword'
                    id='loginFormEncryptionPassword'
                    className='loginFormInput'
                    placeholder='Ship Password'
                    onChange={this.onChangePassword}
                    type='password'
                    required
                    />
                <div className="buttonContainer">
                    <button className="loginButton" type='submit'>
                    Add Ship
                    </button>
                </div>
            </div>
            </form>
        );
    };
}

export default withRouter(LoginForm);