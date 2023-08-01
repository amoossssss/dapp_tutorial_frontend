const contractABI = require("../contracts/contract-abi.json");
const {createAlchemyWeb3} = require("@alch/alchemy-web3");

const contractAddress = "0x6c427A96517A70184ec1e7243A67044C9A266260";
const alchemyKey = "wss://eth-goerli.ws.alchemyapi.io/v2/nAvZk20L_FhXJTemxxI9iziP-s7Ogi6u";

const web3 = createAlchemyWeb3(alchemyKey);

export const helloWorldContract = new web3.eth.Contract(contractABI, contractAddress);

export const loadCurrentMessage = async () => {
    return await helloWorldContract.methods.message().call();
};

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            })
            const obj = {
                status: "👆🏽 Write a message in the text-field above.", address: addressArray[0],
            }
            return obj
        } catch (err) {
            return {
                address: "", status: "😥 " + err.message,
            }
        }
    } else {
        return {
            address: "", status: (<span>
                    <p>
                    {" "}
                        🦊 <a target="_blank" href={`https://metamask.io/download.html`}>
                      You must install MetaMask, a virtual Ethereum wallet, in your
                      browser.
                    </a>
                    </p>
                </span>),
        }
    }
};

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts",
            })
            if (addressArray.length > 0) {
                return {
                    address: addressArray[0], status: "👆🏽 Write a message in the text-field above.",
                }
            } else {
                return {
                    address: "", status: "🦊 Connect to MetaMask using the top right button.",
                }
            }
        } catch (err) {
            return {
                address: "", status: "😥 " + err.message,
            }
        }
    } else {
        return {
            address: "", status: (<span>
          <p>
            {" "}
              🦊 <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install MetaMask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>),
        }
    }
};

export const updateMessage = async (address, message) => {
    if (!window.ethereum || address === null) {
        return {
            status: "💡 Connect your MetaMask wallet to update the message on the blockchain.",
        }
    }

    if (message.trim() === "") {
        return {
            status: "❌ Your message cannot be an empty string.",
        }
    }

    //set up transaction parameters
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: address, // must match user's active address.
        data: helloWorldContract.methods.update(message).encodeABI(),
    }

    //sign the transaction
    try {
        const txHash = await window.ethereum.request({
            method: "eth_sendTransaction", params: [transactionParameters],
        })
        return {
            status: (<span>
        ✅{" "}
                <a target="_blank" href={`https://goerli.etherscan.io/tx/${txHash}`}>
          View the status of your transaction on Etherscan!
        </a>
        <br/>
        ℹ️ Once the transaction is verified by the network, the message will be
        updated automatically.
      </span>),
        }
    } catch (error) {
        return {
            status: "😥 " + error.message,
        }
    }
};