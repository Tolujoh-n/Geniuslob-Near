import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeb3 } from "../../Web3Provider";
import { ABI, CONTRACT_ADDRESS } from "../Constants";
import { ethers } from "ethers";
import "../../assets/css/quiz.css";
import AWS from "aws-sdk";

// Configure AWS SDK using environment variables
AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION,
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();
const bucketName = process.env.REACT_APP_AWS_BUCKET_NAME;

const QuizForm = ({ generateIncorrectOptions }) => {
  const [quizInfo, setQuizInfo] = useState({
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
    visibility: "Public",
    quiz: [], // Array to hold quiz questions
  });

  const { connected, connectWallet, signer } = useWeb3();
  const navigate = useNavigate();

  const uploadToS3 = async (file) => {
    const params = {
      Bucket: bucketName,
      Key: `${Date.now()}_${file.name}`,
      Body: file,
      ContentType: file.type,
    };
    try {
      const data = await s3.upload(params).promise();
      return data.Location; // Return the URL of the uploaded file
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      return null;
    }
  };

  const handleAddQuiz = () => {
    setQuizInfo((prevQuizInfo) => ({
      ...prevQuizInfo,
      quiz: [
        ...prevQuizInfo.quiz,
        {
          question: "",
          questionimg: "",
          options: Array(4).fill(""),
          correctOption: null,
        },
      ],
    }));
  };

  const handleQuestChange = (index, field, value) => {
    setQuizInfo((prevQuizInfo) => ({
      ...prevQuizInfo,
      quiz: prevQuizInfo.quiz.map((quest, i) =>
        i === index ? { ...quest, [field]: value } : quest
      ),
    }));
  };

  const handleOptionChange = (index, optionIndex, value) => {
    setQuizInfo((prevQuizInfo) => ({
      ...prevQuizInfo,
      quiz: prevQuizInfo.quiz.map((quest, i) =>
        i === index
          ? {
              ...quest,
              options: quest.options.map((opt, idx) =>
                idx === optionIndex ? value : opt
              ),
            }
          : quest
      ),
    }));
  };

  const handleCheckboxChange = (index, optionIndex) => {
    setQuizInfo((prevQuizInfo) => ({
      ...prevQuizInfo,
      quiz: prevQuizInfo.quiz.map((quest, i) =>
        i === index
          ? {
              ...quest,
              correctOption: optionIndex,
            }
          : quest
      ),
    }));
  };

  const handleGenerateAIWrongOptions = async (index) => {
    const { question } = quizInfo.quiz[index];
    const incorrectOptions = await generateIncorrectOptions(question);
    setQuizInfo((prevQuizInfo) => ({
      ...prevQuizInfo,
      quiz: prevQuizInfo.quiz.map((quest, i) =>
        i === index
          ? {
              ...quest,
              options: quest.options.map((opt, idx) =>
                idx !== quest.correctOption && incorrectOptions.length > 0
                  ? incorrectOptions.shift()
                  : opt
              ),
            }
          : quest
      ),
    }));
  };

  const handleQuizDescriptionChange = (e) => {
    setQuizInfo({ ...quizInfo, quizDescription: e.target.value });
  };

  const handleQuizTitleChange = (e) => {
    setQuizInfo({ ...quizInfo, quizName: e.target.value });
  };

  const handleRewardChange = (index, value) => {
    const newRewards = [...quizInfo.rewards];
    newRewards[index].value = parseInt(value);
    setQuizInfo({
      ...quizInfo,
      rewards: newRewards,
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await uploadToS3(file);
      setQuizInfo({ ...quizInfo, quizImage: imageUrl });
    }
  };

  const handleQuestionImageChange = async (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = await uploadToS3(file); // Upload the file to S3
      handleQuestChange(index, "questionimg", imageUrl); // Update quizInfo state with the S3 URL
    }
  };
  const handleVisibilityChange = (e) => {
    setQuizInfo({ ...quizInfo, visibility: e.target.value });
  };

  const handleSubmit = async () => {
    if (!connected) {
      await connectWallet();
      return;
    }

    if (!signer) {
      console.error("Ethers signer is not initialized.");
      return;
    }

    try {
      const quizData = {
        quizTitle: quizInfo.quizName,
        quizDescription: quizInfo.quizDescription,
        quizImage: quizInfo.quizImage,
        pricepool: quizInfo.pricepool,
        entranceFee: quizInfo.entranceFee,
        timer: quizInfo.timer,
        quiz: quizInfo.quiz.map((q) => ({
          questionText: q.question,
          questionImg: q.questionimg,
          options: q.options,
          correctOption: q.correctOption,
        })),
        rewards: quizInfo.rewards.map((reward) => ({
          label: reward.label,
          value: reward.value,
        })),
        visibility: quizInfo.visibility,
      };

      // Log quiz data for debugging
      console.log("Quiz Data to be Submitted:", quizData);

      // Check if quiz array is empty
      if (quizData.quiz.length === 0) {
        console.error(
          "Quiz array is empty. Ensure quizInfo.quiz is populated correctly."
        );
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const transaction = await contract.createQuiz(
        quizData.quizTitle,
        quizData.quizDescription,
        quizData.quizImage,
        ethers.utils.parseUnits(quizData.entranceFee.toString(), 18),
        ethers.utils.parseUnits(quizData.pricepool.toString(), 18),
        quizData.timer,
        quizData.quiz,
        quizData.rewards,
        quizData.visibility,
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
    <div className="container">
      <h1>Quiz Information</h1>
      <div className="row gy-4">
        <div className="col-md-6">
          <div className="form-group">
            <label className="label">Quiz Title:</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Quiz Title"
              value={quizInfo.quizName}
              onChange={handleQuizTitleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Price Pool:</label>
            <input
              type="number"
              className="form-control"
              placeholder="Price Pool (TFUEL)"
              value={quizInfo.pricepool}
              onChange={(e) =>
                setQuizInfo({
                  ...quizInfo,
                  pricepool: parseInt(e.target.value),
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="visibility">
              Quiz Visibility
            </label>
            <select
              id="visibility"
              className="form-select"
              value={quizInfo.visibility}
              onChange={handleVisibilityChange}
              required
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label className="label">Quiz Image:</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Entrance Fee:</label>
            <input
              type="number"
              className="form-control"
              placeholder="Entrance Fee (TFUEL)"
              value={quizInfo.entranceFee}
              onChange={(e) =>
                setQuizInfo({
                  ...quizInfo,
                  entranceFee: parseInt(e.target.value),
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="label">Timer:</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter Time (seconds)"
              value={quizInfo.timer}
              onChange={(e) =>
                setQuizInfo({
                  ...quizInfo,
                  timer: parseInt(e.target.value),
                })
              }
              required
            />
          </div>
        </div>
        <div className="col-md-12">
          <div className="form-group">
            <label className="label">Quiz Description:</label>
            <textarea
              className="form-control textarea"
              placeholder="Quiz Description"
              value={quizInfo.quizDescription}
              onChange={handleQuizDescriptionChange}
              required
            />
          </div>
        </div>
        <div className="col-md-12">
          <div className="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center">
            {quizInfo.rewards.map((reward, index) => (
              <div key={index} className="form-group">
                <label className="label">{reward.label}</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder={`Reward for ${reward.label}`}
                  value={reward.value}
                  onChange={(e) => handleRewardChange(index, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-12">
          {quizInfo.quiz.map((q, i) => (
            <div
              key={i}
              className="questContainer"
              style={{
                border: "1px solid gray",
                borderRadius: "5px",
                padding: "10px",
              }}
            >
              <label className="label">Question {i + 1}:</label>
              <div className="form-group">
                <textarea
                  type="text"
                  style={{
                    width: "100%",
                    marginBottom: "10px",
                    padding: "8px",
                  }}
                  className="form-control"
                  placeholder="Enter Question"
                  value={q.question}
                  onChange={(e) =>
                    handleQuestChange(i, "question", e.target.value)
                  }
                  required
                />
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => handleQuestionImageChange(i, e)}
                  accept="image/*"
                />
              </div>

              <div className="row">
                {q.options.map((opt, idx) => (
                  <div key={idx} className="col-12 col-md-6">
                    <div className="form-group d-flex align-items-center">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={q.correctOption === idx}
                          onChange={() => handleCheckboxChange(i, idx)}
                          required
                        />
                      </label>
                      <input
                        type="text"
                        className="form-control ml-2"
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChange={(e) =>
                          handleOptionChange(i, idx, e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <button
                  type="button"
                  id="followbtn"
                  onClick={() => handleGenerateAIWrongOptions(i)}
                >
                  AI Wrong Options
                </button>
              </div>
            </div>
          ))}
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <button onClick={handleAddQuiz} id="followbtn">
                Add Question
              </button>
            </div>
            <div>
              <button onClick={handleSubmit} id="followbtn">
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
