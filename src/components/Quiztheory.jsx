import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS } from "./Constants";

const Quiztheory = () => {
  const { quizId } = useParams();
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchQuizDescription = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        const quizData = await contract.getQuiz(quizId);

        if (quizData) {
          setDescription(quizData[1] || "No description available");
        }
      } catch (error) {
        console.error("Error fetching quiz description:", error);
      }
    };

    fetchQuizDescription();
  }, [quizId]);

  return (
    <div className="col-lg-12">
      <div className="row">
        <div className="col-lg-12">
          <h1 className="card-title">ABOUT THE CHALLENGE</h1>
          <p style={{ color: "#b1bad3" }}>{description}</p>
          <iframe
            src="https://www.youtube.com/watch?v=bg7wQMkj1Zg"
            style={{ width: "100%", height: "400px", border: "none" }}
            title="Embedded Content"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Quiztheory;
