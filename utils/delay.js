function randomDelay(min = 1000, max = 3000) {
  return new Promise(resolve =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min)) + min)
  );
}

module.exports = randomDelay;