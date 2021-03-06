import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { createBrowserHistory } from "history";
import { FaWallet, FaSignOutAlt } from "react-icons/fa";
import Header from "./components/Header/Header";
import Home from "./views/Home";
import Artworks from "./views/Artworks";
import Artists from "./views/Artists";
import ProfilePage from "./views/ProfilePage";
import Art from "./views/Art";
import Create from "./views/Create";
import EditProfile from "./views/EditProfile";
import RequestForApproval from "./views/RequestForApproval";
import ProtectedRoute from "./utils/ProtectedRoute";

import MaticToken from "./assets/images/matic-token-icon.webp";

import "./App.css";
import styled from "styled-components";
import Footer from "./components/Footer/Footer";

import Web3Modal from "web3modal";
import web3 from "./ethereum/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { WalletLink } from "walletlink";

import coinbaseLogo from "./assets/images/coinbase-wallet-logo.svg";
import NotApproved from "./components/Create/NotApproved/NotApproved";

const axios = require("axios");

let provider;
const infuraId = process.env.REACT_APP_INFURA_ID;

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: flex-start;
`;

const AlertMsg = styled.div`
  position: fixed;
  top: 25vh;
  right: 0;
  background-color: red;
  padding: 20px 30px;
  color: white;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;

  @media only screen and (max-width: 600px) {
    zoom: 80%;
  }
`;

// console.log("INFURA_ID", infuraId);

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      // infuraId: infuraId, // required
      rpc: {
        1: `https://mainnet.infura.io/v3/${infuraId}`,
        4: `https://rinkeby.infura.io/v3/${infuraId}`,
        137: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`,
      },
    },
  },
  "custom-walletlink": {
    package: WalletLink,
    display: {
      logo: coinbaseLogo,
      name: "Coinbase Wallet",
      description: "Scan with WalletLink to connect",
    },
    options: {
      appName: "Prnts",
      // networkUrl: `https://mainnet.infura.io/v3/${infuraId}`,
      // networkUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`,
      networkUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}`,
      chainId: 137,
    },
    connector: async (_, options) => {
      const { appName, networkUrl, chainId } = options;
      const walletLink = new WalletLink({
        appName,
      });
      const provider = walletLink.makeWeb3Provider(networkUrl, chainId);
      await provider.enable();
      return provider;
    },
  },
};

const web3Modal = new Web3Modal({
  // network: "matic", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

const networks = {
  polygon: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
};

const changeNetwork = async ({ networkName, setError }) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName],
        },
      ],
    });

    console.log("provider: ", provider);
  } catch (err) {
    setError(err.message);
  }
};

const App = () => {
  const [account, setaccount] = useState("");
  const [windowDimension, setWindowDimension] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState();
  const [chainIdConnected, setChainId] = useState();

  const handleNetworkSwitch = async (networkName) => {
    setError();
    await changeNetwork({ networkName, setError });
    fetchChainId();
    // window.location.reload();
  };

  useEffect(() => {
    handleNetworkSwitch("polygon");
  }, []);

  const IsMobile = windowDimension <= 700;

  // useEffect(() => {
  //   onConnectWallet();
  // }, [])

  useEffect(() => {
    onConnectWallet();
    const getAccount = async () => {
      // console.log(web3);
      const accounts = await web3.eth.getAccounts();
      console.log("account in header: ", accounts[0]);
      // setaccount(accounts[0]);
    };
    getAccount();
    setWindowDimension(window.innerWidth);
    setIsMobile(IsMobile);
  }, [account]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleResize() {
      setWindowDimension(window.innerWidth);
    }
    setIsMobile(IsMobile);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [IsMobile]);

  const fetchAccount = async () => {
    // Time to reload your interface with accounts[0]!
    const account = await web3.eth.getAccounts();
    setaccount(account[0]);
    // accounts = await web3.eth.getAccounts();
    console.log(account);
  };

  useEffect(() => {
    async function listenMMAccount() {
      try {
        window.ethereum.on("accountsChanged", fetchAccount);
      } catch (err) {
        console.log("Browser wallet not installed!");
      }
    }
    listenMMAccount();
    return () => {
      window.ethereum.removeListener("accountsChanged", fetchAccount);
    };
  }, []);

  const onConnectWallet = async () => {
    console.log("connecting wallet...");
    console.log("cached provider", web3Modal.cachedProvider);
    try {
      provider = await web3Modal.connect();
      // web3Modal.connect().then(async (provider) => {
      //   await provider.send({
      //     method: "wallet_switchEthereumChain",
      //     params: {
      //       chainId: "0x89",
      //     },
      //   });
      // });
    } catch (err) {
      console.log("Could not get a wallet connection", err);
      return;
    }
    web3.setProvider(provider);

    const id = await web3.eth.getChainId();
    setChainId(id);

    console.log("chain id: ", id);
    if (id !== 137) {
      console.log("if not 137 trying to switch network, provider: ", provider);
      const payload = {
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0x89",
          },
        ],
        // method: "eth_sign",
        // params: [
        //   "0x5c0085E600398247a37de389931CCea8EdD3ba67",
        //   "Connecting to the Prnts NFT platform!",
        // ],
      };
      // provider.request(payload).then(async (res) => {
      //   console.log("res: ", res);
      //   const accounts = await web3.eth.getAccounts();
      //   setaccount(accounts[0]);
      // });
      const res = await provider.send(payload, (err) => {
        if (err) console.log("err on switch to polygon: ", err);
      });

      console.log("res", res);
    }
    const accounts = await web3.eth.getAccounts();
    setaccount(accounts[0]);

    // setweb(web3);

    // console.log("provider: ", provider);

    // const res = await provider.send({
    //   method: "wallet_switchEthereumChain",
    //   params: {
    //     chainId: "0x89",
    //   },
    // });

    // console.log("res", res);

    // web3.setProvider(provider);
    // console.log("accounts[0]", accounts[0]);
    // console.log("after setProvider", web3);
    // console.log("cached provider on connect: ", web3Modal.cachedProvider)
    // console.log("web3 on mount", web3);
    // console.log("provider",web3.currentProvider);
    // window.location.reload();
  };

  const onDisconnect = async (e) => {
    e.preventDefault();
    // let provider = web3.currentProvider;
    // if(typeof window !== 'undefined' && typeof window.web3 !== 'undefined') {
    //   if(!(account === "" || typeof account === "undefined")) {
    //     // setaccount("");
    //     const permissions = await window.ethereum.request({
    //       method: "wallet_requestPermissions",
    //       params: [
    //         {
    //           eth_accounts: {}
    //         }
    //       ]
    //     });
    //     console.log("wallet_requestPermissions", permissions)
    //   }
    // }

    console.log(
      "cached provider before provider.close(): ",
      web3Modal.cachedProvider
    );
    console.log("Killing the session", web3.currentProvider);
    console.log("web3.givenProvider", web3.givenProvider);

    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }

    console.log(
      "cached provider after provider.close(): ",
      web3Modal.cachedProvider
    );
    web3Modal.clearCachedProvider();
    console.log("cached provider after clear: ", web3Modal.cachedProvider);
    provider = null;
    // setaccount("");
    window.location.reload();
  };

  const [isApproved, setIsApproved] = useState(false);

  const getIsApproved = async () => {
    const url = `https://prnts-nfts.herokuapp.com/api/approvalRequests/${account}/isApproved`;
    try {
      const res = await axios.get(url);
      setIsApproved(res.data);
      // console.log(res.data);
    } catch (err) {
      if (err) console.log(err);
    }
  };

  useEffect(() => {
    getIsApproved();
  });

  const fetchChainId = async () => {
    if (account) {
      const id = await web3.eth.getChainId();
      setChainId(id);
      console.log("chain id: ", id);
      if (id !== 137) {
        console.log("if not 137 , provider: ", provider);
        const res = await provider.send(
          {
            method: "wallet_switchEthereumChain",
            params: {
              chainId: "0x89",
            },
          },
          (err) => {
            if (err) console.log("err on switch to polygon: ", err);
          }
        );

        console.log("res", res);
      }
    }
  };

  useEffect(() => {
    fetchChainId();
  }, []);

  const networkChanged = (chainId) => {
    console.log({ chainId });
    setChainId(chainId);
  };

  useEffect(() => {
    try {
      window.ethereum.on("chainChanged", networkChanged);
      provider.on("chainChanged", networkChanged);
    } catch (err) {
      if (err) console.log(err);
    }
    return () => {
      window.ethereum.removeListener("chainChanged", networkChanged);
    };
  }, []);

  return (
    <BrowserRouter history={createBrowserHistory}>
      <Container>
        <div
          style={{
            backgroundColor: "#e9eff0",
            boxShadow: "3px 1.5px 12px #e0e5e6, -5px -5px 12px #f2f9fa",
            borderBottomLeftRadius: "40px",
            borderBottomRightRadius: "40px",
            // borderRadius: "50px",
            position: "sticky",
            top: "0",
            zIndex: "2",
            // overflow: 'hidden',
            // marginBottom: '10px'
          }}
        >
          {/* <div>chainChanged: {chainIdConnected}</div> */}
          {/* {account && chainIdConnected !== 137 ? (
            <AlertMsg>
              <span>Wrong network :( </span>
              <br />
              <span>Please switch to Polygon mainnet & reload!</span>
              <br />
              <br />
              <span>To add Polygon to your metamask, please visit </span>
              <br />
              <a href="https://chainlist.org" target="_blank">
                https://chainlist.org
              </a>
              <span> and search for Polygon Mainnet.</span>
            </AlertMsg>
          ) : null} */}
          {/* {chainIdConnected === 137 ? <AlertMsg>Connected</AlertMsg> : null} */}

          <Header account={account} isMobile={isMobile} />
          <div
            style={{
              // marginLeft: "0px",
              // right: "15px",
              // top: "15px",
              position: "absolute",
              zIndex: "1",
              padding: "15px 15px",
              // marginLeft: "0px"
              right: "2vw",
              top: "1.45vh",
              // left: "100px"
            }}
          >
            {account === "" || typeof account === "undefined" ? (
              isMobile ? (
                <>
                  <div>
                    <a
                      className="btn"
                      href="https://www.moonpay.com/buy/matic"
                      target="_blank"
                      style={{
                        // maxWidth: "100px",
                        // width: "100px",
                        display: "flex",
                        justifyContent: "center",
                        borderRadius: "20px",
                        textAlign: "center",
                        position: "absolute",
                        zIndex: "1",
                        // right: "8vw",
                        // top: "1.45vh",
                        top: "1vh",
                        // left: "18vw",
                        left: "2vw",
                        position: "fixed",
                        fontWeight: "bold",
                        fontSize: "13px",
                        zoom: "90%",
                      }}
                    >
                      {/* <img
                        style={{ width: "20px", height: "20px" }}
                        src={MaticToken}
                      /> */}
                      Buy Matic
                    </a>
                  </div>
                  <div
                    className="btn"
                    style={{
                      top: "1vh",
                      right: "2vw",
                      position: "fixed",
                      // blockSize: 'smaller'
                      zoom: "90%",
                    }}
                  >
                    <FaWallet onClick={() => onConnectWallet()} />
                  </div>
                </>
              ) : (
                <div style={{ display: "grid", gap: "10px" }}>
                  <a
                    className="btn"
                    href="https://www.moonpay.com/buy/matic"
                    target="_blank"
                    style={{
                      maxWidth: "150px",
                      display: "flex",
                      width: "115px",
                      justifyContent: "center",
                      textAlign: "center",
                      position: "absolute",
                      zIndex: "1",
                      right: "8vw",
                      top: "1.45vh",
                      fontWeight: "bold",
                    }}
                  >
                    Buy Matic
                  </a>
                  <button
                    className="btn"
                    style={{
                      // marginLeft: "0px",
                      // right: "15px",
                      // top: "15px",
                      position: "absolute",
                      zIndex: "1",
                      // padding: '15px 15px',
                      // marginLeft: "0px"
                      right: "2vw",
                      top: "1.45vh",
                      // left: "100px"
                    }}
                    onClick={() => onConnectWallet()}
                  >
                    <h4>
                      <span>Wallet</span>
                    </h4>
                  </button>
                </div>
              )
            ) : (
              <>
                <h4
                  style={{
                    top: "1vh",
                    // left: `${isMobile ? "4vw" : "2vw"}`,
                    left: `${isMobile ? "40px" : "40px"}`,
                    position: "fixed",
                    margin: "5px 0px",
                    zoom: `${isMobile ? "85%" : "100%"}`,
                  }}
                  className="btn"
                  onClick={onDisconnect}
                >
                  <FaSignOutAlt size={13} />
                </h4>
                <div>
                  <a
                    className="btn"
                    href="https://www.moonpay.com/buy/matic"
                    target="_blank"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      zIndex: "1",
                      top: "1vh",
                      left: `${isMobile ? "null" : "120px"}`,
                      right: `${isMobile ? "40px" : "null"}`,
                      position: "fixed",
                      margin: "5px 0px",
                      zoom: `${isMobile ? "85%" : "100%"}`,
                      fontWeight: "bold",
                    }}
                  >
                    {/* <img
                      style={{ width: "20px", height: "20px" }}
                      src={MaticToken}
                    /> */}
                    Buy Matic
                  </a>
                </div>
              </>
            )}
          </div>
          {/* <div
            style={{
              margin: '80px 10px',
            }}
          /> */}
        </div>

        <br />
        {/* <button className="btn" onClick={() => console.log(account)}>Account</button> */}
        <Switch>
          <Route path="/home" exact component={() => <Home />} />
          <Route path="/" exact component={() => <Artworks />} />
          <Route path="/community" exact component={() => <Artists />} />
          <Route
            path="/music/:id/:tokenId"
            exact
            component={() => <Art account={account} isMobile={isMobile} />}
          />
          <Route
            path="/profile/:id"
            exact
            component={() => (
              <ProfilePage account={account} isMobile={isMobile} />
            )}
          />
          <ProtectedRoute
            path="/create"
            exact
            isAuth={isApproved}
            component={() => <Create account={account} isMobile={isMobile} />}
            extraComponent={() => <NotApproved account={account} />}
            account={account}
          />
          <Route
            path="/profile/:id/edit-profile"
            exact
            // isAuth={true}
            component={() => <EditProfile account={account} />}
            // extraComponent={() => null}
            account={account}
          />
          {/* <ProtectedRoute
            path="/profile/:id/edit-profile"
            exact
            isAuth={true}
            component={() => <EditProfile account={account} />}
            extraComponent={() => null}
            account={account}
          /> */}
          <ProtectedRoute
            path="/profile/:id/request-for-approval"
            exact
            isAuth={isApproved}
            component={(props) => (
              <Redirect
                to={{
                  pathname: "/create",
                  state: { from: props.location },
                }}
              />
            )}
            extraComponent={() => <RequestForApproval account={account} />}
            account={account}
          />
        </Switch>
        <Footer />
      </Container>
    </BrowserRouter>
  );
};

export default App;
