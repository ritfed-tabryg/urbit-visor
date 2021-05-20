import * as React from "react";
import "./Button.css";


type FormValues = {
  shipName: string;
  shipURL: string;
  shipCode: string;
};

class LoginForm extends React.Component<{}, FormValues> {
    componentWillMount() {
        this.setState({
            shipName: '',
            shipURL: '',
            shipCode: ''
        })
    }

    onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        chrome.storage.local.set({ loginCredentials: this.state });
    };

    onChangeName = (e: React.FormEvent<HTMLInputElement>): void => {
        chrome.storage.local.set({ test3: e.currentTarget.name });
        this.setState({
            shipName: e.currentTarget.value,
            shipURL: this.state.shipURL,
            shipCode: this.state.shipCode
        })
    };

    onChangeURL = (e: React.FormEvent<HTMLInputElement>): void => {
        chrome.storage.local.set({ test3: e.currentTarget.name });
        this.setState({
            shipName: this.state.shipName,
            shipURL: e.currentTarget.value,
            shipCode: this.state.shipCode
        })
    };

    onChangeCode = (e: React.FormEvent<HTMLInputElement>): void => {
        chrome.storage.local.set({ test3: e.currentTarget.name });
        this.setState({
            shipName: this.state.shipName,
            shipURL: this.state.shipURL,
            shipCode: e.currentTarget.value
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