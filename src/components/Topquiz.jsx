import React, { useState } from "react";
import useimage from "../assets/address.jpg";
import Modal from "./Modal";
import { Link } from "react-router-dom";
import tfuel from "../assets/img/tfuel.jpg";

const cardData = [
  {
    name: "Meta Quest Presence Platform quiz 2024",
    reward: "10",
    level: "1",
    id: 1,
    pool: 3000,
    perticipants: 20,
  },
  {
    name: "Meta Quest Presence Platform quiz 2024",
    reward: "15",
    level: "2",
    id: 2,
    pool: 3000,
    perticipants: 20,
  },
  {
    name: "Meta Quest Presence Platform quiz 2024",
    reward: "20",
    level: "3",
    id: 3,
    pool: 3000,
    perticipants: 20,
  },
  {
    name: "Meta Quest Presence Platform quiz 2024",
    reward: "25",
    level: "4",
    id: 4,
    pool: 3000,
    perticipants: 20,
  },
  {
    name: "Meta Quest Presence Platform quiz 2024",
    reward: "30",
    level: "5",
    id: 5,
    pool: 3000,
    perticipants: 20,
  },
];

const Topquiz = () => {
  return (
    <>
      <div className="col-lg-12">
        <div className="row">
          {/* Quiz */}

          <div className="col-lg-12">
            <h5 className="card-title">Fixed Quiz</h5>

            <div className="row">
              {cardData.map((card) => (
                <div key={card.id} className="col-lg-6">
                  <div
                    style={{ background: "#213743" }}
                    className="card info-card revenue-card"
                  >
                    <Link to="/quizInfo">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="">
                            <img
                              src={useimage}
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
                              <a href="#">{card.name}</a>
                            </h4>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                {/* First tag with icon */}
                                <span className="badge bg-warning">
                                  upcoming
                                </span>
                              </div>
                              <div className="d-flex align-items-center">
                                {/* Second tag with icon */}
                                <i className="bi bi-globe"> </i>{" "}
                                <span className="badge me-2">Public</span>
                              </div>
                            </div>
                            <br />
                            <div className="d-flex justify-content-between align-items-center">
                              {/* First word with icon */}
                              <div>
                                <span style={{ color: "#b1bad3" }}>
                                  POOL:{" "}
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
                                  {card.pool}
                                </span>
                              </div>
                              {/* Second word */}
                              <div>
                                <span style={{ color: "#b1bad3" }}>
                                  {card.perticipants} participants
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
          {/* End games */}
        </div>
      </div>
    </>
  );
};

export default Topquiz;
