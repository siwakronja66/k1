// Forms with data-confirm="question" ask before submitting (CSP forbids inline onsubmit).
document.addEventListener('submit', (e) => {
    const form = e.target;
    const q = form instanceof HTMLFormElement ? form.dataset.confirm : null;
    if (q && !window.confirm(q)) e.preventDefault();
});

// Auto-submit selects marked data-autosubmit (e.g. building/floor pickers, room assignment).
document.addEventListener('change', (e) => {
    const el = e.target;
    if (el instanceof HTMLSelectElement && el.dataset.autosubmit !== undefined && el.form) el.form.requestSubmit();
});
