import React from "react";
import {useEffect, useState} from "react";
import {
    helloWorldContract, connectWallet, updateMessage, loadCurrentMessage, getCurrentWalletConnected,
} from "../utils/interact.js";


const MessageBlock = () => {
    //state variables
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");
    const [message, setMessage] = useState("No connection to the network."); //default message
    const [newMessage, setNewMessage] = useState("");

    //called only once
    useEffect(() => {
        initCurrentMessage();
        initCurrentWallet();
        addSmartContractListener();
        addWalletListener();
    }, []);

    const initCurrentMessage = async () => {
        const message = await loadCurrentMessage();
        setMessage(message);
    }

    const initCurrentWallet = async () => {
        const {address, status} = await getCurrentWalletConnected();
        setWallet(address);
        setStatus(status);
    }

    function addSmartContractListener() {
        helloWorldContract.events.UpdatedMessages({}, (error, data) => {
            if (error) {
                setStatus("😥 " + error.message)
            } else {
                setMessage(data.returnValues[1])
                setNewMessage("")
                setStatus("🎉 Your message has been updated!")
            }
        });
    }

    function addWalletListener() { //TODO: implement
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setWallet(accounts[0])
                    setStatus("👆🏽 Write a message in the text-field above.")
                } else {
                    setWallet("")
                    setStatus("🦊 Connect to MetaMask using the top right button.")
                }
            })
        } else {
            setStatus(<p>
                {" "}
                🦊 <a target="_blank" href={`https://metamask.io/download.html`}>
                You must install MetaMask, a virtual Ethereum wallet, in your browser.
            </a>
            </p>)
        }
    }

    const connectWalletPressed = async () => {
        const walletResponse = await connectWallet();
        setStatus(walletResponse.status);
        setWallet(walletResponse.address);
    };

    const onUpdatePressed = async () => {
        const {status} = await updateMessage(walletAddress, newMessage);
        setStatus(status);
    };

    //the UI of our component
    return (<div id="container">
        <button id="walletButton" onClick={connectWalletPressed}>
            {walletAddress.length > 0 ? ("Connected: " + String(walletAddress).substring(0, 6) + "..." + String(walletAddress).substring(38)) : (
                <span>Connect Wallet</span>)}
        </button>

        <h2 style={{paddingTop: "50px"}}>Current Message:</h2>
        <p>{message}</p>

        <h2 style={{paddingTop: "18px"}}>New Message:</h2>

        <div>
            <input
                type="text"
                placeholder="Update the message in your smart contract."
                onChange={(e) => setNewMessage(e.target.value)}
                value={newMessage}
            />
            <p id="status">{status}</p>

            <button id="publish" onClick={onUpdatePressed}>
                Update
            </button>
        </div>
    </div>);
};

export default MessageBlock;