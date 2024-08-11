import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { ABI, CONTRACT_ADDRESS } from "./Constants";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { BsCheckCircle } from "react-icons/bs";
import Quiztheory from "./Quiztheory";
import Participants from "./Participants";
import tfuel from "../assets/img/tfuel.jpg";
import useimage from "../assets/address.jpg";

const cardData = [
  {
    badgeColor: "primary",
    badgeText: "Bronze 10 TFUEL",
    range: "60% - 69%",
    items: ["Naccy buu", "sia funky", "Pinat van"],
  },
  {
    badgeColor: "success",
    badgeText: "Silver 20 TFUEL",
    range: "70% - 79%",
    items: ["Natmas", "Tolujohn", "Huun gss"],
  },
  {
    badgeColor: "warning",
    badgeText: "Gold 50 TFUEL",
    range: "80% - 100%",
    items: ["Tolujohn", "Faih jon", "Percy mat"],
  },
];

const QuizInfo = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [buttonText, setButtonText] = useState("Enter Quiz");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remainingPool, setRemainingPool] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        const quizData = await contract.getQuiz(quizId);

        if (quizData) {
          const participantsCount = await contract.getQuizParticipantsCount(
            quizId
          );

          setQuiz({
            id: quizId,
            title: quizData[0] || "",
            pricePool: ethers.utils.formatEther(quizData[4] || "0"),
            participants: participantsCount.toString(),
            entranceFee: ethers.utils.formatEther(quizData[3] || "0"),
            description: quizData[1] || "",
            image: quizData[2] || useimage,
          });
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleEnterQuiz = async () => {
    setLoading(true);
    setButtonText("Get Ready.");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const entranceFee = ethers.utils.parseEther(quiz.entranceFee);

      const tx = await contract.participateInQuiz(quizId, {
        value: entranceFee,
      });

      await tx.wait();
      setIsModalOpen(true);
      setLoading(false);
      setButtonText("Enter Quiz");

      // Fetch updated quiz data after participating
      const updatedQuizData = await contract.getQuiz(quizId);
      const updatedParticipantsCount = await contract.getQuizParticipantsCount(
        quizId
      );

      setQuiz({
        ...quiz,
        pricePool: ethers.utils.formatEther(updatedQuizData[4] || "0"),
        participants: updatedParticipantsCount.toString(),
      });
    } catch (error) {
      console.error("Error participating in quiz:", error);
      setLoading(false);
      setButtonText("Enter Quiz");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleRemainingPoolChange = (newRemainingPool) => {
    setRemainingPool(newRemainingPool);
  };

  if (!quiz) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="col-lg-12">
        <div className="row">
          <div className="col-lg-12">
            <div
              style={{ background: "#213743" }}
              className="card info-card revenue-card d-flex align-items-stretch"
            >
              <div
                style={{ width: "100%" }}
                className="card-body d-flex align-items-center justify-content-between flex-wrap"
              >
                <div style={{ width: "50%" }} className="ps-3 flex-grow-1">
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
                      <span style={{ color: "#b1bad3" }}>30th July 2024</span>
                    </div>
                  </div>
                  <br />
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span style={{ color: "#b1bad3" }}>
                        Fee:{" "}
                        <img
                          src={tfuel}
                          alt="Theta Logo"
                          style={{
                            width: "20px",
                            borderRadius: "50%",
                            height: "20px",
                            marginLeft: "4px",
                          }}
                        />{" "}
                        {quiz.entranceFee}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: "#b1bad3" }}>
                        {quiz.participants} participants
                      </span>
                      <br />
                      <span style={{ color: "#b1bad3" }}>
                        Total Price Pool:{" "}
                        <img
                          src={tfuel}
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
                      <br />
                      <span style={{ color: "#b1bad3" }}>
                        Remaining Pool:{" "}
                        <img
                          src={tfuel}
                          alt="Theta Logo"
                          style={{
                            width: "20px",
                            borderRadius: "50%",
                            height: "20px",
                            marginLeft: "4px",
                          }}
                        />{" "}
                        {/* {remainingPool.toFixed(2)} */}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleEnterQuiz}
                    id="enterquiz"
                    disabled={loading}
                  >
                    {buttonText}
                    {loading && <span className="loading-dots">...</span>}
                  </button>
                </div>
                <div className="ms-auto" style={{ width: "50%" }}>
                  <img
                    src={quiz.image}
                    style={{
                      height: "10rem",
                      width: "100%",
                      borderRadius: "5px",
                      marginLeft: "10px",
                    }}
                    alt="Quiz Image"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-xl-12">
        <h5 className="card-title">Genius</h5>
        <div className="row">
          {cardData.map((card, index) => (
            <div key={index} className="col-lg-4">
              <div className="info-box card" style={{ background: "#213743" }}>
                <span className={`badge bg-${card.badgeColor}`}>
                  {card.badgeText}
                </span>
                <h3 className="text-white text-center">{card.range}</h3>
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {card.items.map((item, i) => (
                    <li
                      key={i}
                      style={{ marginLeft: "20px", color: "#b1bad3" }}
                    >
                      <BsCheckCircle
                        style={{ color: card.badgeColor }}
                        size={16}
                      />{" "}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Quiztheory description={quiz.description} />
      <Participants
        quizId={quizId}
        onRemainingPoolChange={handleRemainingPoolChange}
      />
      {isModalOpen && <Modal onClose={handleCloseModal} quizId={quizId} />}
    </>
  );
};

export default QuizInfo;
