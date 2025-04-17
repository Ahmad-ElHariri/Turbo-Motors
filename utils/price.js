function calculateTotal(cars, extras, pickupDateTime, dropoffDateTime) {
  let total = 0;

  const start = new Date(pickupDateTime);
  const end = new Date(dropoffDateTime);

  // If pickup is after dropoff, return 0
  if (start >= end) return 0;

  const durationInMs = end - start;
  const days = durationInMs / (1000 * 60 * 60 * 24); // may be a float like 2.5

  // Car price per day × number of days
  total += cars.reduce((sum, car) => sum + (car.pricePerDay * days), 0);

  // Extra charges
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
