import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ContestantDegree from '../components/ContestantDegree';
import '../Main.css';
import Correct from "../correct.png";
import Wrong from "../wrong.png";
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import correSound from "../correct.mp3";
import worngSound from '../wrong.mp3';
import buzzerSound from '../buzzer.mp3';
const CorreSound = new Audio(correSound);
const WorngSound = new Audio(worngSound);
const BuzzerSound = new Audio(buzzerSound);

export default function Main() {
    const [port, setPort] = useState(null);
    const [reader, setReader] = useState(null);
    const [question, setQuestion] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(true);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const isTimerRunningRef = useRef(false);
    const [showQuestion, setShowQuestion] = useState(false);
    const showQuestionRef = useRef(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const activeButtonRef = useRef(localStorage.getItem("activeButton") || null);
    const [activeButton, setActiveButton] = useState(parseInt(localStorage.getItem("activeButton")) || null);
    const textDecoder = new TextDecoder();
    const [contestants, setContestants] = useState(JSON.parse(localStorage.getItem("contestants")) || [{ id: 1, score: 0 },
    { id: 2, score: 0 },
    { id: 3, score: 0 },
    { id: 4, score: 0 },]);

    const socket = io('https://mosabaga-project.onrender.com/');

    useEffect(() => {
        socket.on('pauseTimer', () => {
            setIsTimerRunning(false);
            isTimerRunningRef.current = false;
        });

        socket.on('resumeTimer', () => {
            setIsTimerRunning(true);
            isTimerRunningRef.current = true;
            setShowQuestion(false);
            showQuestionRef.current = false;
        });
        socket.on('startHalfMinuteTimer', () => {
            setTimeLeft(30);
        });

        socket.on('resetLamps', () => {
            setActiveButton(null);
            activeButtonRef.current = null;
            localStorage.setItem("activeButton", -1);
        });

        socket.on('setQuestion', (q) => {
            setIsTimerRunning(false);
            isTimerRunningRef.current = false;
            setTimeLeft(10);
            setQuestion(q);
            setActiveButton(null);
            activeButtonRef.current = null;
            setShowQuestion(true);
            showQuestionRef.current = true;
            localStorage.setItem("activeButton", -1);
            setShowResult(false);
        });

        socket.on('resetTimer', () => {
            setTimeLeft(10);
            setIsTimerRunning(false);
            isTimerRunningRef.current = false;
        });

        socket.on('hideQuestion', () => {
            setShowQuestion(false);
            showQuestionRef.current = false;
        });

        socket.on('saveData', (contestants) => {
            setContestants(contestants);
            localStorage.setItem("contestants", JSON.stringify(contestants));
        });

        socket.on('showResult', (result) => {
            if (!showQuestionRef.current) {
                setResult(result);
                setShowResult(true);
                result ? CorreSound.play() : WorngSound.play()
            }
        });
        socket.on('hideResult', () => {
            setShowResult(false);
        });
        return () => {
            socket.off('pauseTimer');
            socket.off('resumeTimer');
            socket.off('resetTimer');
        };
    }, []);

    useEffect(() => {
        if (timeLeft <= 0 && isTimerRunning) {
            setIsTimerRunning(false);
            isTimerRunningRef.current = false;
        }
        if (isTimerRunning) {
            const countdown = setInterval(() => {
                setTimeLeft((prev) => Math.max(prev - 1, 0));
            }, 1000);

            return () => clearInterval(countdown);
        }
    }, [isTimerRunning, timeLeft]);

    const connectToArduino = async () => {
        try {
            const requestedPort = await navigator.serial.requestPort();
            await requestedPort.open({ baudRate: 9600 });
            const newReader = requestedPort.readable.getReader();

            setPort(requestedPort);
            setReader(newReader);

            let newReceivedText = '';

            for (; ;) {
                const { value, done } = await newReader.read();
                if (done) {
                    newReader.releaseLock();
                    break;
                }

                const chunk = textDecoder.decode(value);
                newReceivedText += chunk;
                let lines = newReceivedText.split('\n');
                const receivedNumber = lines[lines.length - 1];
                console.log(receivedNumber)

                let buttonIndex = parseInt(receivedNumber, 10);

                if (buttonIndex >= 0 && buttonIndex < 4 && activeButtonRef.current === null) {
                    setShowQuestion(false);
                    showQuestionRef.current = false;
                    startTimer();
                    setActiveButton(buttonIndex);
                    localStorage.setItem("activeButton", buttonIndex);
                    activeButtonRef.current = buttonIndex;
                    BuzzerSound.play();
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const startTimer = () => {
        if (!isTimerRunning) {
            setIsTimerRunning(true);
            setTimeLeft(10);
        }
    };

    const disconnectFromArduino = async () => {
        try {
            if (reader) {
                await reader.cancel();
                reader.releaseLock();
            }
            if (port) {
                await port.close();
            }

            setPort(null);
            setReader(null);
            setActiveButton(null);
        } catch (error) {
            console.error('Error while disconnecting:', error);
        }
    };

    const AnimatedQuestion = () => {
        const containerRef = useRef();

        useGSAP(() => {
            if (!question) return;

            const words = question.split(' ');

            containerRef.current.innerHTML = words
                .map(word => `<span class="word" style="display: inline-block">${word}</span>`)
                .join(' ');

            gsap.from('.word', {
                opacity: 0,
                y: 170,
                rotateX: -360,
                duration: 1,
                stagger: 0.5,
                ease: "back.out(1.7)",
                transformOrigin: "0% 50% -50",
                scale: "0.5"
            });

        }, [question]);

        return (
            <div
                ref={containerRef}
                style={{
                    width: "max-content",
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                    maxWidth: "90%",
                    margin: "5% 5% 0 0",
                    perspective: "1000px"
                }}
            />
        );
    }


    const AnimatedResult = () => {
        const resultRef = useRef();

        useGSAP(() => {

            gsap.from('.True', {
                rotate: 360,
                duration: 1,
                stagger: 0.5,
                ease: "back.out(1.7)",
                transformOrigin: "0% 50% -50",
                scale: "0",
                delay: 0.3

            });
            gsap.from('.False', {
                duration: 1,
                stagger: 0.5,
                ease: "back.out(1.7)",
                transformOrigin: "0% 50% -50",
                scale: "0",
                delay: 0.3
            });

        }, []);

        return (
            <img ref={resultRef} className={result ? 'True' : 'False'} src={result ? Correct : Wrong} style={{
                height: "80%",
            }} alt="Correct" />
        );
    }

    return (
        <div lang="ar" dir="rtl">
            <div
                style={{
                    position: "absolute",
                    backgroundColor: result ? "#00ff00d0" : "#ff0000d0",
                    width: "100%",
                    height: "100%",
                    zIndex: 2,
                    marginRight: "-50px",
                    display: showResult ? "flex" : "none",
                    justifyContent: "center",
                    alignItems: "center",

                }}
            >

                <AnimatedResult />
            </div>
            <div className="MainRow">
                <ContestantDegree name="الأحمر" color="red" activeClass={activeButton === 0 ? "ActivedLamp" : ""} degree={contestants[0].score} />
                <ContestantDegree name="الأخضر" color="green" activeClass={activeButton === 1 ? "ActivedLamp" : ""} degree={contestants[1].score} />
                <h1 id="timerDisplay" style={{ color: timeLeft > 5 ? "green" : "red", fontSize: "200px", fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif" }}>{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</h1>
                <ContestantDegree name="الأزرق" color="blue" activeClass={activeButton === 2 ? "ActivedLamp" : ""} degree={contestants[2].score} />
                <ContestantDegree name="الأصفر" color="yellow" activeClass={activeButton === 3 ? "ActivedLamp" : ""} degree={contestants[3].score} />
                <div className='QuestinDiv' style={{ display: showQuestion ? 'block' : 'none' }}>
                    <AnimatedQuestion />
                </div>
            </div>
            <button onClick={connectToArduino} disabled={!!port}>
                اتصال
            </button>
            &nbsp;
            &nbsp;
            <button onClick={disconnectFromArduino} disabled={!port}>
                قطع الاتصال
            </button>
            &nbsp;
            &nbsp;
            <span id="data" style={{ color: "#eee" }}>{port ? 'Connected' : 'Disconnected'}</span>
        </div>
    );
};
