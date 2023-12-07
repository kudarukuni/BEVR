import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";
import {useRef} from 'react';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  
  const [allWaves, setAllWaves] = useState([]);
  
  const contractAddress = "0x976C4139dbe2113bE823573bd430BCF60788e3D3";
  const ref = useRef(null);
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        getAllWaves();
        console.log("We have the ethereum object", ethereum);
      }
      
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        
        const waveTxn = await wavePortalContract.wave(ref.current.value);
        ref.current.value = '';
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total Vote count...", count.toNumber());
        
        getAllWaves();
        
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    const { ethereum } = window;

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();
      
        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        setAllWaves(wavesCleaned);
      } else {
          console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
          console.log(error);
    }
  };
  
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("New Vote", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          <h2><p align="centre"><font face="Georgia"><b>
            👨🏽‍⚖️<font color = "#006400">2023</font>
            <font color = "#ffcc00"> BLOCKCHAIN</font>
            <font color ="#d40000"> ELECTION </font>
            <font color = "black">2023</font>👨🏽‍⚖️
          </b></font></p></h2>
        </div>

        <div className="bio">
          <img src="./logo.jpg" alt="Avatar" width="150" height="150"/>
        <font color = "black"><br></br>
          <b><h2><font color = "#140504" face="Abril Fatface">Hi there! I am Kuda and I have worked on a number of projects for some of the top IoT companies in Africa, pretty cool right? Please connect your Ethereum wallet and Vote Kuda for Head Huncho!
          </font></h2></b></font></div>
        <br></br>
        <textarea className="input" ref={ref} id="message" name="message" rows="5" cols="10">Write Note!</textarea>
        <button className="waveButton" onClick={wave}>
          <b><h3>Vote For Me !!</h3></b>
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            <b><h3>Connect Wallet !!</h3></b>
          </button>
        )}

        <div className="totalWaves">
          <div className="generalWaves">
            Total Votes: {allWaves.length.toString()}
          </div>
        </div>

        {[...allWaves].reverse().map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px", borderRadius: "10px"}}>
              <table cellspacing = "5" cellpadding="5">
                <tr>
                  <th>Address</th>
                  <th>Time</th>
                  <th>Note</th>
                </tr>
                <tr>
                  <td>{wave.address}</td>
                  <td>{wave.timestamp.toString()}</td>
                  <td>{wave.message}</td>
                </tr>
              </table>
            </div>)
        })}
        
      </div>
    </div>
  );
}

export default App
