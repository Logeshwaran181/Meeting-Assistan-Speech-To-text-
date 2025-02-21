import "regenerator-runtime/runtime";
import React, { useState, useEffect } from "react";
import "./App.css";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import useClipboard from "react-use-clipboard";

const App = () => {
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [textToCopy, setTextToCopy] = useState("");
    const [isCopied, setCopied] = useClipboard(textToCopy, { successDuration: 1000 });
    const [detectedItems, setDetectedItems] = useState([]);

    useEffect(() => {
        setTextToCopy(transcript);
        extractMeetingDetails(transcript);
    }, [transcript]);

    const startListening = () => {
        SpeechRecognition.startListening({ language: "en-IN", continuous: true });
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
    };

    const extractMeetingDetails = (text) => {
        const taskRegex = /\b(submit|review|attend|prepare|check|finish|complete|update|schedule|meeting|call|deadline|task|action item)\s*(.*?)(?=\s(by|before|at|on|next|this|$))/gi;
        const dateRegex = /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|today|tomorrow|next week|next month|this week|this month|\d{1,2}(st|nd|rd|th)?\s(?:January|February|March|April|May|June|July|August|September|October|November|December)|\d{1,2}[:\.]?\d{0,2}\s?(AM|PM|am|pm)?)\b/gi;
        const eventRegex = /\b(meeting|conference|workshop|presentation|call|seminar|appointment|discussion|session|interview)\b/gi;

        let tasks = [];
        let dates = [];
        let events = [];

        let match;

        while ((match = taskRegex.exec(text)) !== null) {
            tasks.push(match[2].trim());
        }

        while ((match = dateRegex.exec(text)) !== null) {
            dates.push(match[0].trim());
        }

        while ((match = eventRegex.exec(text)) !== null) {
            events.push(match[0].trim());
        }

        // Aligning the tasks, dates, and events
        let maxLength = Math.max(tasks.length, dates.length, events.length);
        let extractedItems = [];

        for (let i = 0; i < maxLength; i++) {
            let task = tasks[i] || "—";
            let date = dates[i] || "—";
            let event = events[i] || "—";

            // Check for missing values and fill in dashes
            if (i < tasks.length && !dates[i] && !events[i]) {
                // If there's a task but no date/event, keep dashes for missing fields
                date = "—";
                event = "—";
            }

            extractedItems.push({ task, date, event });
        }

        setDetectedItems(extractedItems);
    };

    if (!browserSupportsSpeechRecognition) {
        return <p>Your browser does not support speech recognition.</p>;
    }

    return (
        <div className="container">
            <h2>🗣️ Meeting Assistant</h2>
            <p>Speak, and the system will detect tasks, dates, and events automatically.</p>

            <div className="main-content">{transcript || "Start speaking..."}</div>

            <div className="btn-style">
                <button onClick={setCopied}>{isCopied ? "📋 Copied!" : "Copy Notes"}</button>
                <button onClick={startListening}>🎙️ Start Listening</button>
                <button onClick={stopListening}>⏹️ Stop Listening</button>
                <button onClick={resetTranscript}>🗑️ Reset</button>
            </div>

            <h3>✅ Detected Information</h3>
            <table>
                <thead>
                    <tr>
                        <th>📝 Task</th>
                        <th>📅 Date</th>
                        <th>📌 Event</th>
                    </tr>
                </thead>
                <tbody>
                    {detectedItems.length ? (
                        detectedItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.task}</td>
                                <td>{item.date}</td>
                                <td>{item.event}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No information detected.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <p>Status: {listening ? "🎤 Listening..." : "🔇 Not Listening"}</p>
        </div>
    );
};

export default App;
