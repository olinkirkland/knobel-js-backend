function experienceNeededFromLevel(level) {
  return Math.round(100 + (level - 1) * 7);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = {
  experienceNeededFromLevel,
  shuffle,
};
