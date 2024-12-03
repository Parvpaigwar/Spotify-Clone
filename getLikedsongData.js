export const getLikedsongData = () =>{
    let likedsongData = localStorage.getItem('likedsongDataLS');
    if(!likedsongData){
        return[];
    }
    likedsongData = JSON.parse(likedsongData);
    return likedsongData;
};