import axios from 'axios';

export default class Recipe {
    constructor(id){
        this.id = id
    }
    async getRecipe(){
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            const {title, publisher: author, image_url: img, source_url: url, ingredients} = res.data.recipe;
            this.title = title;
            this.author = author;
            this.img = img;
            this.url = url;
            this.ingredients = ingredients; 
        } catch (error) {
            console.log(error);    
            alert('somthing went wrong...):')
        }
    }
    calcTime() {
        //assuming that we need 15 min for each ingredients...
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15; 
    }

    calcServings() {
        this.servings = 4;
    }

    pasrseIngredients() {
        
        const unitLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitShort, 'kg', 'g']
       const newIngredients = this.ingredients.map(el => {
        //1.uniform units
        let ingredient = el.toLowerCase();
        unitLong.forEach((unit, i) => {
            ingredient = ingredient.replace(unit, unitShort[i]);
        });
        //2. remove parentheses
        ingredient = ingredient.replace(/ *\([^)]*\) */g,' ');
        //3. parse ingredients into count, unit and ingredient
        const arrIng = ingredient.split(' ');
        const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

        let objIng;
        if (unitIndex > -1) {
            // There is a unit
            // Ex. 4 1/2 cups, arrCount is [4, 1/2] --> eval("4+1/2") --> 4.5
            // Ex. 4 cups, arrCount is [4]
            const arrCount = arrIng.slice(0, unitIndex);
            
            let count;
            if (arrCount.length === 1) {
                count = eval(arrIng[0].replace('-', '+'));
            } else {
                count = eval(arrIng.slice(0, unitIndex).join('+'));
            }

            objIng = {
                count,
                unit: arrIng[unitIndex],
                ingredient: arrIng.slice(unitIndex + 1).join(' ')
            };

        } else if (parseInt(arrIng[0], 10)) {
            // There is NO unit, but 1st element is number
            objIng = {
                count: parseInt(arrIng[0], 10),
                unit: '',
                ingredient: arrIng.slice(1).join(' ')
            }
        } else if (unitIndex === -1) {
            // There is NO unit and NO number in 1st position
            objIng = {
                count: 1,
                unit: '',
                ingredient
            }
        }


        return objIng;
       }); 
       this.ingredients = newIngredients; 
    }
    updateServings (type) {
        //servings
        const newServings = type ==='dec' ? this.servings - 1 : this.servings +1;
        //ingredients
        this.ingredients.forEach(ing =>{
            ing.count *= (newServings / this.servings);
        });
        this.servings = newServings;
    }

}
