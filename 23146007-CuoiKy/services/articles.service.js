import db from '../utils/db.js';

export default {
    findAll(){
        return db('articles');
    },
    findById(id){
        return db('articles').where('id', id).first();
    },
    add(entity){
        return db('articles').insert(entity);
    },
}