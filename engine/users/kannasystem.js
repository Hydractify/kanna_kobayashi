module.exports = class Sys {
  animalExp() {
    level = this.level;
    xp = this.xp;
    xpNeeded = this.xp * 1.2;
    xpBase = 15;

    if(xp < xpNeeded && xp + xpBase <= xpNeeded) {
      xp += xpBase;
    } else {
      xp += xpBase - xpNeeded;
      xpNeeded *= 1.2;
      ++level;
    }
  }
}
