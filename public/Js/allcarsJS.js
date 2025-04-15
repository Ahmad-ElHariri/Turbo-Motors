  // Ensure the DOM is fully loaded before executing any scripts
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    // Add event listeners for filters
    document.getElementById('carTypeFilter').addEventListener('change', filterCars);
    document.getElementById('fuelTypeFilter').addEventListener('change', filterCars);
    document.getElementById('availabilityFilter').addEventListener('change', filterCars);

    // Filtering function
    function filterCars() {
      // Get the values from the filters
      const carType = document.getElementById("carTypeFilter").value;
      const fuelType = document.getElementById("fuelTypeFilter").value;
      const availability = document.getElementById("availabilityFilter").value;

      console.log('Filtering cars...');
      console.log('carType:', carType, 'fuelType:', fuelType, 'availability:', availability); // Debugging logs

      // Get all the car boxes
      const carBoxes = document.querySelectorAll(".car-box");

      carBoxes.forEach(carBox => {
        const typeMatch = carType === "all" || carBox.getAttribute("data-type") === carType;
        const fuelMatch = fuelType === "all" || carBox.getAttribute("data-fuel") === fuelType;
        const availabilityMatch = availability === "all" || carBox.getAttribute("data-available") === availability;

        // If all filters match, show the car box; otherwise, hide it
        if (typeMatch && fuelMatch && availabilityMatch) {
          carBox.style.display = "block"; // Show the car
        } else {
          carBox.style.display = "none"; // Hide the car
        }
      });
    }
  });