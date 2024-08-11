import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/address.jpg";
import { useWeb3 } from "../../Web3Provider";
import { ethers } from "ethers";

const Connectwallet = () => {
  const {
    connected,
    account,
    connectWallet,
    disconnectWallet,
    shortenAddress,
  } = useWeb3();

  return (
    <>
      {connected ? (
        <ul className="d-flex align-items-center">
          <li className="nav-item">
            <Link className="nav-link nav-icon" to="/settings">
              Host
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link nav-icon" to="/settings">
              <i className="bi bi-gear"></i>
            </Link>
          </li>
          <li className="nav-item pe-3">
            <Link
              className="nav-link nav-profile d-flex align-items-center pe-0"
              to="/settings"
              data-bs-toggle="dropdown"
            >
              <img src={logo} alt="Profile" className="rounded-circle" />
              <span className="d-none d-md-block ps-2">
                {shortenAddress(account)}
              </span>
            </Link>
          </li>
          <li className="nav-item pe-3">
            <button
              onClick={disconnectWallet}
              type="button"
              className="btn btn-danger"
            >
              Disconnect
            </button>
          </li>
        </ul>
      ) : (
        <ul className="d-flex align-items-center">
          <li className="nav-item pe-3">
            <button
              onClick={connectWallet}
              type="button"
              className="btn btn-primary"
            >
              Connect Wallet
            </button>
          </li>
        </ul>
      )}
    </>
  );
};

export default Connectwallet;
