import React, { useState, useEffect } from "react";
import AIquiz from "./AIquiz";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../../Web3Provider";
import { ABI, CONTRACT_ADDRESS } from "../Constants";
import { ethers } from "ethers";

const styles = {
  container: {
    color: "white",
    backgroundColor: "transparent",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  formContainer: {
    marginTop: "20px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    borderRadius: "20px",
  },
  textarea: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
  },
  button: {
    padding: "10px",
    backgroundColor: "orange",
    color: "white",
    cursor: "pointer",
    border: "none",
    borderRadius: "5px",
    marginRight: "10px",
  },
  table: {
    width: "100%",
    marginBottom: "10px",
  },
  tableRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
};

const AddQuizForm = () => {
  const [gameInfo, setGameInfo] = useState({
    quizImage: "",
    quizName: "",
    quizDescription: "",
    pricepool: 0,
    entranceFee: 0,
    timer: 0,
    rewards: [
      { label: "60% - 69%", value: 0 },
      { label: "70% - 79%", value: 0 },
      { label: "80% - 100%", value: 0 },
    ],
    quiz: [], // Initialize quiz as an empty array
  });

  const { connected, connectWallet, account, provider, signer } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("gameInfo", JSON.stringify(gameInfo));
  }, [gameInfo]);

  useEffect(() => {
    const storedGameInfo = localStorage.getItem("gameInfo");
    if (storedGameInfo) {
      setGameInfo(JSON.parse(storedGameInfo));
    }
  }, []);

  const handleQuizDescriptionChange = (e) => {
    setGameInfo({ ...gameInfo, quizDescription: e.target.value });
  };

  const handleQuizTitleChange = (e) => {
    setGameInfo({ ...gameInfo, quizName: e.target.value });
  };

  const handleRewardChange = (index, value) => {
    setGameInfo((prevState) => {
      const rewards = [...prevState.rewards];
      rewards[index].value = value;
      return { ...prevState, rewards };
    });
  };

  const handleSubmit = async (quizData) => {
    if (!connected) {
      await connectWallet();
      return;
    }

    if (!provider || !signer) {
      console.error("Ethers provider or signer is not initialized.");
      return;
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    try {
      // Prepare quiz data
      // const quizData = {
      //   quizTitle: gameInfo.quizName,
      //   quizDescription: gameInfo.quizDescription,
      //   pricepool: gameInfo.pricepool,
      //   entranceFee: gameInfo.entranceFee,
      //   timer: gameInfo.timer,
      //   quiz: gameInfo.quiz.map((q) => ({
      //     questionText: q.question,
      //     questionImg: q.questionimg,
      //     options: q.options,
      //     correctOption: q.correctOption,
      //   })),
      //   rewards: gameInfo.rewards.map((reward) => ({
      //     label: reward.label,
      //     value: ethers.utils.parseUnits(reward.value.toString(), 18),
      //   })),
      // };
      // Log quiz data
      console.log("Quiz Data to be Submitted:", quizData);

      // Example usage of the first question's image URL
      const transaction = await contract.createQuiz(
        quizData.quizTitle,
        quizData.quizDescription,
        quizData.quiz.length > 0 ? quizData.quiz[0].questionImg : "", // Ensure to handle case with empty quiz array
        ethers.utils.parseUnits(quizData.entranceFee.toString(), 18),
        ethers.utils.parseUnits(quizData.pricepool.toString(), 18),
        quizData.timer,
        quizData.quiz.map((q) => ({
          questionText: q.question,
          questionImg: q.questionimg,
          options: q.options,
          correctOption: q.correctOption,
        })),
        quizData.rewards,
        {
          value: ethers.utils.parseUnits(quizData.pricepool.toString(), 18),
        }
      );

      console.log("Transaction successful:", transaction);
      navigate("/");
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Quiz Information</h1>
      <div className="row gy-4">
        <div className="col-md-6">
          <div className="form-group">
            <label style={styles.label}>Quiz Title:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Quiz Title"
              value={gameInfo.quizName}
              onChange={handleQuizTitleChange}
              style={styles.input}
              required
            />
          </div>
          <div className="form-group">
            <label style={styles.label}>Price Pool:</label>
            <input
              type="number"
              className="form-control"
              placeholder="Price Pool (TFUEL)"
              value={gameInfo.pricepool}
              onChange={(e) =>
                setGameInfo({
                  ...gameInfo,
                  pricepool: parseInt(e.target.value),
                })
              }
              style={styles.input}
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontWeight: "bold" }} htmlFor="find">
              Quiz Visibility
            </label>
            <select id="find" className="form-select mx-2" required>
              <option selected>Public</option>
              <option>Private</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label style={styles.label}>Quiz Image:</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) =>
                setGameInfo({ ...gameInfo, quizImage: e.target.value })
              }
              style={styles.input}
              required
            />
          </div>
          <div className="form-group">
            <label style={styles.label}>Entrance Fee:</label>
            <input
              type="number"
              className="form-control"
              placeholder="Entrance Fee (TFUEL)"
              value={gameInfo.entranceFee}
              onChange={(e) =>
                setGameInfo({
                  ...gameInfo,
                  entranceFee: parseInt(e.target.value),
                })
              }
              style={styles.input}
              required
            />
          </div>
          <div className="form-group">
            <label style={styles.label}>Timer:</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter Time (seconds)"
              value={gameInfo.timer}
              onChange={(e) =>
                setGameInfo({
                  ...gameInfo,
                  timer: parseInt(e.target.value),
                })
              }
              style={styles.input}
              required
            />
          </div>
        </div>
      </div>
      <div style={styles.formContainer}>
        <div className="container">
          <div className="row justify-content-md-center">
            <div className="col-md-12">
              <label style={styles.label}>Quiz Description:</label>
              <textarea
                className="form-control"
                placeholder="Enter Description"
                value={gameInfo.quizDescription}
                onChange={handleQuizDescriptionChange}
                rows="3"
                style={styles.textarea}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-12">
        <div className="form-group">
          <label htmlFor="rewards">Winners Rewards</label>
          <table style={styles.table}>
            <tbody>
              {gameInfo.rewards.map((reward, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td>{reward.label}</td>
                  <td>
                    <input
                      type="number"
                      value={reward.value}
                      onChange={(e) =>
                        handleRewardChange(index, parseInt(e.target.value))
                      }
                      style={styles.input}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {gameInfo.pricepool > 0 && (
        <>
          <AIquiz
            pricepool={gameInfo.pricepool}
            entranceFee={gameInfo.entranceFee}
            timer={gameInfo.timer}
            onSubmit={handleSubmit}
            quizTitle={gameInfo.quizName}
            quizDescription={gameInfo.quizDescription}
            rewards={gameInfo.rewards}
          />
        </>
      )}
    </div>
  );
};

export default AddQuizForm;
