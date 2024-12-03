export const getPlaysongData = () =>{
    let playSongData = localStorage.getItem('playSongDataLS');
    if(!playSongData){
        return[];
    }
    playSongData = JSON.parse(playSongData);
    return playSongData;
};