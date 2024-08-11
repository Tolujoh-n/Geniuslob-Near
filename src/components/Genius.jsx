import React, { useState, useEffect } from "react";
import useimage from "../assets/address.jpg";
import Modal from "./Modal";
import { Link } from "react-router-dom";
import { useWeb3 } from "../Web3Provider";
import { ABI, CONTRACT_ADDRESS } from "./Constants";
import { ethers } from "ethers";
import theta from "../assets/img/tfuel.jpg";

const cardData = [
  { name: "Jane col", reward: "10", level: "1", id: 1 },
  { name: "Tolujohn Bob", reward: "15", level: "2", id: 2 },
  { name: "Fabrre don", reward: "20", level: "3", id: 3 },
  { name: "Rugberbs", reward: "25", level: "4", id: 4 },
  { name: "Naccy colen", reward: "30", level: "5", id: 5 },
  { name: "Petter collins", reward: "40", level: "6", id: 6 },
];

const Genius = () => {
  const { connected, connectWallet, account, provider, signer } = useWeb3();
  const [isGamemodalOpen, setIsGamemodalOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);

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

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!provider) return;

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      try {
        const count = await contract.getQuizzesCount();
        const quizzesArray = [];

        for (let i = 0; i < count; i++) {
          const quiz = await contract.getQuiz(i);
          const participantsCount = await contract.getQuizParticipantsCount(i); // Fetch participants count

          quizzesArray.push({
            id: i,
            title: quiz.title,
            description: quiz.description,
            imageUrl: quiz.imageUrl,
            entranceFee: ethers.utils.formatEther(quiz.entranceFee),
            pricePool: ethers.utils.formatEther(quiz.pricePool),
            timer: quiz.timer.toNumber(),
            isActive: quiz.isActive,
            participants: participantsCount.toNumber(), // Add participants count
          });
        }

        setQuizzes(quizzesArray);
      } catch (error) {
        console.error("Failed to fetch quizzes:", error);
      }
    };

    fetchQuizzes();
  }, [provider]);

  return (
    <>
      <div className="col-lg-12">
        <h5 className="card-title">Top Quiz</h5>

        <div className="row">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="col-lg-12">
              <div
                style={{ background: "#213743" }}
                className="card info-card revenue-card"
              >
                <Link to={`/quizInfo/${quiz.id}`}>
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="">
                        <img
                          src={quiz.imageUrl}
                          style={{
                            height: "10rem",
                            width: "100px",
                            borderRadius: "5px",
                          }}
                          alt=""
                        />
                      </div>
                      <div className="ps-3">
                        <h4>
                          <a href="#">{quiz.title}</a>
                        </h4>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span className="badge bg-success">Live</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-globe"> </i>{" "}
                            <span className="badge me-2">Public</span>
                          </div>
                        </div>
                        <br />

                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span
                              style={{ color: "#b1bad3", marginRight: "2rem" }}
                            >
                              Price Pool:
                              <img
                                src={theta}
                                alt="Theta Logo"
                                style={{
                                  width: "20px",
                                  borderRadius: "50%",
                                  height: "20px",
                                  marginLeft: "4px",
                                }}
                              />{" "}
                              {parseFloat(quiz.pricePool).toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#b1bad3" }}>
                              {quiz.participants} participants
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-lg-12">
        <h5 className="card-title">Top Genius</h5>

        <div className="row">
          {cardData.map((card) => (
            <div key={card.id} className="col-lg-6">
              <div
                className=""
                style={{
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    background: "#213743",
                    paddingTop: "10px",
                    borderRadius: "5px",
                  }}
                  className="card-body pb-0"
                >
                  <div className="news">
                    <div className="post-item clearfix">
                      <img
                        style={{
                          height: "4rem",
                          width: "70px",
                          borderRadius: "5px",
                        }}
                        src={useimage}
                        alt=""
                      />
                      <h4>
                        <a href="#">{card.name}</a>
                      </h4>

                      <p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span style={{ color: "#b1bad3" }}>
                              {" "}
                              Quiz Won: {card.level}
                            </span>
                          </div>
                          <div>
                            <button id="followbtn">Follow</button>
                          </div>
                        </div>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-lg-12">
        <h5 className="card-title">Top Organizers</h5>

        <div className="row">
          {cardData.map((card) => (
            <div key={card.id} className="col-lg-6">
              <div
                className=""
                style={{
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    background: "#213743",
                    paddingTop: "10px",
                    borderRadius: "5px",
                  }}
                  className="card-body pb-0"
                >
                  <div className="news">
                    <div className="post-item clearfix">
                      <img
                        style={{
                          height: "4rem",
                          width: "70px",
                          borderRadius: "5px",
                        }}
                        src={useimage}
                        alt=""
                      />
                      <h4>
                        <a href="#">{card.name}</a>
                      </h4>

                      <p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <span style={{ color: "#b1bad3" }}>
                              {" "}
                              Quiz Hosted: {card.level}
                            </span>
                          </div>
                          <div>
                            <button id="followbtn">Follow</button>
                          </div>
                        </div>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <>
        {isGamemodalOpen && (
          <Modal onClose={handleCloseGamemodal} onSubmit={handleSubmit} />
        )}
      </>
    </>
  );
};

export default Genius;
