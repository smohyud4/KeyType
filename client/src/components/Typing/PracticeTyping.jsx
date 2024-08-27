/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect, useRef} from 'react';
import {generate} from 'random-words';
import {buildAccuracyMap, calculateWPM, validateInput, generatePracticeText} from '../../utils/typing'
import Stats from '../Stats/Stats';
import TypingInput from '../TypingInput/TypingInput';
import './Typing.css';

// eslint-disable-next-line react/prop-types
export default function PracticeTyping() {

  const [inputData, setInputData] = useState({key1: '', key2: '', error: '', capitals: false, dictionary: false}); 
  const [inProgress, setInProgress] = useState(false);
  const [statShow, setStatShow] = useState(false);
  const [seeCurrStats, setSeeCurrStats] = useState(false);
  const [text, setText] = useState([]);
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
    const handleKeyDownWrapper = (event) => handleKeyDown(event);
    if (inProgress) document.addEventListener('keydown', handleKeyDownWrapper, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDownWrapper, true);
    };
  }, [pointerRef, inProgress]);

  useEffect(() => {
    if (inProgress) {
      const intervalId = setInterval(updateWPM, 1000);
      //console.log('intervalId', intervalId);
      return () => clearInterval(intervalId);
    }
  }, [startTime]);  

  function startGame() {
    let error = null;
    if (!inputData.dictionary) error = validateInput(inputData.key1, inputData.key2);
    if (error == "None" || error == null) {

      setCharAccuracies(buildAccuracyMap()); 

      setInProgress(true);
      setStatShow(false);
      wpmHistoryRef.current = [{name: 0, WPM: 0, "WPM/s": 0}];
      setCurrWpm(0);
      setCurrAccuracy(0);
      setInputData({...inputData, error: ''});

      const array = !inputData.dictionary
        ?  Array.from(generatePracticeText(inputData.key1, inputData.key2, inputData.capitals))
        :  Array.from(generate({ min: 20, max: 30, maxLength: 6, join: ' '}));
        
      setText(array.map((char, index) => {
        if (index == 0) return { character: char, currState: 'current'};
        return { character: char, currState: ''}
      }))
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
    wrongRef.current = 0;
    setStartTime(null);
    setStatShow(true);
    setSeeCurrStats(false);
  } 

  function handleKeyDown(event) {
    event.preventDefault(); // Make sure you don't scroll down with a space
    const key = event.key;
    if (key === "Backspace") return;

    if (!startTimeRef.current && key !== "Shift") {
      const now = new Date();
      startTimeRef.current = now;
      setStartTime(now);
    }


    let char = text[pointerRef.current];

    if (key === text[pointerRef.current].character) {
      char.currState = "correct";
     
      updateCharAccuracies(key, true);
   
      correctRef.current = false;
      pointerRef.current += 1;
      let accuracy = (((pointerRef.current-wrongRef.current) / pointerRef.current) * 100);
      setCurrAccuracy(accuracy);

      if (pointerRef.current < text.length) {
        text[pointerRef.current].currState = "current";
      }
      else {
        const newEndTime = new Date();
        const wpm = calculateWPM(startTimeRef.current, newEndTime, pointerRef.current);
        wpmHistoryRef.current.push({name: wpmHistoryRef.current.length, WPM: wpm, "WPM/s": 0});
        setCurrWpm(wpm);
        resetGame();
      }
    
    }
    else if (key !== "Shift") {
        if (!correctRef.current) {
            wrongRef.current += 1;
            correctRef.current = true;
            updateCharAccuracies(char.character, false);
        }

        char.currState = "incorrect";
    }
  }
  
  return (
    <>
      {(!inProgress) && <TypingInput data={inputData} setData={setInputData} />}
      <div className='container-typing'>
      {!statShow ? (
        <div className='wrapper-typing'>
          {text.map((element, index) => (
            <span key={index} id={index.toString()} className={element.currState}>
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
        </div>
      ) : (
        <Stats 
          wpm={currWpm} 
          accuracy={currAccuracy} 
          charsTyped={text.length} 
          mistakes={text.length-text.length*(currAccuracy/100)}
          data={wpmHistoryRef.current}
        >
        </Stats>
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