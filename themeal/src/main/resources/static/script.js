const API_BASE = '/api';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const randomBtn = document.getElementById('randomBtn');
const categoryNav = document.getElementById('categoryNav');
const resultsGrid = document.getElementById('resultsGrid');
const modal = document.getElementById('recipeModal');
const modalBody = document.getElementById('modalBody');
const closeModal = document.querySelector('.close-modal');

// Init
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
});

// Event Listeners
searchBtn.addEventListener('click', () => doSearch());
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doSearch();
});
randomBtn.addEventListener('click', fetchRandomMeal);
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Logic
async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const data = await res.json();
        renderCategories(data.categories);
    } catch (err) {
        console.error('Failed to load categories', err);
        categoryNav.innerHTML = '<div class="error">Failed to load categories</div>';
    }
}

function renderCategories(categories) {
    categoryNav.innerHTML = categories.map(cat => `
        <div class="cat-pill" onclick="filterByCategory('${cat.strCategory}')">
            ${cat.strCategory}
        </div>
    `).join('');
}

async function doSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    setLoading();
    try {
        const res = await fetch(`${API_BASE}/search?q=${query}`);
        const data = await res.json();
        renderGrid(data.meals);
    } catch (err) {
        console.error(err);
        setError('Failed to search meals.');
    }
}

async function filterByCategory(category) {
    setLoading();
    // Highlight active
    document.querySelectorAll('.cat-pill').forEach(el => {
        el.classList.toggle('active', el.innerText.trim() === category);
    });

    try {
        const res = await fetch(`${API_BASE}/category/${category}`);
        const data = await res.json();
        renderGrid(data.meals);
    } catch (err) {
        console.error(err);
        setError('Failed to load category.');
    }
}

async function fetchRandomMeal() {
    try {
        const res = await fetch(`${API_BASE}/random`);
        const data = await res.json();
        const meal = data.meals[0];
        showMealDetails(meal.idMeal);
    } catch (err) {
        console.error(err);
    }
}

function renderGrid(meals) {
    if (!meals) {
        resultsGrid.innerHTML = '<div class="welcome-message">No meals found. Try another search.</div>';
        return;
    }

    resultsGrid.innerHTML = meals.map(meal => `
        <div class="meal-card" onclick="showMealDetails('${meal.idMeal}')">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" loading="lazy">
            <div class="meal-info">
                <h3>${meal.strMeal}</h3>
                <p>Click to view recipe</p>
            </div>
        </div>
    `).join('');
}

async function showMealDetails(id) {
    try {
        const res = await fetch(`${API_BASE}/meal/${id}`);
        const data = await res.json();
        const meal = data.meals[0];
        renderModal(meal);
        modal.style.display = 'block';
    } catch (err) {
        console.error(err);
    }
}

function renderModal(meal) {
    let ingredientsHtml = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredientsHtml += `<tr><td>${ingredient}</td><td>${measure}</td></tr>`;
        }
    }

    let youtubeEmbed = '';
    if (meal.strYoutube) {
        const videoId = meal.strYoutube.split('v=')[1];
        if (videoId) {
            youtubeEmbed = `
                <h3>Video Tutorial</h3>
                <div class="video-container">
                    <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                </div>
            `;
        }
    }

    modalBody.innerHTML = `
        <img src="${meal.strMealThumb}" class="modal-header-img">
        <h2 class="modal-title">${meal.strMeal}</h2>
        <div class="modal-meta">
            <span>${meal.strCategory}</span>
            <span>•</span>
            <span>${meal.strArea}</span>
        </div>
        
        <h3>Ingredients</h3>
        <table class="ingredients-table">
            <thead>
                <tr>
                    <th>Ingredient</th>
                    <th>Measure</th>
                </tr>
            </thead>
            <tbody>
                ${ingredientsHtml}
            </tbody>
        </table>

        <h3>Instructions</h3>
        <p class="modal-instructions">${meal.strInstructions.replace(/\r\n/g, '<br>')}</p>

        ${youtubeEmbed}
        
        <br><br>
        <a href="${meal.strSource}" target="_blank" style="color:var(--accent)">View Original Source</a>
    `;
}

function setLoading() {
    resultsGrid.innerHTML = '<div class="welcome-message">Loading...</div>';
}

function setError(msg) {
    resultsGrid.innerHTML = `<div class="welcome-message" style="color:#ff6b6b">${msg}</div>`;
}
