import express from 'express';
import {dirname, format} from 'path'
import {fileURLToPath} from 'url'
import {engine} from 'express-handlebars';
import articlesRouter from './routes/articles.route.js'
import articlesUserRouter from './routes/articles-user.route.js'
import numeral from 'numeral';
import hbs_section from'express-handlebars-sections'
import session from 'express-session';
import Handlebars from 'handlebars';
import articlesService from './services/articles.service.js';

const app = express();
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'SECRET_KEY',
  resave: false,
  saveUninitialized: true,
  cookie: { }
}))

app.engine('hbs', engine({
    extname: 'hbs',
    helpers: {
        format_number(value){
            return numeral(value).format('0,0') + ' VND';
        },
        fillHtmlContent: hbs_section()
    }
}));
app.set('view engine', 'hbs');
app.set('views', './views');

app.use('/static',express.static('static'));

app.use(async function(req,res,next){
    const list = await articlesService.findAll();
    res.locals.lcArticles = list;
    next();
});

app.use(express.urlencoded({
    extended: true
}))

Handlebars.registerHelper('eq', function(a, b) {
    return a === b; 
});

Handlebars.registerHelper("or", function (a, b) {
    return a || b;
  });

Handlebars.registerHelper('array', function (...args) {
    return args.slice(0, -1);
});


Handlebars.registerHelper('inArray', function (value, array) {
    return array.includes(value);
});

Handlebars.registerHelper('and', function (a, b) {
    return a && b;
});

app.use('/articles',articlesUserRouter);

app.get('/', async function (req, res) {
    const list = await articlesService.findAll();
    res.render('vwArticles/list', {
        articles: list
    });
});

app.listen(3000, function (){console.log('Server started on http://localhost:3000');});

const __dirname = dirname(fileURLToPath(import.meta.url));
