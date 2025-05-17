/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {useState, useEffect, useRef} from 'react';
import {buildAccuracyMap, getGameText, mapGameText, getCurrentState, calculateWPM} from '../../utils/typing'
import { saveStats, loadStats, updateStats } from '../../utils/storage';
import { VscDebugRestart } from "react-icons/vsc";
import Stats from '../Stats/Stats';
import './Typing.css';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
// eslint-disable-next-line react/prop-types
export default function Typing() {

  const [inProgress, setInProgress] = useState(false);
  const [seeCurrStats, setSeeCurrStats] = useState(false);
  const [statShow, setStatShow] = useState(false);
  const [currWpm, setCurrWpm] = useState(0);
  const [currAccuracy, setCurrAccuracy] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [charAccuracies, setCharAccuracies] = useState({});

  const textRef = useRef("Press start to play!".split(''));
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
    if (!loadStats()) {
      const defaultStats = {
        races: 0, 
        WPM: 0,
        bestWPM: 0,
        accuracy: 0,
        charAccuracies: buildAccuracyMap()
      }
      saveStats(defaultStats);
    }
  }, []);

  useEffect(() => {
    if (statShow) {
      const stats = loadStats();
      updateStats(stats, currWpm, currAccuracy, charAccuracies);
    }
  }, [statShow])

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
    let intervalId;
    if (inProgress && startTime) {
      intervalId = setInterval(updateWPM, 1000);
    }

    return () => {
      clearInterval(intervalId);
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
  
  function updateCharAccuracies(char, correct) {
    setCharAccuracies(prev => {
      const newCharAccuracies = {...prev};
      let charData = newCharAccuracies[char];
      if (correct) {
        charData.correct += 1;
        charData.total += 1;
      }
      else {
        charData.correct -= 1;
      }
      return newCharAccuracies;
    });
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

  function init() {
    setStatShow(false);
    setCharAccuracies(buildAccuracyMap());
    setCurrWpm(0);
    setCurrAccuracy(0);
    setInProgress(true);
    wrongRef.current = 0;
    mistakes.current = [];
    wpmHistoryRef.current = [{name: 0, WPM: 0}];
    segmentData.current = [];
  
    const [newText, indices]  = mapGameText();
    timeStamps.current = indices;
    textRef.current = newText;
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
    init();
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
     
      updateCharAccuracies(key, true);

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
            let char = textRef.current[pointerRef.current];
            updateCharAccuracies(char, false);
        }
    }
  }

  return (
    <>
      <div className='container-typing'>
      {!statShow ? (
        <section className='wrapper-typing'>
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
        </section>
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
        <button id='start-button' onClick={init}>
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