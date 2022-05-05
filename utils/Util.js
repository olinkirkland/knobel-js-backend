function experienceNeededFromLevel(level) {
  return Math.round(100 + (level - 1) * 7);
}

module.exports = {
  experienceNeededFromLevel
};
