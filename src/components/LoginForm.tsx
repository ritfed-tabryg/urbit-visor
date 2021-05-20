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
        chrome.storage.local.set({ loginCredentials: this.state });
    };

    onChangeName = (e: React.FormEvent<HTMLInputElement>): void => {
        chrome.storage.local.set({ test3: e.currentTarget.name });
        this.setState({
            shipName: e.currentTarget.value
        })
    };

    onChangeURL = (e: React.FormEvent<HTMLInputElement>): void => {
        chrome.storage.local.set({ test3: e.currentTarget.name });
        this.setState({
            shipURL: e.currentTarget.value,
        })
    };

    onChangeCode = (e: React.FormEvent<HTMLInputElement>): void => {
        chrome.storage.local.set({ test3: e.currentTarget.name });
        this.setState({
            shipCode: e.currentTarget.value
        })
    };

    onChangePassword = (e: React.FormEvent<HTMLInputElement>): void => {
        chrome.storage.local.set({ test3: e.currentTarget.name });
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