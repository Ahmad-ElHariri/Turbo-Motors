window.addEventListener("DOMContentLoaded", () => {
    const selectedCars = JSON.parse(localStorage.getItem("selectedCars") || "[]");
    const allCarData = {};
    function getCookie(key) {
        const cookies = document.cookie.split("; ");
        for (const cookie of cookies) {
            const [k, v] = cookie.split("=");
            if (k === key) return decodeURIComponent(v);
        }
        return null;
    }
    
    const reservation = {
        pickupLocation: getCookie("pickupLocation"),
        dropoffLocation: getCookie("dropoffLocation"),
        pickupDateTime: `${getCookie("pickupDate")}T${getCookie("pickupTime")}`,
        dropoffDateTime: `${getCookie("dropoffDate")}T${getCookie("dropoffTime")}`
    };
    

    const toggleBtn = document.getElementById("toggleSummaryBtn");
    const summaryBox = document.querySelector(".booking-summary");

    // Add booking instructions
    const summaryHeader = document.querySelector(".booking-summary h3");
    const info = document.createElement("p");
    info.innerText = "Note: Car rental is charged hourly, with a minimum of 1 full day (24 hours). Your total is based on duration and daily car rates.";
    info.style.fontSize = "0.9em";
    info.style.marginTop = "10px";
    summaryHeader.after(info);

    document.querySelectorAll(".choose-btn").forEach(button => {
        const carId = button.getAttribute("data-car-id");
        const carBox = button.closest(".car-box");
        const brandModel = carBox.querySelector(".car-name").innerText.trim();
        const price = parseFloat(carBox.querySelector(".car-price").innerText.replace("$", ""));

        allCarData[carId] = {
            name: brandModel,
            price: price
        };

        if (selectedCars.includes(carId)) {
            button.innerText = "Selected ✅";
            button.disabled = true;
        }

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

    window.removeCar = function (carId) {
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
    };

    function calculateDurationHours(startStr, endStr) {
        if (!startStr || !endStr) return 24; // fallback if missing
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 24;
        const duration = (end - start) / (1000 * 60 * 60); // in hours
        return Math.max(24, duration); // enforce minimum of 1 day
    }

    function updateSummary() {
        const list = document.getElementById("selectedCarsList");
        const priceSpan = document.getElementById("totalPrice");

        list.innerHTML = "";
        let total = 0;

        const duration = calculateDurationHours(reservation.pickupDateTime, reservation.dropoffDateTime);

        selectedCars.forEach(id => {
            const car = allCarData[id];
            if (car) {
                const li = document.createElement("li");
                const perHourRate = car.price / 24;
                const cost = perHourRate * duration;
                total += cost;

                li.textContent = `${car.name} - $${car.price}/day → $${cost.toFixed(2)}`;
                list.appendChild(li);
            }
        });

        priceSpan.innerText = total.toFixed(2);
    }

    toggleBtn.addEventListener("click", () => {
        summaryBox.classList.toggle("hidden");
        toggleBtn.textContent = summaryBox.classList.contains("hidden")
            ? "Show Summary"
            : "Hide Summary";
    });

    updateSummary();
});
