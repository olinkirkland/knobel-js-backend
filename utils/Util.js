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

function isValidQuestion(q) {
  const parts = q.incorrect_answers.concat(q.correct_answer);
  parts.push(q.question);
  return parts.every((p) => {
    return p.indexOf(";") === -1;
    // TODO return false if there are any other weird characters in any of the strings
  });
}

module.exports = {
  experienceNeededFromLevel,
  shuffle,
  isValidQuestion
};
