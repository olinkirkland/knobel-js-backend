function experienceNeededFromLevel(level) {
  // 100 + (x/7)^2
  return Math.round(100 + Math.pow(level / 7, 2));
}

module.exports = {
  experienceNeededFromLevel
};
