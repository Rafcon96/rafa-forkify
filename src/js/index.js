import { elements, renderLoader, clearLoader } from './view/base';
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './view/searchView';
import * as recipeView from './view/recipeView';
import * as listView from './view/listView';
import * as likesView from './view/likesView';


/**Global state of the App
 * Search object
 * Current recipe object
 * shopping liist object
 * Liked recipe 
 */

 const state = {};
 

 
//**************** */ Search controller ******************//

const controlSearch = async () => {
    // 1 get query from view 
    const query = searchView.getInput();
    
    //console.log(query);

    if(query) {
        //2 new search object and add to state
        state.search = new Search(query);
        //3 preper UI from results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
       try {
            //4 Search for recipes
            await state.search.getResults();
            //5 Render result on Ui 
            clearLoader();
            searchView.renderResults(state.search.result); 

       } catch (err) {
           clearLoader();
       }
        
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

// //testing
// window.addEventListener('load', e => {
//     e.preventDefault();
//     controlSearch();
// });

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults(); 
        searchView.renderResults(state.search.result, goToPage);
    }
});

//*********** */ Recipe controller *****************//

const controlRecipe = async () => {
    // Get id from url
    const id = window.location.hash.replace('#', '');  // we want id without # bc it is #1234
   

    if (id) { 
        // prepare UI for change
        recipeView.clearRecipe();
        renderLoader(elements.recipe)
        //highlight selected search item 
        if (state.search) searchView.highlightSelected(id)
        // Create new recipe object 
        state.recipe = new Recipe(id);

        //TESTING
        // window.r = state.recipe;
        try {
            // Get recipe data and parsIngradients
        await state.recipe.getRecipe();
        state.recipe.pasrseIngredients();
        //Calculate serving and time 
        state.recipe.calcTime();
        state.recipe.calcServings();
        //Render recipe 
        clearLoader();
        recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
            );
        } catch (err) {
            alert ('ERR processing recipe!')
            clearLoader();
        }
        
        
    }
};

//window.addEventListener('hashchange', controlRecipe);
//window.addEventListener('load', controlRecipe);
//    the same    //
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe ));

/** 
 * LIST CONTROLLER
 */
const controlList = () => {
    // Create a new list IF there in none yet
    if (!state.list) state.list = new List();

    // Add each ingredient to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    // Handle the delete button
    if (e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

    // Handle the count update
    } else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});

/** 
 * LIKE CONTROLLER
 */

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to UI list
        likesView.renderLike(newLike);

    // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID);
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();
    
    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Restore liked resipes on page load:
window.addEventListener('load', () => {
state.likes = new Likes();

// Restore likes:
state.likes.readStorage();

// Toggle likes menu button:
likesView.toggleLikeMenu(state.likes.getNumLikes());

//Render the existing likes:
state.likes.likes.forEach(like => likesView.renderLike(like));
});



// handeling recipe button clicks:
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        // Decrease button is clicked:
        if (state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
        
    } else if (e.target.matches('.btn-increase, .btn-increase *')){
        // Incrrease button is clicked:
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }
});
