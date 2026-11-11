// Holds an explicit play queue (e.g. the liked-songs playlist).
// When no queue is active, "next" falls back to the order of cards on the page.
let queue = [];
let position = -1;

export const setQueue = (ids) => {
    queue = [...ids];
    position = 0;
};

export const clearQueue = () => {
    queue = [];
    position = -1;
};

export const nextInQueue = () => {
    if (position >= 0 && position < queue.length - 1) {
        position += 1;
        return queue[position];
    }
    clearQueue();
    return undefined;
};
