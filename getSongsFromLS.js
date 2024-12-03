export const getSongsFromLS = () =>{
    let songs = localStorage.getItem('songsLS');
    if(!songs){
        return[];
    }
    songs = JSON.parse(songs);
    return songs;
};