export function saveStats(stats) {
  localStorage.setItem("raceStats", JSON.stringify(stats));
}
  
export function loadStats() {
  const savedStats = localStorage.getItem("raceStats");
  return savedStats ? JSON.parse(savedStats) : null;
}

/*
    {
        races: 0, 
        WPM: 0,
        bestWPM: 0,
        accuracy: 0,
        charAccuracies: buildAccuracyMap()
      }
*/

export function updateStats(stats, WPM, accuracy, charData) {
    const updatedStats = { ...stats };
  
    updatedStats.races += 1;
    updatedStats.WPM += WPM;
    updatedStats.bestWPM = Math.max(WPM, updatedStats.bestWPM);
    updatedStats.accuracy += accuracy;
  
    Object.entries(charData).forEach(([key, value]) => {
      if (!updatedStats.charAccuracies[key]) {
        updatedStats.charAccuracies[key] = { correct: 0, total: 0 };
      }
      updatedStats.charAccuracies[key].correct += value.correct;
      updatedStats.charAccuracies[key].total += value.total;
    });
  
    saveStats(updatedStats);
  }