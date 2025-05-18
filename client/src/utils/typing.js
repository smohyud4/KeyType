import prompts from './prompts.json';
import {generate} from 'random-words';

const TEXTS = [
    "There once was a man from nantucket.",
    "The quick brown fox jumps over the lazy dog.",
    "Ocean man, take me by the hand, lead me to the land that you understand.",
    "The rain in Spain falls mainly on the plain.",
    "A journey of a thousand miles begins with a single step.",
];

export const characters = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()[]{}_+=-;':,.<>/?" `

export function buildAccuracyMap() {
    const accuracies = {};
    for (const char of characters) {
      accuracies[char] = {correct: 0, total: 0};
    }

    return accuracies;
}

export function getGameText() {
    console.log(prompts[0]);
    const selectedText = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    return selectedText.split('');
}

export function mapGameText(sections = 5) {
    let text = "";
    const punctuation = [
      '.',
      '.',
      '.',
      '.',
      '.',
      '!',
      '!',
      '?'
    ];

    let random = Math.random();
    let count = random < 0.6 ? 2 : 3;

    while (count > 0) {
      const prompt = prompts[Math.floor(Math.random() * prompts.length)];
      let end = prompt[prompt.length-1];
      text += prompt;
      
      if (!punctuation.includes(end) && end !== '"') 
        text += punctuation[Math.floor(Math.random() * punctuation.length)]; 
      if (count !== 1) 
        text += ' ';
      count--;
    }
    
    const badCharacters = ['|', '~', '`', '@', '\\'];
    const regex = new RegExp(`[${badCharacters.join('\\')}]`, 'g'); // Escape special characters
    const result = text.replace(regex, "");

    return [result.split(''), getIndices(result, sections)];
}

export function getCurrentState(pointer, index, incorrect) {
  if (index > pointer) return '';
  if (index < pointer) return 'correct';
  if (index === pointer) {
    if (incorrect) return 'incorrect';
    return 'current';
  }
} 
      
export function calculateWPM(start, end, totalChars) {
  const elapsedTimeInMinutes = (end - start) / 1000 / 60; // Convert milliseconds to minutes
  const totalWords = totalChars / 5; // Approximate words by dividing total characters by 5
  const wpm = totalWords / elapsedTimeInMinutes;
  return wpm; // Round to the nearest integer
}

export function validateInput(key1, key2) {
    if (key1 == '' || key2 == '') 
        return "Characters must not be empty";

    if (key1.toLowerCase() === key2.toLowerCase()) 
        return "Characters must be distinct";

    if (!characters.includes(key1) || !characters.includes(key2)) 
        return "Characters must be found in " + characters;
    
    return "None";
}

export function generatePracticeText(key1, key2) {
    let str = "";
    const words = Math.floor(Math.random() * 6) + 20;

    for (let i = 0; i < words; i++) {
      const length = Math.floor(Math.random() * 4) + 2;
      for (let j = 0; j < length; j++) {
        const random = Math.random();
        if (random > 0.6) {
          str += key1;
        }
        else if (random > 0.2) {
          str += key2;
        }
        else {
          const word = generate({minLength: 2, maxLength: 4});
          str += word
          j += word.length-1;
        }
      }
      str += " ";
    }

    return str.trim();
}

export function getIndices(result, sections) {

    function findClosestSpace(index, result) {
      let right = result.slice(index).indexOf(' ');
      let left = index - (result.slice(0, index).lastIndexOf(' '));

      return left <= right ? index - left : right + index;
    }

    const indices = {};
    const incr = Math.floor(result.length / sections);

    let index = incr;
    for (let i=0; i < sections-1; i++) {
      let val = findClosestSpace(index, result);
      indices[val] = -1;
      index = val;
      index += incr;
    }

    return indices;
}
