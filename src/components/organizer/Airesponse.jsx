import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { TypingIndicator } from "@chatscope/chat-ui-kit-react";
import logo from "../../assets/img/tfuel.jpg";

const Airesponse = forwardRef((props, ref) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [isChatbotTyping, setIsChatbotTyping] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useImperativeHandle(ref, () => ({
    handleGenerateIncorrectOptions,
  }));

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

    return await processUserMessageForGoogle(updatedChatMessages);
  };

  async function processUserMessageForGoogle(messages) {
    let contents = messages.map((messageObject) => {
      let role = messageObject.sender === "user" ? "user" : "model";
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
      let incorrectOptionsStr = "";

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
        incorrectOptionsStr += messagePart.trim();
      }
      setChatMessages([...chatMessagesWithResponse]);

      const cleanedOptions = incorrectOptionsStr
        .split(/[.\-]\s?/)
        .map((opt) => opt.trim())
        .filter((opt) => opt && !/^\d/.test(opt));

      return cleanedOptions;
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
      return [];
    }
  }

  const handleGenerateIncorrectOptions = async (question, correctAnswer) => {
    const userMessage = `I'm a quiz organizer and I want you to help me generate 3 incorrect options to this question "${question}". My answer is "${correctAnswer}". Type out only the 3 incorrect options. Please don't type any paragraph before your option list. Just give me only the 3 incorrect options.`;

    const incorrectOptions = await handleUserMessage(userMessage);
    return incorrectOptions;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <>
      <section id="chat-section" className="chat-section">
        <div className="container">
          <div className="chat-window">
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    message.sender === "user" ? "user-message" : "ai-message"
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
            <div className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleUserMessage(input);
                    setInput("");
                  }
                }}
                placeholder="Type your message..."
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export default Airesponse;
