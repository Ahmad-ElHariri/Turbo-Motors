const selectedCars = [];

// Handle choosing a car
document.querySelectorAll(".choose-btn").forEach(button => {
    button.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent form redirect if any

        const carId = button.getAttribute("data-car-id");

        if (!selectedCars.includes(carId)) {
            selectedCars.push(carId);
            button.innerText = "Selected ✅"; // Optional UI feedback
            button.disabled = true;
        }
    });
});

// Before submitting, set the hidden input value to the array
document.getElementById("selectedCarsForm").addEventListener("submit", (e) => {
    document.getElementById("selectedCarsInput").value = JSON.stringify(selectedCars);
});

const removeCar = (carId) => {
    const carGrid = document.querySelector('.car-grid');
    const carBox = document.querySelector(`[data-car-id="${carId}"]`);
    if (carBox) carGrid.removeChild(carBox);

    // Update cookie (if you're using cookies to store car selection)
    const selected = JSON.parse(localStorage.getItem('selectedCars') || '[]');
    const filtered = selected.filter(id => id !== carId);
    localStorage.setItem('selectedCars', JSON.stringify(filtered));
    document.cookie = "selectedCars=" + JSON.stringify(filtered) + "; path=/";
};