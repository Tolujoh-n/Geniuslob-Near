import React, { useRef, useState, useEffect } from "react";
import { FiSend, FiPaperclip } from "react-icons/fi";
import { TypingIndicator } from "@chatscope/chat-ui-kit-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import logo from "../../assets/geniuslob.png";

const Chatbot = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [file, setFile] = useState(null);
  const hiddenFileInput = useRef(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatbotTyping, setIsChatbotTyping] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleAttachClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  const handleFileChange = (event) => {
    const fileUploaded = event.target.files?.[0];
    if (fileUploaded) {
      handleFile(fileUploaded);
    }
  };

  const handleFile = (file) => {
    console.log("File uploaded name:" + file.name);
  };

  const handleUserMessage = async (userMessage) => {
    const newUserMessage = {
      message: userMessage,
      sender: "user",
      direction: "outgoing",
      error: false,
    };

    const updatedChatMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedChatMessages);
    setIsChatbotTyping(true);

    await processUserMessageForGoogle(updatedChatMessages);
  };

  async function processUserMessageForGoogle(messages) {
    let contents = messages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "user") {
        role = "user";
      } else {
        role = "model";
      }
      let msg = messageObject.message;
      return { role: role, parts: [{ text: msg }] };
    });

    const apiRequestBody = {
      contents,
    };

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?alt=sse&key=" +
          process.env.REACT_APP_GOOGLE_API_KEY,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiRequestBody),
        }
      );
      if (!response.ok || !response.body) {
        throw response.statusText;
      }

      const newStreamMessage = {
        message: "",
        sender: "model",
        direction: "incoming",
        error: false,
      };
      const chatMessagesWithResponse = [...messages, newStreamMessage];
      const latestModelMessageIndex = chatMessagesWithResponse.length - 1;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let loopRunner = true;

      while (loopRunner) {
        const { value, done } = await reader.read();
        if (done) {
          setIsChatbotTyping(false);
          break;
        }

        const decodedChunk = decoder.decode(value, { stream: true });
        const cleanedDecodedChunk = decodedChunk.replace(/^data:\s*/, "");
        let messagePart = "";
        let errorFlag = false;

        try {
          messagePart = JSON.parse(cleanedDecodedChunk).candidates[0].content
            .parts[0].text;
        } catch {
          messagePart = "Error retrieving results";
          errorFlag = true;
        }

        chatMessagesWithResponse[
          latestModelMessageIndex
        ].message += messagePart;
        if (errorFlag) {
          chatMessagesWithResponse[latestModelMessageIndex].error = true;
        }
        setChatMessages([...chatMessagesWithResponse]);
      }
    } catch (error) {
      console.log(error);
      setChatMessages([
        ...messages,
        {
          message: "Error retrieving message",
          sender: "model",
          direction: "incoming",
          error: true,
        },
      ]);
      setIsChatbotTyping(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleUserMessage(input);
      setInput("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <>
      <div className="col-lg-12">
        <section className="section profile">
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="">
                  <>
                    <section id="chat-section" className="chat-section">
                      <div className="container">
                        <div className="chat-window">
                          <div className="chat-messages">
                            {chatMessages.map((message, index) => (
                              <div
                                key={index}
                                className={`chat-message ${
                                  message.sender === "user"
                                    ? "user-message"
                                    : "ai-message"
                                }`}
                              >
                                <div style={{ display: "flex" }}>
                                  {message.sender === "model" && (
                                    <img
                                      style={{
                                        height: "30px",
                                        width: "30px",
                                        borderRadius: "50%",
                                        marginRight: "10px",
                                        alignSelf: "flex-start",
                                      }}
                                      src={logo}
                                      alt="Logo"
                                    />
                                  )}
                                  <div>
                                    {message.error ? (
                                      <>
                                        <i className="bi bi-exclamation-triangle-fill"></i>
                                        <span>{message.message}</span>
                                      </>
                                    ) : (
                                      message.message
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {isChatbotTyping && (
                              <div className="chat-message ai-message">
                                <TypingIndicator content="ChatGPT is thinking" />
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                          <div className="text-center chat-input">
                            <button onClick={handleAttachClick}>
                              <i className="bi bi-paperclip"></i>
                            </button>
                            <input
                              type="text"
                              style={{ width: "100%" }}
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyPress={handleKeyPress}
                              placeholder="Type your message..."
                            />
                            <button onClick={() => handleUserMessage(input)}>
                              <i className="bi bi-send"></i>
                            </button>
                          </div>
                          <p style={{ textAlign: "center", color: "red" }}>
                            Note: Your chat will be cleared once you disconnect
                          </p>
                        </div>
                      </div>
                    </section>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      ref={hiddenFileInput}
                      style={{ display: "none" }} // Make the file input element invisible
                    />
                  </>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Chatbot;
