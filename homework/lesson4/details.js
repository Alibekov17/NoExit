
// /details.html?id=13501
const params = new URLSearchParams(window.location.search);
const id = params.get('id')
console.log(id);
const api_url = "https://www.themealdb.com/api/json/v1/1/search.php?f=a"

const detailsDiv = document.querySelector(`.details`)

const fetchCocktails = async () => {
    const response= await fetch (api_url + id);
    const data = await response.json();
    console.log(data);
    showDetailedCocktail(data.drinks[0]);
} 

fetchCocktails()

function showDetailedCocktail(drink) {
  // 1. Собираем ингредиенты, так как они идут отдельными свойствами
  let ingredientsHTML = '';

  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];

    // Если ингредиент есть, добавляем в список
    if (ingredient) {
      const ingredientImgUrl = `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(ingredient)}-Small.png`;
      ingredientsHTML += ingredientsHTML += `
        <li class="ingredient-item">
          <img src="${ingredientImgUrl}" alt="${ingredient}" class="ingredient-img" />
          <div class="ingredient-info">
            <span class="ingredient-name">${ingredient}</span>
            <span class="ingredient-measure">${measure ? measure : 'по вкусу'}</span>
          </div>
        </li>
      `;
    }
  }

  // 2. Шаблон для полной карточки коктейля
  detailsDiv.innerHTML = `
    <div class="cocktail-detail-card">
      <div class="cocktail-image-block">
        <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" />
      </div>

      <div class="cocktail-info-block">
        <h1>${drink.strDrink}</h1>
        <p class="category-badge"><span>${drink.strCategory}</span> • <span>${drink.strAlcoholic}</span></p>

        <h3>Ингредиенты:</h3>
        <ul class="ingredients-list">
          ${ingredientsHTML}
        </ul>

        <h3>Инструкция по приготовлению:</h3>
        <p class="instructions">${drink.strInstructions}</p>

        <div class="additional-info">
          <small><strong>Бокал:</strong> ${drink.strGlass}</small>
        </div>
      </div>
    </div>
  `;
}