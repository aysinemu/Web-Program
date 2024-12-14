import express from 'express'
import articlesService from '../services/articles.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
    const list = await articlesService.findAll();
    res.render('vwArticles/list', {
        articles: list
    });
});

export default router