function calculateTotal(cars, extras) {
    let total = 0;
    total += cars.reduce((sum, c) => sum + c.pricePerDay, 0);
  
    if (extras.chauffeur) total += 50;
    if (extras.babySeat) total += 20;
    if (extras.navigator) total += 15;
    if (extras.gps) total += 10;
  
    if (extras.insurance === "full") total += 80;
    else if (extras.insurance === "tires") total += 30;
    else if (extras.insurance === "additionalDriver") total += 40;
  
    if (extras.fuel === "prepaid") total += 60;
    else if (extras.fuel === "payOnReturn") total += 70;
  
    return total;
  }
  
  module.exports = calculateTotal;