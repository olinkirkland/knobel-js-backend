function experienceNeededFromLevel(level) {
  // 100 + (x x 50)^(1/4)
  return Math.round(100 + Math.pow(level * 50, 1 / 4));
}

module.exports = {
  experienceNeededFromLevel
};
