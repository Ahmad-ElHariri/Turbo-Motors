const selected = {};

// Handle toggle buttons
document.querySelectorAll('.add-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        selected[name] = true;
        btn.textContent = 'ADDED ✅';
        btn.disabled = true;
    });
});

// Handle form submission
document.getElementById("extrasForm").addEventListener("submit", function () {
    // Add dropdowns to the selected object
    const insurance = document.querySelector('select[name="insurance"]').value;
    const fuel = document.querySelector('select[name="fuel"]').value;

    if (insurance) selected.insurance = insurance;
    if (fuel) selected.fuel = fuel;

    document.getElementById("selectedExtras").value = JSON.stringify(selected);
});
