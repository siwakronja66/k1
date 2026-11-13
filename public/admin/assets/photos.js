// Admin Photo Management: In-page Lightbox preview & Edit modal (CSP compliant, no inline scripts)
(() => {
    // --- LIGHTBOX PREVIEW ---
    const lightbox = document.getElementById('photo-lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxMeta = document.getElementById('lightbox-meta');
    const lightboxClose = document.getElementById('lightbox-close-btn');

    function openLightbox(src, title, meta) {
        if (!lightbox || !lightboxImg) return;
        if (!src) return;
        lightboxImg.src = src;
        if (lightboxTitle) lightboxTitle.textContent = title || 'ภาพตัวอย่าง';
        if (lightboxMeta) {
            lightboxMeta.textContent = meta || '';
            lightboxMeta.className = 'text-xs text-slate-400 mt-0.5';
        }
        lightbox.classList.add('is-open');
        document.body.classList.add('overflow-hidden');
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        if (lightboxImg) lightboxImg.src = '';
        document.body.classList.remove('overflow-hidden');
    }

    if (lightboxImg) {
        lightboxImg.onerror = () => {
            if (lightboxMeta) {
                lightboxMeta.textContent = 'ไม่สามารถโหลดไฟล์รูปภาพได้';
                lightboxMeta.className = 'text-xs text-rose-400 mt-0.5 font-bold';
            }
        };
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Delegate click for all preview triggers
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-preview-src]');
        if (trigger) {
            const src = trigger.dataset.previewSrc;
            if (!src) return;
            e.preventDefault();
            const title = trigger.dataset.previewTitle || '';
            const meta = trigger.dataset.previewMeta || '';
            openLightbox(src, title, meta);
        }
    });

    // --- EDIT MODAL ---
    const editModal = document.getElementById('photo-edit-modal');
    const editClose = document.getElementById('edit-modal-close-btn');
    const editCancel = document.getElementById('edit-modal-cancel-btn');

    const editId = document.getElementById('edit-id');
    const editTitle = document.getElementById('edit-title');
    const editTitleEn = document.getElementById('edit-title-en');
    const editRoom = document.getElementById('edit-room-id');
    const editCategory = document.getElementById('edit-category');
    const editFileName = document.getElementById('edit-filename-display');

    function openEditModal(data) {
        if (!editModal) return;
        if (editId) editId.value = data.id || '';
        if (editTitle) editTitle.value = data.title || '';
        if (editTitleEn) editTitleEn.value = data.title_en || '';
        if (editRoom) editRoom.value = data.room_id || '';
        if (editCategory) editCategory.value = data.category || 'spot';
        if (editFileName) editFileName.textContent = data.file_name || '';

        editModal.classList.add('is-open');
        document.body.classList.add('overflow-hidden');
        if (editTitle) editTitle.focus();
    }

    function closeEditModal() {
        if (!editModal) return;
        editModal.classList.remove('is-open');
        document.body.classList.remove('overflow-hidden');
    }

    if (editClose) editClose.addEventListener('click', closeEditModal);
    if (editCancel) editCancel.addEventListener('click', closeEditModal);
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeEditModal();
        });
    }

    document.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-edit-photo]');
        if (editBtn) {
            e.preventDefault();
            try {
                const data = JSON.parse(editBtn.dataset.editPhoto);
                openEditModal(data);
            } catch (err) {
                console.error('Invalid photo edit data', err);
            }
        }
    });

    // ESC key closes any open modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeEditModal();
        }
    });
})();
