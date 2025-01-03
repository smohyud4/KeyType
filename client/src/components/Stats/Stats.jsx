/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { SlSpeedometer  } from "react-icons/sl";
import { PiTargetLight } from "react-icons/pi";
import { RiCharacterRecognitionLine } from "react-icons/ri";
import { RxCross1 } from "react-icons/rx";
import LineChartComponent from '../LineChart/LineChartComopnent';
import './Stats.css';

export default function Stats({
  wpm, 
  accuracy, 
  charsTyped, 
  mistakes,
  mistakeIndeces,
  data,
  text 
}) {

  console.log('mistakes', mistakeIndeces);

  return (
    <>
      <aside className="race-stats">
        <header className="race-header">
         <SlSpeedometer className="stat-icon"/>
         <h2>WPM: {Math.round(wpm)}</h2>
        </header>
        <header className="race-header">
         <PiTargetLight className="stat-icon"/>
         <h2>Accuracy: {accuracy.toFixed(2)}%</h2>
        </header>
        <header className="race-header">
         <RiCharacterRecognitionLine className="stat-icon"/>
         <h2>Characters: {Math.round(charsTyped)}</h2>
        </header>
        <header className="race-header">
         <RxCross1 className="stat-icon"/>
         <h2>Mistakes: {Math.round(mistakes)}</h2>
        </header>
      </aside>
      <article className="stats-container">
        <LineChartComponent data={data}/>
      </article>
      <article className="word-container">
        {text.map((char, index) => (
          <span key={index} className={mistakeIndeces.includes(index) ? 'missed' : ''}> 
            {char}
          </span>
        ))}
      </article>
    </>
  )
}