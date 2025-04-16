window.addEventListener("DOMContentLoaded", () => {
    // Get selected extras from localStorage or cookies
    function getSelectedExtras() {
        const local = localStorage.getItem("selectedExtras");
        if (local) return JSON.parse(local);

        const cookies = document.cookie.split("; ");
        const cookieObj = {};
        cookies.forEach(c => {
            const [k, v] = c.split("=");
            cookieObj[k] = v;
        });

        try {
            return JSON.parse(decodeURIComponent(cookieObj.selectedExtras || "{}"));
        } catch (e) {
            return {};
        }
    }

    const selected = getSelectedExtras();

    const prices = {
        chauffeur: 50,
        babySeat: 20,
        navigator: 15,
        gps: 10,
        insurance: {
            full: 30,
            tires: 20,
            additionalDriver: 25
        },
        fuel: {
            prepaid: 60,
            payOnReturn: 70
        }
    };

    // Toggle extras button
    document.querySelectorAll(".add-toggle").forEach(btn => {
        const name = btn.dataset.name;

        if (selected[name]) {
            btn.textContent = "ADDED ✅";
        }

        btn.addEventListener("click", () => {
            if (selected[name]) {
                delete selected[name];
                btn.textContent = "ADD";
            } else {
                selected[name] = true;
                btn.textContent = "ADDED ✅";
            }
            saveExtras();
            updateSummary();
        });
    });

    // Dropdown listeners
    const insuranceSelect = document.querySelector('select[name="insurance"]');
    const fuelSelect = document.querySelector('select[name="fuel"]');

    insuranceSelect.value = selected.insurance || "";
    fuelSelect.value = selected.fuel || "";

    insuranceSelect.addEventListener("change", e => {
        selected.insurance = e.target.value;
        saveExtras();
        updateSummary();
    });

    fuelSelect.addEventListener("change", e => {
        selected.fuel = e.target.value;
        saveExtras();
        updateSummary();
    });

    // Save to storage + cookie
    function saveExtras() {
        const encoded = encodeURIComponent(JSON.stringify(selected));
        localStorage.setItem("selectedExtras", JSON.stringify(selected));
        document.cookie = `selectedExtras=${encoded}; path=/`;
    }

    // On form submit
    document.getElementById("extrasForm").addEventListener("submit", function () {
        document.getElementById("selectedExtras").value = JSON.stringify(selected);
        saveExtras();
    });

    // Calculate extras total
    function calculateExtrasTotal() {
        let total = 0;

        for (let key in selected) {
            if (!selected[key]) continue;

            if (["insurance", "fuel"].includes(key)) {
                const value = selected[key];
                if (value && prices[key][value]) {
                    total += prices[key][value];
                }
            } else {
                total += prices[key];
            }
        }

        return total;
    }

    // Show extras in summary box
    function updateSummary() {
        const extrasList = document.getElementById("extrasList");
        extrasList.innerHTML = "";

        for (let key in selected) {
            if (!selected[key]) continue;

            let label = key.charAt(0).toUpperCase() + key.slice(1);
            let text = "";

            if (["insurance", "fuel"].includes(key)) {
                const value = selected[key];
                if (value && prices[key][value]) {
                    text = `${label} - ${value.charAt(0).toUpperCase() + value.slice(1)}: $${prices[key][value]}`;
                }
            } else {
                text = `${label} - $${prices[key]}`;
            }

            const li = document.createElement("li");
            li.textContent = text;
            extrasList.appendChild(li);
        }

        updateCarSummary(); // Also updates total
    }

    // Fetch car details and update car list and total price
    function updateCarSummary() {
        const selectedCarIds = JSON.parse(localStorage.getItem("selectedCars") || "[]");
        const carList = document.getElementById("selectedCarsList");
        const priceSpan = document.getElementById("totalPrice");

        if (!carList || !priceSpan) return;

        carList.innerHTML = "";

        let carTotal = 0;

        const promises = selectedCarIds.map(carId => {
            return fetch(`/car/${carId}`)
                .then(res => res.json())
                .then(car => {
                    const li = document.createElement("li");
                    li.textContent = `${car.brand} ${car.model} - $${car.pricePerDay}/day`;
                    carList.appendChild(li);
                    carTotal += car.pricePerDay;
                })
                .catch(err => {
                    const li = document.createElement("li");
                    li.textContent = `Car ID: ${carId} (Error loading details)`;
                    carList.appendChild(li);
                });
        });

        Promise.all(promises).then(() => {
            const extrasTotal = calculateExtrasTotal();
            const grandTotal = carTotal + extrasTotal;
            priceSpan.innerText = grandTotal.toFixed(2);
        });
    }

    // Initial render
    updateSummary();

    const toggleBtn = document.getElementById("toggleSummaryBtn");
    const summaryBox = document.querySelector(".booking-summary");
    
    toggleBtn.addEventListener("click", () => {
        summaryBox.classList.toggle("hidden");
    
        toggleBtn.textContent = summaryBox.classList.contains("hidden")
            ? "Show Summary"
            : "Hide Summary";
    }); 
});
