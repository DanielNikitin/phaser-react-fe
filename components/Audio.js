// audio.js
const isClient = typeof window !== 'undefined';

const sounds = isClient ? {
    itemPurchased: new Audio('/sound/2.wav'),
    noSelection: new Audio('/sound/1.wav'),
    menuClose: new Audio('/sound/3.wav'),
    vote: new Audio('/golosovanie_cut.mp3'),

    statusError: new Audio('/sound/1.wav'),
  } : {};

const playSound = (soundKey) => {
    if (isClient) {
        const sound = sounds[soundKey];
        if (sound) {
            sound.play().catch((error) => {
                console.error(`Error playing sound ${soundKey}:`, error);
            });
        } else {
            console.warn(`Sound ${soundKey} not found`);
        }
    }
};

export default playSound;
