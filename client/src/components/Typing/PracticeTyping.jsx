/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect, useRef} from 'react';
import {generate} from 'random-words';
import {getCurrentState, calculateWPM, validateInput, generatePracticeText, getIndices} from '../../utils/typing'
import Stats from '../Stats/Stats';
import TypingInput from '../TypingInput/TypingInput';
import { VscDebugRestart } from "react-icons/vsc";
import './Typing.css';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
// eslint-disable-next-line react/prop-types
export default function PracticeTyping() {

  const [inputData, setInputData] = useState({key1: '', key2: '', error: '', dictionary: false}); 
  const [inProgress, setInProgress] = useState(false);
  const [statShow, setStatShow] = useState(false);
  const [seeCurrStats, setSeeCurrStats] = useState(false);
  const [currWpm, setCurrWpm] = useState(0);
  const [currAccuracy, setCurrAccuracy] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [charAccuracies, setCharAccuracies] = useState({});

  const textRef = useRef([]);
  const inputRef = useRef(null);
  const startTimeRef = useRef(null);
  const pointerRef = useRef(0);
  const correctRef = useRef(false);
  const mistakes = useRef([]);
  const wrongRef = useRef(0);
  const timeStamps = useRef({});
  const segmentData = useRef([]);
  const wpmHistoryRef = useRef([{name: 0, WPM: 0}]);

  useEffect(() => {
    if (inProgress) {
      isMobile
        ? inputRef.current.focus()
        : document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [inProgress]);

  useEffect(() => {
    if (inProgress) {
      const intervalId = setInterval(updateWPM, 1000);
      //console.log('intervalId', intervalId);
      return () => clearInterval(intervalId);
    }
  }, [startTime]);
  
  function updateWPM() {
    const currentTime = new Date();
    const charactersTyped = pointerRef.current; // Use the ref value
    const wpm = calculateWPM(startTimeRef.current, currentTime, charactersTyped);
    wpmHistoryRef.current.push({
      name: wpmHistoryRef.current.length, 
      WPM: wpm
    });
    setCurrWpm(wpm);
  }
  
  function setSegmentData() {
    let prevTime = startTimeRef.current;
    let prevIndex = 0;
    let segment = 1;

    for (const index in timeStamps.current) {
      const numIndex = parseInt(index);
      const wpm = calculateWPM(prevTime, timeStamps.current[index], numIndex - prevIndex + 1);

      segmentData.current.push({
        name: isMobile ? segment : `Segment ${segment}`,
        segment: textRef.current.slice(prevIndex, numIndex+1).join(''),
        WPM: wpm
      });
      
      prevTime = timeStamps.current[index];
      prevIndex = numIndex + 1;
      segment += 1;
    }
  }

  function startGame() {
    let error = null;
    if (!inputData.dictionary) error = validateInput(inputData.key1, inputData.key2);
    if (error == "None" || error == null) {

      setCharAccuracies({}); 

      wrongRef.current = 0;
      mistakes.current = [];
      setInProgress(true);
      setStatShow(false);
      wpmHistoryRef.current = [{name: 0, WPM: 0}];
      segmentData.current = [];
      setCurrWpm(0);
      setCurrAccuracy(0);
      setInputData({...inputData, error: ''});

      const array = !inputData.dictionary
        ?  Array.from(generatePracticeText(inputData.key1, inputData.key2))
        :  Array.from(generate({ min: 20, max: 30, maxLength: 6, join: ' '}));
        
      timeStamps.current = getIndices(array.join(''), 6);
      textRef.current = array;
    }
    else {
      setInputData({...inputData, error: error});
    }
  }

  function resetGame() {
    setInProgress(false);
    startTimeRef.current = null;
    pointerRef.current = 0;
    correctRef.current = false;
    timeStamps.current = {};
    setStartTime(null);
    setStatShow(true);
    setSeeCurrStats(false);
  }
  
  function handleRestart() {
    startTimeRef.current = null;
    pointerRef.current = 0;
    correctRef.current = false;
    setStartTime(null);
    startGame();
  }

  function handleKeyDown(event) {
    const key = event.key;
    if (key === "Backspace") return;
    if (key === ' '  || event.keyCode === 32) event.preventDefault();

    if (!startTimeRef.current && key !== "Shift") {
      const now = new Date();
      startTimeRef.current = now;
      setStartTime(now);
    }

    if (key === textRef.current[pointerRef.current]) {

      setCharAccuracies({});
      
      if (pointerRef.current in timeStamps.current) {
        timeStamps.current[pointerRef.current] = new Date();
      } 

      correctRef.current = false;
      pointerRef.current += 1;
      let accuracy = (((pointerRef.current-wrongRef.current) / pointerRef.current) * 100);
      setCurrAccuracy(accuracy);

      if (pointerRef.current == textRef.current.length) {
        const newEndTime = new Date();
        timeStamps.current[pointerRef.current] = newEndTime;
        const wpm = calculateWPM(startTimeRef.current, newEndTime, pointerRef.current);
        setCurrWpm(wpm);
        wpmHistoryRef.current.push({
          name: wpmHistoryRef.current.length, 
          WPM: wpm
        });
        setSegmentData();
        resetGame();
      }
    
    }
    else if (key !== "Shift") {
        if (!correctRef.current) {
            wrongRef.current += 1;
            mistakes.current.push(pointerRef.current);
            correctRef.current = true;
            setCharAccuracies({}); 
        }
    }
  }
  
  return (
    <>
      {(!inProgress) && <TypingInput data={inputData} setData={setInputData} />}
      <div className='container-typing'>
      {!statShow ? (
        <div className='wrapper-typing'>
          {textRef.current.map((char, index) => (
            <span 
              key={index} 
              id={index.toString()} 
              className={getCurrentState(pointerRef.current, index, correctRef.current)}
            >
              {char}
            </span>
          ))}
          <hr/>
          <p>WPM: {seeCurrStats ? Math.round(currWpm) : '--'}</p>
          <p>Accuracy: {seeCurrStats ? `${currAccuracy.toFixed(2)}%` : '--'}</p>
          <input
            type="checkbox"
            name="currStats"
            onChange={() => {
              setSeeCurrStats(!seeCurrStats);
              if (isMobile) inputRef.current.focus();
            }}
            title='Show current stats'
          />
          <input
            type="text"
            ref={inputRef}
            className="hidden-input"
            onKeyDown={(event) => {
              event.preventDefault();
              handleKeyDown(event)
            }}
            autoComplete="off"
          />
        </div>
      ) : (
        <Stats 
          wpm={currWpm} 
          accuracy={currAccuracy} 
          charsTyped={textRef.current.length} 
          mistakes={wrongRef.current}
          mistakeIndeces={mistakes.current}
          data={wpmHistoryRef.current}
          barData={segmentData.current}
          text={textRef.current}
        >
        </Stats>
      )}
      </div>
      {!inProgress ? (
        <button id='start-button' onClick={startGame}>
          {statShow ? 'Race Again' : 'Start'}
        </button>
      ) : (
        <button id='start-button' onClick={handleRestart}>
          <VscDebugRestart/>
        </button>
      )}
    </>
  );
} 