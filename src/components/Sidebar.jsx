import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS } from "./Constants";
import theta from "../assets/img/theta.jpg";
import tfuel from "../assets/img/tfuel.jpg";
import useimage from "../assets/address.jpg";
import Modal from "./Modal";

const Ongoinggm = [
  { id: 1, title: "Tolujohn Bob", reward: "30", level: "1" },
  { id: 2, title: "Fabrre don", reward: "15", level: "6" },
  { id: 3, title: "Naccy colen", reward: "10", level: "3" },
  { id: 4, title: "Petter collin", reward: "25", level: "5" },
  { id: 5, title: "Rugberbs", reward: "20", level: "2" },
];

const Sidebar = () => {
  const [isGamemodalOpen, setIsGamemodalOpen] = useState(false);
  const [thetaBalance, setThetaBalance] = useState("0");
  const [tfuelBalance, setTfuelBalance] = useState("0");

  useEffect(() => {
    const fetchBalances = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            const address = accounts[0];

            // Fetch TFUEL balance
            const tfuelBalance = await provider.getBalance(address);
            setTfuelBalance(ethers.utils.formatEther(tfuelBalance));

            // Fetch THETA balance using contract
            const thetaContract = new ethers.Contract(
              CONTRACT_ADDRESS,
              ABI,
              provider
            );
            const thetaBalance = await thetaContract.balanceOf(address);
            setThetaBalance(ethers.utils.formatEther(thetaBalance));
          } else {
            console.error("No accounts found");
          }
        } catch (error) {
          console.error("Failed to get accounts:", error);
        }
      }
    };

    fetchBalances();
  }, []);

  const handleGamemodalClick = () => {
    setIsGamemodalOpen(true);
  };

  const handleCloseGamemodal = () => {
    setIsGamemodalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // claim
    handleCloseGamemodal();
  };

  return (
    <>
      <div className="col-lg-4">
        {/* Recent Activity */}
        <div className="card info-card revenue-card">
          <div className="card-body">
            <h5 className="card-title">Balance:</h5>
            <div className="d-flex align-items-center">
              <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                <img id="balance" src={theta} alt="Theta Logo" />
              </div>
              <div className="ps-3">
                <h6>{parseFloat(thetaBalance).toFixed(2)} THETA</h6>
              </div>
            </div>
            <hr />
            <div className="d-flex align-items-center">
              <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                <img id="balance" src={tfuel} alt="TFUEL Logo" />
              </div>
              <div className="ps-3">
                <h6> {parseFloat(tfuelBalance).toFixed(2)} TFUEL</h6>
              </div>
            </div>
          </div>
        </div>
        {/* End Recent Activity */}

        {/* News & Updates Traffic */}
        <div className="card">
          <div className="card-body pb-0">
            <h5 className="card-title">Top Genius</h5>
            <div className="news">
              {Ongoinggm.map((card) => (
                <div
                  key={card.id}
                  className="post-item clearfix"
                  style={{
                    background: "#213743",
                    borderRadius: "5px",
                    marginBottom: "10px",
                    padding: "10px",
                  }}
                >
                  <img src={useimage} alt="User" />
                  <h4>
                    <a href="#">{card.title}</a>
                  </h4>
                  <p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span style={{ color: "#b1bad3" }}>
                          Quiz Won: {card.level}
                        </span>
                      </div>
                      <div>
                        <button onClick={handleGamemodalClick} id="followbtn">
                          Follow
                        </button>
                      </div>
                    </div>
                  </p>
                </div>
              ))}
            </div>
            {/* End sidebar recent posts */}
          </div>
        </div>
        {/* End News & Updates */}
      </div>
      <>
        {/* Render the Gamemodal if isGamemodalOpen is true */}
        {isGamemodalOpen && (
          <Modal onClose={handleCloseGamemodal} onSubmit={handleSubmit} />
        )}
      </>
    </>
  );
};

export default Sidebar;
