function calculateTotal(cars, extras, pickupDateTime, dropoffDateTime) {
  let total = 0;

  const start = new Date(pickupDateTime);
  const end = new Date(dropoffDateTime);

  if (start >= end) return 0;

  const durationInMs = end - start;
  const totalHours = durationInMs / (1000 * 60 * 60);
  const fullDays = Math.floor(totalHours / 24);
  const remainingHours = Math.ceil(totalHours % 24); // round up hours

  total += cars.reduce((sum, car) => {
    const pricePerDay = car.pricePerDay;
    const pricePerHour = pricePerDay / 24;

    // 1 day minimum
    if (totalHours <= 24) {
      return sum + pricePerDay;
    }

    // Full days + remaining hours
    return sum + (fullDays * pricePerDay) + (remainingHours * pricePerHour);
  }, 0);

  // Extras (flat fee)
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
