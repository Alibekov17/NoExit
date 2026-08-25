const api_url = "https://www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata"


// DOM
const drinksdiv = document.querySelector(".drinks");
// asynchronous 
const fetchCocktails = async () => {
    const response = await fetch(api_url);
    const data = await response.json();
    console.log(data);
    showCocktails(data.drinks)
}

fetchCocktails();


function showCocktails (list) {
    for (const drink of list) {
    drinksdiv.innerHTML += `<div>
    <img src="${drink.strDrinkThumb}" alt="" />
    <br>
    <a href="details.html?id=${drink.idDrink}">${drink.strDrink}</a>
    </div>`


}
} 
