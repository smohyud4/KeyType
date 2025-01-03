/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {useState, useEffect, useRef} from 'react';
import {buildAccuracyMap, getGameText, getCurrentState, calculateWPM} from '../../utils/typing'
import Stats from '../Stats/Stats';
import './Typing.css';

// eslint-disable-next-line react/prop-types
export default function Typing() {

  const [inProgress, setInProgress] = useState(false);
  const [seeCurrStats, setSeeCurrStats] = useState(false);
  const [statShow, setStatShow] = useState(false);
  const [text, setText] = useState("Press start to play!".split(''));
  const [currWpm, setCurrWpm] = useState(0);

  const [currAccuracy, setCurrAccuracy] = useState(0);

  const [startTime, setStartTime] = useState(null);
  const [charAccuracies, setCharAccuracies] = useState({});

  const startTimeRef = useRef(null);
  const pointerRef = useRef(0);
  const correctRef = useRef(false);
  const mistakes = useRef([]);
  const wrongRef = useRef(0);
  const wpmHistoryRef = useRef([{name: 0, WPM: 0, "WPM/s": 0 }]);

  useEffect(() => {
    if (inProgress) document.addEventListener('keydown', handleKeyDown, true);

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
      WPM: wpm, 
      "WPM/s": wpm-wpmHistoryRef.current[wpmHistoryRef.current.length-1].WPM
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

  function init() {
    setCharAccuracies(buildAccuracyMap());
    setCurrWpm(0);
    setCurrAccuracy(0);
    setInProgress(true);
    wrongRef.current = 0;
    mistakes.current = [];
    wpmHistoryRef.current = [{name: 0, WPM: 0, "WPM/s": 0}];
  
    const newText = getGameText();
    setText(newText);
  }

  function resetGame() {
    setInProgress(false);
    startTimeRef.current = null;
    pointerRef.current = 0;
    correctRef.current = false;
    setStartTime(null);
    setStatShow(true);
    setSeeCurrStats(false);
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

    if (key === text[pointerRef.current]) {
     
      updateCharAccuracies(key, true);
   
      correctRef.current = false;
      pointerRef.current += 1;
      let accuracy = (((pointerRef.current-wrongRef.current) / pointerRef.current) * 100);
      setCurrAccuracy(accuracy);

      if (pointerRef.current == text.length) {
        const newEndTime = new Date();
        const wpm = calculateWPM(startTimeRef.current, newEndTime, pointerRef.current);
        setCurrWpm(wpm);
        wpmHistoryRef.current.push({
          name: wpmHistoryRef.current.length, 
          WPM: wpm, 
          "WPM/s": wpm-wpmHistoryRef.current[wpmHistoryRef.current.length-1].WPM
        });
        resetGame();
      }
    
    }
    else if (key !== "Shift") {
        if (!correctRef.current) {
            wrongRef.current += 1;
            mistakes.current.push(pointerRef.current);
            correctRef.current = true;
            let char = text[pointerRef.current];
            updateCharAccuracies(char, false);
        }
    }
  }

  return (
    <>
      <div className='container-typing'>
      {!statShow ? (
        <section className='wrapper-typing'>
          {text.map((char, index) => (
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
            onChange={() => setSeeCurrStats(!seeCurrStats)}
            title='Show current stats'
          />
        </section>
      ) : (
        <Stats 
          wpm={currWpm} 
          accuracy={currAccuracy} 
          charsTyped={text.length} 
          mistakes={wrongRef.current}
          mistakeIndeces={mistakes.current}
          data={wpmHistoryRef.current}
          text={text}
        >
        </Stats>
      )}
      </div>
      {!inProgress && 
        <button id='start-button' onClick={init}>
          {statShow ? 'Race Again' : 'Start'}
        </button>
      }
    </>
  );
} 