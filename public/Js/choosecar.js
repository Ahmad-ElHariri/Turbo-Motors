window.addEventListener("DOMContentLoaded", () => {

const selectedCars = JSON.parse(localStorage.getItem("selectedCars") || "[]");
const allCarData = {}; // cache car data (for price & info)
const reservation = JSON.parse(localStorage.getItem("reservationData") || "{}");

const toggleBtn = document.getElementById("toggleSummaryBtn");
const summaryBox = document.querySelector(".booking-summary");

// Cache all car info
document.querySelectorAll(".choose-btn").forEach(button => {
    const carId = button.getAttribute("data-car-id");
    const carBox = button.closest(".car-box");
    const brandModel = carBox.querySelector(".car-name").innerText.trim();
    const price = parseFloat(carBox.querySelector(".car-price").innerText.replace("$", ""));

    allCarData[carId] = {
        name: brandModel,
        price: price
    };

    // Set initial selection state
    if (selectedCars.includes(carId)) {
        button.innerText = "Selected ✅";
        button.disabled = true;
    }

    // On select
    button.addEventListener("click", (e) => {
        e.preventDefault();
        if (!selectedCars.includes(carId)) {
            selectedCars.push(carId);
            localStorage.setItem("selectedCars", JSON.stringify(selectedCars));
            button.innerText = "Selected ✅";
            button.disabled = true;
            updateSummary();
        }
    });
});

document.getElementById("selectedCarsForm").addEventListener("submit", () => {
    document.getElementById("selectedCarsInput").value = JSON.stringify(selectedCars);
});

function removeCar(carId) {
    const index = selectedCars.indexOf(carId);
    if (index > -1) {
        selectedCars.splice(index, 1);
        localStorage.setItem("selectedCars", JSON.stringify(selectedCars));
    }

    const chooseBtn = document.querySelector(`.choose-btn[data-car-id="${carId}"]`);
    if (chooseBtn) {
        chooseBtn.innerText = "Choose";
        chooseBtn.disabled = false;
    }

    updateSummary();
}

function updateSummary() {
    const list = document.getElementById("selectedCarsList");
    const priceSpan = document.getElementById("totalPrice");

    list.innerHTML = "";
    let total = 0;

    selectedCars.forEach(id => {
        const car = allCarData[id];
        if (car) {
            const li = document.createElement("li");
            li.textContent = `${car.name} - $${car.price}/day`;
            list.appendChild(li);
            total += car.price;
        }
    });

    priceSpan.innerText = total.toFixed(2);
}

// Call once on page load
updateSummary();
toggleBtn.addEventListener("click", () => {
    summaryBox.classList.toggle("hidden");

    toggleBtn.textContent = summaryBox.classList.contains("hidden")
        ? "Show Summary"
        : "Hide Summary";
}); 
});