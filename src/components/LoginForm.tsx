import * as React from "react";
import "./Button.css";
var CryptoJS = require("crypto-js");

type FormValues = {
  shipName: string;
  shipURL: string;
  shipCode: string;
  encryptionPassword: string;
};

class LoginForm extends React.Component<{}, FormValues> {
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

        // Store new encrypted credentials into account list
        chrome.storage.local.get("accounts", (res) => {
            if (res["accounts"]) {
                let new_accounts = res["accounts"];
                new_accounts.push(encryptedCredentials)
                chrome.storage.local.set({ accounts: new_accounts });
            } else {
                let new_accounts = [encryptedCredentials];
                chrome.storage.local.set({ accounts: new_accounts });
            }
        });
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
                    placeholder='Account Password'
                    onChange={this.onChangePassword}
                    type='password'
                    required
                    />
                <div className="buttonContainer">
                    <button className="loginButton" type='submit'>
                       Login
                    </button>
                </div>
            </div>
            </form>
        );
    };
}

export default LoginForm;