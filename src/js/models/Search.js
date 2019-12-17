import axios from 'axios';

export default class Search {
    constructor(query){
        this.query = query
    }
    async getResults(){
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
            this.result = res.data.recipes;
            //console.log(this.result);
        } catch (error) {
            alert(`ERR You can only search recipes for the terms "pizza", "bacon","pasta" and "broccoli"`);    
        }
    }
}



