import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ABI, CONTRACT_ADDRESS } from "./Constants"; // Make sure to replace with your actual ABI and Contract Address
import { BigNumber } from "ethers";

const Participants = ({ quizId, onRemainingPoolChange }) => {
  const [participants, setParticipants] = useState([]);
  const [remainingPool, setRemainingPool] = useState(0);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        // Fetch total participants
        const totalParticipants = await contract.getQuizParticipantsCount(
          quizId
        );
        console.log("Total participants:", totalParticipants.toNumber());

        // Fetch rewards and prize pool
        const quizDetails = await contract.getQuiz(quizId);
        const rewards = quizDetails[8].map((reward) => ({
          label: reward.label,
          value: BigNumber.from(reward.value),
        }));
        const pricePool = BigNumber.from(quizDetails[4]);
        console.log("Price pool:", ethers.utils.formatEther(pricePool));
        console.log("Rewards:", rewards);

        const participantsList = await Promise.all(
          Array.from(
            { length: totalParticipants.toNumber() },
            async (_, index) => {
              const participantAddress = await contract.getQuizParticipant(
                quizId,
                index
              );
              const participantDetails = await contract.getParticipantDetails(
                quizId,
                participantAddress
              );
              return {
                address: participantAddress,
                passed: participantDetails[0].toString(),
                failed: participantDetails[1].toString(),
                points: participantDetails[2].toString(),
                grade: participantDetails[3].toString(),
              };
            }
          )
        );

        console.log("Participants List:", participantsList);

        // Calculate remaining prize pool
        let remainingPool = ethers.utils.formatEther(pricePool);
        let winnersList = [];

        participantsList.forEach((participant) => {
          let rewardValue = BigNumber.from(0);

          if (
            BigNumber.from(participant.grade).gte(60) &&
            BigNumber.from(participant.grade).lt(70)
          ) {
            rewardValue = BigNumber.from(rewards[0].value);
          } else if (
            BigNumber.from(participant.grade).gte(70) &&
            BigNumber.from(participant.grade).lt(80)
          ) {
            rewardValue = BigNumber.from(rewards[1].value);
          } else if (BigNumber.from(participant.grade).gte(80)) {
            rewardValue = BigNumber.from(rewards[2].value);
          }

          if (rewardValue.gt(BigNumber.from(0))) {
            remainingPool = remainingPool.sub(
              ethers.utils.formatEther(rewardValue)
            );
            winnersList.push({ address: participant.address, rewardValue });
          }
        });

        console.log("Winners List:", winnersList);
        console.log("Remaining Pool:", remainingPool);

        setParticipants(participantsList);
        setRemainingPool(parseFloat(remainingPool));
        onRemainingPoolChange(parseFloat(remainingPool));

        // Save winners list to local storage
        localStorage.setItem("winnersList", JSON.stringify(winnersList));

        // Trigger distributeRewards if conditions met
        if (
          parseFloat(remainingPool) <=
          ethers.utils.formatEther(rewards[2].value)
        ) {
          await contract.distributeRewards(
            quizId,
            winnersList.map((winner) => winner.address),
            winnersList.map((winner) => winner.rewardValue)
          );
        }
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    fetchParticipants();
  }, [quizId, onRemainingPoolChange]);

  const shortenAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;
  };

  return (
    <div className="col-lg-12">
      <h1 className="card-title">PARTICIPANTS</h1>
      <div style={{ overflowX: "auto" }} className="col-12">
        <table className="responsive-table">
          <thead>
            <tr className="table-header">
              <th className="col col-1">Serial</th>
              <th className="col col-2 text-center">Name</th>
              <th className="col col-3 text-center">Passed</th>
              <th className="col col-3">Failed</th>
              <th className="col col-5">Points</th>
              <th className="col col-6">Grade</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant, index) => (
              <tr key={index} className="table-row">
                <td className="col col-1" data-label="Serial">
                  <div className="text-center">
                    <h5>{index + 1}</h5>
                  </div>
                </td>
                <td className="col col-2" data-label="Name">
                  <div className="text-center">
                    <h5>{shortenAddress(participant.address)}</h5>
                  </div>
                </td>
                <td className="col col-3 text-center" data-label="Passed">
                  <h5>{participant.passed}</h5>
                </td>
                <td className="col col-3" data-label="Failed">
                  <h5>{participant.failed}</h5>
                </td>
                <td className="col col-5" data-label="Points">
                  <h5>{participant.points}</h5>
                </td>
                <td className="col col-6" data-label="Grade">
                  <h5>{participant.grade}</h5>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Participants;
