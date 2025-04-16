window.addEventListener("DOMContentLoaded", () => {
    // Get extras from localStorage or cookies
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

    // Price table
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

    // Setup button state and toggle logic
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

    // Setup dropdowns
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

    // On form submit
    document.getElementById("extrasForm").addEventListener("submit", function () {
        document.getElementById("selectedExtras").value = JSON.stringify(selected);
        saveExtras();
    });

    // Save extras to localStorage + cookies
    function saveExtras() {
        const encoded = encodeURIComponent(JSON.stringify(selected));
        localStorage.setItem("selectedExtras", JSON.stringify(selected));
        document.cookie = `selectedExtras=${encoded}; path=/`;
    }

    // Update the summary box
    function updateSummary() {
        const extrasList = document.getElementById("extrasList");
        const priceSpan = document.getElementById("totalPrice");

        extrasList.innerHTML = "";
        let total = 0;

        for (let key in selected) {
            if (!selected[key]) continue;

            let label = key.charAt(0).toUpperCase() + key.slice(1);
            let price = 0;
            let text = "";

            if (["insurance", "fuel"].includes(key)) {
                const value = selected[key];
                if (value && prices[key][value]) {
                    price = prices[key][value];
                    text = `${label} - ${value.charAt(0).toUpperCase() + value.slice(1)}: $${price}`;
                }
            } else {
                price = prices[key];
                text = `${label} - $${price}`;
            }

            if (text) {
                const li = document.createElement("li");
                li.textContent = text;
                extrasList.appendChild(li);
                total += price;
            }
        }

        priceSpan.innerText = total.toFixed(2);
    }

    // Run once on load
    updateSummary();
});
