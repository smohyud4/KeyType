/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import {useState, useEffect, useRef} from 'react';
import {buildAccuracyMap, getGameText, mapGameText, getCurrentState, calculateWPM} from '../../utils/typing'
import axios from 'axios';
import Stats from '../Stats/Stats';
import './Typing.css';

// eslint-disable-next-line react/prop-types
export default function Typing({isUserSignedIn}) {

  const [inProgress, setInProgress] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [seeCurrStats, setSeeCurrStats] = useState(false);
  const [statShow, setStatShow] = useState(false);
  const [text, setText] = useState("Press start to play!".split('').map(char => ({character: char, currState: ''})));
  const [currWpm, setCurrWpm] = useState(0);

  const [currAccuracy, setCurrAccuracy] = useState(0);

  const [startTime, setStartTime] = useState(null);
  const [charAccuracies, setCharAccuracies] = useState({});

  const startTimeRef = useRef(null);
  const pointerRef = useRef(0);
  const correctRef = useRef(false);
  const wrongRef = useRef(0);
  const wpmHistoryRef = useRef([{name: 0, WPM: 0, "WPM/s": 0 }]);

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

  useEffect(() => {

    async function uploadStats() {
      try {
        const chars = Object.entries(charAccuracies).filter(([_, data]) => data.total > 0);
        console.log(chars);
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await axios.patch(`${apiUrl}/race`, {currWpm, currAccuracy, chars}, {withCredentials: true});

        if (response.data.error) {
          console.log(response.data.error);
          return;
        }

        setStatsLoaded(true);
      }
      catch (error) {
        console.log(error);
      }
    }

    if (statShow && isUserSignedIn) uploadStats();    

  }, [statShow]);

  useEffect(() => {
    const handleKeyDownWrapper = (event) => handleKeyDown(event);
    if (inProgress) document.addEventListener('keydown', handleKeyDownWrapper, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDownWrapper, true);
    };
  }, [inProgress]);

  useEffect(() => {
    if (inProgress) {
      const intervalId = setInterval(updateWPM, 1000);
      //console.log('intervalId', intervalId);
      return () => clearInterval(intervalId);
    }
  }, [startTime]); 
  
  async function fetchText() {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${apiUrl}/random-text`, {withCredentials: true});
      if (response.data.error) {
        console.log(response.data.error);
        setText(getGameText());
        return;
      }
      const facts = response.data.text;
      setText(mapGameText(facts));
    }
    catch (error) {
      console.log(error);
      setText(getGameText());
    }
  }

  function init() {
    setCharAccuracies(buildAccuracyMap());
    setCurrWpm(0);
    setCurrAccuracy(0);
    setInProgress(true);
    setStatsLoaded(false);
    wpmHistoryRef.current = [{name: 0, WPM: 0, "WPM/s": 0}];
    if (!isUserSignedIn) {
      setStatShow(false);
      const newText = getGameText();
      setText(newText);
    }
  }

  function startGame() {
    if (!isUserSignedIn) { 
      init();
    }
    else {
      setStatShow(false);
      setText("Loading...".split('').map(char => ({character: char, currState: ''})));
      fetchText().then(() => {
        init();
      }).catch((error) => {
        console.error('Error:', error);
      });
    }
  }

  function resetGame() {
    setInProgress(false);
    startTimeRef.current = null;
    pointerRef.current = 0;
    correctRef.current = false;
    wrongRef.current = 0;
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

    if (key === text[pointerRef.current].character) {
     
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
            correctRef.current = true;
            let char = text[pointerRef.current];
            updateCharAccuracies(char.character, false);
        }
    }
  }

  return (
    <>
      <div className='container-typing'>
      {!statShow ? (
        <section className='wrapper-typing'>
          {text.map((element, index) => (
            <span 
              key={index} 
              id={index.toString()} 
              className={getCurrentState(pointerRef.current, index, correctRef.current)}
            >
              {element.character}
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
        statsLoaded || !isUserSignedIn ? (
          <Stats 
            wpm={currWpm} 
            accuracy={currAccuracy} 
            charsTyped={text.length} 
            mistakes={text.length-text.length*(currAccuracy/100)}
            data={wpmHistoryRef.current}
          >
          </Stats>
        ) : (
          <div className="loader"></div>
        )
      )}
      </div>
      {!inProgress && 
        <button id='start-button' onClick={startGame}>
          {statShow ? 'Race Again' : 'Start'}
        </button>
      }
    </>
  );
} 