import { getPlaysongData } from "./getPlaysongData";

const deleteAllOccurrences = (array, id) => {
  return array.filter(item => item !== id);
};

export const savingPlaySongData = (id) => {
  let playSongData = getPlaysongData(); 
  if (playSongData) {
    if (playSongData.includes(id)) {
      playSongData = deleteAllOccurrences(playSongData, id);
    }
  } 
  else {
    playSongData = [];
  }

  playSongData.push(id);

  localStorage.setItem('playSongDataLS', JSON.stringify(playSongData));

};


