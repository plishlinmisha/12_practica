document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.getElementById('artifact-title');
    const categoryInput = document.getElementById('artifact-category');
    const imageInput = document.getElementById('artifact-image');
    const addBtn = document.getElementById('add-btn');
    const errorMsg = document.getElementById('error-msg');
    
    const gallery = document.getElementById('gallery');
    const searchInput = document.getElementById('search-input');
    const counter = document.getElementById('counter');
    const themeBtn = document.getElementById('theme-btn');
    const categoryTabsContainer = document.getElementById('category-tabs');
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const closeModal = document.getElementById('close-modal');

    let categories = new Set();
    let artifactsCount = 0;
    let artifactList = [];

    function updateCounter(change) {
        artifactsCount += change;
        counter.textContent = `Артефактов: ${artifactsCount}`;
    }

    function createCategoryTab(category) {
        const normalized = category.trim().toLowerCase();
        if (normalized && !categories.has(normalized)) {
            categories.add(normalized);
            const btn = document.createElement('button');
            btn.classList.add('tab-btn');
            btn.textContent = category.trim();
            btn.dataset.category = normalized;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterCards(normalized);
            });
            categoryTabsContainer.appendChild(btn);
        }
    }

    function filterCards(filterValue) {
        document.querySelectorAll('.card').forEach(card => {
            const cardCat = card.dataset.category.toLowerCase();
            const isVisible = filterValue === 'all' || cardCat === filterValue;
            card.style.display = isVisible ? 'flex' : 'none';
        });
    }

    function renderTable() {
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';

        artifactList.forEach(item => {
            const row = document.createElement('tr');
            const imgLink = item.image ? `<a href="${item.image}" target="_blank">Открыть</a>` : '—';
            row.innerHTML = `
                <td>${item.title}</td>
                <td>${item.category}</td>
                <td>${imgLink}</td>
                <td>${item.date}</td>
                <td><button class="table-del-btn" data-id="${item.id}">Удалить</button></td>
            `;
            tbody.appendChild(row);
        });

        // Обработчики для кнопок в таблице
        document.querySelectorAll('.table-del-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                artifactList = artifactList.filter(item => item.id !== id);
                const cardToRemove = document.querySelector(`.card[data-id="${id}"]`);
                if (cardToRemove) {
                    const cat = cardToRemove.dataset.category.toLowerCase();
                    cardToRemove.remove();
                    updateCounter(-1);
                    // Проверка на удаление категории
                    const remaining = document.querySelectorAll(`.card[data-category="${cat}"]`);
                    if (remaining.length === 0) {
                        categories.delete(cat);
                        const tab = document.querySelector(`.tab-btn[data-category="${cat}"]`);
                        if (tab) tab.remove();
                        document.querySelector('.tab-btn[data-category="all"]').click();
                    }
                }
                renderTable();
            });
        });
    }

    // === Обработчики ===

    addBtn.addEventListener('click', () => {
        const title = titleInput.value.trim();
        const category = categoryInput.value.trim();
        const image = imageInput.value.trim();

        if (!title || !category || !image) {
            errorMsg.classList.remove('hidden');
            setTimeout(() => errorMsg.classList.add('hidden'), 3000);
            return;
        }

        const id = Date.now();
        const date = new Date().toLocaleDateString('ru-RU');

        // Добавляем в список
        artifactList.push({ id, title, category, image, date });
        updateCounter(1);
        createCategoryTab(category);
        renderTable();

        // Создаём карточку
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.id = id;
        card.dataset.category = category;

        card.innerHTML = `
            <img src="${image}" alt="${title}" class="card-img">
            <div class="card-body">
                <h4>${title}</h4>
                <p>Категория: ${category}</p>
            </div>
            <div class="card-footer">
                <button class="fav-btn" title="В избранное">❤</button>
                <button class="del-btn">Удалить</button>
            </div>
        `;

        card.addEventListener('mouseover', () => card.classList.add('highlight'));
        card.addEventListener('mouseout', () => card.classList.remove('highlight'));

        card.querySelector('.del-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            artifactList = artifactList.filter(item => item.id !== id);
            const cat = card.dataset.category.toLowerCase();
            card.remove();
            updateCounter(-1);
            const remaining = document.querySelectorAll(`.card[data-category="${cat}"]`);
            if (remaining.length === 0) {
                categories.delete(cat);
                const tab = document.querySelector(`.tab-btn[data-category="${cat}"]`);
                if (tab) tab.remove();
                document.querySelector('.tab-btn[data-category="all"]').click();
            }
            renderTable();
        });

        card.querySelector('.fav-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            e.target.classList.toggle('active');
        });

        card.querySelector('.card-img').addEventListener('click', () => {
            modalImg.src = image;
            modalTitle.textContent = title;
            modalCategory.textContent = `Категория: ${category}`;
            modal.classList.remove('hidden');
        });

        gallery.appendChild(card);

        // Очистка полей
        titleInput.value = '';
        categoryInput.value = '';
        imageInput.value = '';
        errorMsg.classList.add('hidden');
    });

    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        document.querySelectorAll('.card').forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            card.style.display = title.includes(term) ? 'flex' : 'none';
        });
    });

    document.querySelector('[data-category="all"]').addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        filterCards('all');
    });

    document.getElementById('show-favorites').addEventListener('click', () => {
        document.querySelectorAll('.card').forEach(card => {
            const isFav = card.querySelector('.fav-btn').classList.contains('active');
            card.style.display = isFav ? 'flex' : 'none';
        });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });
});