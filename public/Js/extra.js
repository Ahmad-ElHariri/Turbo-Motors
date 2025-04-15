
const selected = {};

document.querySelectorAll('.add-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        selected[name] = true;
        btn.textContent = 'ADDED ✅';
        btn.disabled = true;
    });
});

document.querySelectorAll('.qty-box').forEach(box => {
    const input = box.querySelector('input');
    const decrease = box.querySelector('.decrease');
    const increase = box.querySelector('.increase');

    decrease.addEventListener('click', () => {
        let val = parseInt(input.value);
        if (val > 0) input.value = val - 1;
    });

    increase.addEventListener('click', () => {
        let val = parseInt(input.value);
        input.value = val + 1;
    });
});

document.getElementById("extrasForm").addEventListener("submit", function (e) {
    selected.babySeat = document.querySelector('input[name="babySeat"]').value;
    selected.insurance = document.querySelector('select[name="insurance"]').value;
    selected.fuel = document.querySelector('select[name="fuel"]').value;
    document.getElementById("selectedExtras").value = JSON.stringify(selected);
});