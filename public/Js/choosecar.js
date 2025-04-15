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



