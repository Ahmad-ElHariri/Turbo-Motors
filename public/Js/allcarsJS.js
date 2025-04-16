document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');

  const filters = [
      "carTypeFilter", "fuelTypeFilter", "gearboxFilter",
      "passengersFilter", "doorsFilter", "acFilter", "windowsFilter"
  ];

  const carBoxes = document.querySelectorAll(".car-box");

  // Attach change events to available filters
  filters.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
          el.addEventListener("change", filterCars);
      }
  });

  function filterCars() {
      const carType = getVal("carTypeFilter");
      const fuelType = getVal("fuelTypeFilter");
      const gearbox = getVal("gearboxFilter");
      const passengers = getVal("passengersFilter");
      const doors = getVal("doorsFilter");
      const hasAC = getVal("acFilter");
      const electricWindows = getVal("windowsFilter");

      carBoxes.forEach(carBox => {
          const typeMatch = carType === "all" || carBox.getAttribute("data-type") === carType;
          const fuelMatch = fuelType === "all" || carBox.getAttribute("data-fuel") === fuelType;
          const gearboxMatch = gearbox === "all" || carBox.getAttribute("data-gearbox") === gearbox;
          const passengerMatch = passengers === "all" || carBox.getAttribute("data-passengers") === passengers;
          const doorsMatch = doors === "all" || carBox.getAttribute("data-doors") === doors;
          const acMatch = hasAC === "all" || carBox.getAttribute("data-ac") === hasAC;
          const windowsMatch = electricWindows === "all" || carBox.getAttribute("data-electricwindows") === electricWindows;

          if (
              typeMatch && fuelMatch && gearboxMatch &&
              passengerMatch && doorsMatch && acMatch && windowsMatch
          ) {
              carBox.style.display = "block";
          } else {
              carBox.style.display = "none";
          }
      });
  }

  // Helper to safely get value of filter or fallback to "all"
  function getVal(id) {
      const el = document.getElementById(id);
      return el ? el.value : "all";
  }
});
