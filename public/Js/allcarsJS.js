document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
  
    // Add event listeners for filters
    const filters = [
      "carTypeFilter", "fuelTypeFilter", "availabilityFilter",
      "gearboxFilter", "passengersFilter", "doorsFilter", "acFilter", "windowsFilter"
    ];
  
    filters.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", filterCars);
    });
  
    // Filtering function
    function filterCars() {
      const carType = document.getElementById("carTypeFilter").value;
      const fuelType = document.getElementById("fuelTypeFilter").value;
      const availability = document.getElementById("availabilityFilter").value;
      const gearbox = document.getElementById("gearboxFilter").value;
      const passengers = document.getElementById("passengersFilter").value;
      const doors = document.getElementById("doorsFilter").value;
      const hasAC = document.getElementById("acFilter").value;
      const electricWindows = document.getElementById("windowsFilter").value;
  
      const carBoxes = document.querySelectorAll(".car-box");
  
      carBoxes.forEach(carBox => {
        const typeMatch = carType === "all" || carBox.getAttribute("data-type") === carType;
        const fuelMatch = fuelType === "all" || carBox.getAttribute("data-fuel") === fuelType;
        const availabilityMatch = availability === "all" || carBox.getAttribute("data-available") === availability;
        const gearboxMatch = gearbox === "all" || carBox.getAttribute("data-gearbox") === gearbox;
        const passengerMatch = passengers === "all" || carBox.getAttribute("data-passengers") === passengers;
        const doorsMatch = doors === "all" || carBox.getAttribute("data-doors") === doors;
        const acMatch = hasAC === "all" || carBox.getAttribute("data-ac") === hasAC;
        const windowsMatch = electricWindows === "all" || carBox.getAttribute("data-electricwindows") === electricWindows;
  
        if (
          typeMatch && fuelMatch && availabilityMatch &&
          gearboxMatch && passengerMatch && doorsMatch &&
          acMatch && windowsMatch
        ) {
          carBox.style.display = "block";
        } else {
          carBox.style.display = "none";
        }
      });
    }
  });
  