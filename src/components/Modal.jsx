import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS } from "./Constants";

const Modal = ({ onClose, quizId }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showMessage, setShowMessage] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [quizImage, setQuizImage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [quizEnded, setQuizEnded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchQuizData() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        try {
          const quizData = await contract.getQuiz(quizId);
          setQuizTitle(quizData[0]);
          setQuizDescription(quizData[1]);
          setQuizImage(quizData[2]);
          setTimeLeft(quizData[5].toNumber());

          const quizQuestions = await contract.getQuizQuestions(quizId);
          const formattedQuestions = quizQuestions.map((q) => ({
            question: q.questionText,
            options: q.options,
            correctAnswer: q.correctOption.toNumber(),
            image: q.questionImg,
          }));

          setShuffledQuestions(
            formattedQuestions.sort(() => Math.random() - 0.5)
          );
          setIsLoaded(true);
        } catch (error) {
          console.error("Error fetching quiz data:", error);
        }
      } else {
        console.error("Ethereum object not found");
      }
    }

    fetchQuizData();
  }, [quizId]);

  const calculateResults = useCallback(() => {
    let numQuestionsPassed = 0;
    let numQuestionsFailed = 0;

    shuffledQuestions.forEach((question, index) => {
      const correctAnswerIndex = question.correctAnswer;
      const selectedAnswer = answers[index];

      if (selectedAnswer === question.options[correctAnswerIndex]) {
        numQuestionsPassed++;
      } else {
        numQuestionsFailed++;
      }
    });

    const points = numQuestionsPassed * 10;
    const grade = (numQuestionsPassed / shuffledQuestions.length) * 100;

    return { numQuestionsPassed, numQuestionsFailed, points, grade };
  }, [shuffledQuestions, answers]);

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);

    const {
      numQuestionsPassed,
      numQuestionsFailed,
      points,
      grade,
    } = calculateResults();
    setShowMessage(true);

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      try {
        const tx = await contract.submitQuizResult(
          quizId,
          grade,
          numQuestionsFailed,
          numQuestionsPassed,
          points
        );
        await tx.wait();
        console.log("Submitted Results:", {
          numQuestionsPassed,
          numQuestionsFailed,
          points,
          grade,
        });
      } catch (error) {
        console.error("Error submitting quiz results:", error);
      }
    }
  }, [submitted, calculateResults, quizId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 0) {
          clearInterval(timer);
          setQuizEnded(true);
          if (!submitted) {
            handleSubmit();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoaded, submitted, handleSubmit]);

  useEffect(() => {
    if (quizEnded && !submitted) {
      handleSubmit();
    }
  }, [quizEnded, submitted, handleSubmit]);

  const handleNext = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleOptionSelect = (selectedOption) => {
    setAnswers({ ...answers, [currentQuestion]: selectedOption });
  };

  const handleRedirect = () => {
    window.location.href = `/quizInfo/${quizId}`;
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="modal" style={modalStyle}>
      <div className="modal-content" style={modalContentStyle}>
        {showMessage ? (
          <>
            <div className="maincard">
              <div
                style={{
                  background: "#213743",
                  border: "5px solid #b1bad3",
                }}
                className="card info-card revenue-card"
              >
                <div className="card-body">
                  <h6 style={{ color: "#d5dceb" }}>
                    Thanks for participating!
                  </h6>
                </div>
              </div>

              <div className="container">
                <div className="row">
                  <div className="col">
                    <div className="d-flex justify-content-between">
                      <div className="flex-fill mr-2">
                        <button
                          onClick={handleRedirect}
                          className="btn btn-primary btn-block"
                          id="optionbut"
                        >
                          See Results
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <br />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span style={{ color: "#b1bad3" }}>
                  Question: {currentQuestion + 1} / {shuffledQuestions.length}
                </span>
              </div>
              <div>
                <span style={{ color: "#b1bad3" }}>
                  {Math.floor(timeLeft / 60)}:
                  {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
                </span>
              </div>
            </div>
            {currentQuestion < shuffledQuestions.length && (
              <div className="maincard">
                <div
                  style={{
                    background: "#213743",
                    border: "5px solid #b1bad3",
                    borderStyle: "dashed",
                  }}
                  className="card info-card revenue-card"
                >
                  <div className="card-body">
                    {shuffledQuestions[currentQuestion].image && (
                      <img
                        src={shuffledQuestions[currentQuestion].image}
                        alt="Question"
                        id="quizimage"
                      />
                    )}
                    <h6 style={{ color: "#d5dceb", marginTop: "10px" }}>
                      {shuffledQuestions[currentQuestion].question}
                    </h6>
                  </div>
                </div>

                <div className="container">
                  {shuffledQuestions[currentQuestion].options.map(
                    (option, index) =>
                      index % 2 === 0 && (
                        <div key={index} className="row mb-2">
                          <div className="col-md-6">
                            <button
                              onClick={() => handleOptionSelect(option)}
                              className={`btn btn-block ${
                                answers[currentQuestion] === option
                                  ? "btn-success"
                                  : "btn-secondary"
                              }`}
                            >
                              {option}
                            </button>
                          </div>
                          <div className="col-md-6">
                            <button
                              onClick={() =>
                                handleOptionSelect(
                                  shuffledQuestions[currentQuestion].options[
                                    index + 1
                                  ]
                                )
                              }
                              className={`btn btn-block ${
                                answers[currentQuestion] ===
                                shuffledQuestions[currentQuestion].options[
                                  index + 1
                                ]
                                  ? "btn-success"
                                  : "btn-secondary"
                              }`}
                            >
                              {
                                shuffledQuestions[currentQuestion].options[
                                  index + 1
                                ]
                              }
                            </button>
                          </div>
                        </div>
                      )
                  )}
                </div>

                <br />
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <button onClick={handlePrevious} id="followbtn">
                      Previous
                    </button>
                    <button onClick={handleNext} id="followbtn">
                      Next
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={handleSubmit}
                      id="followbtn"
                      disabled={submitted}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;

const modalStyle = {
  display: "block",
  position: "fixed",
  zIndex: "9999",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
};

const modalContentStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "#213743",
  color: "#b1bad3",
  border: "5px solid #b1bad3",
  padding: "20px",
  width: "80%",
  maxWidth: "600px",
};
