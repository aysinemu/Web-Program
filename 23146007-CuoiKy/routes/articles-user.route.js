import express from 'express'
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import articlesService from '../services/articles.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/detail',async function (req,res) {
    const id = parseInt(req.query.id) || 0;
    const list = await articlesService.findById(id);
    if(!list){
        return res.redirect('/');
    }
    res.render('vwArticles/detail', {
        articles: list
    });
});

router.get('/editor', function (req,res) {
    res.render('vwArticles/editor'); 
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) { //"E:\HTML\WebProgram\CuoiKy"
      const tempDir = path.join('E:', 'HTML', 'WebProgram', 'CuoiKy', 'static', 'imgs', 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true }); 
      }
      cb(null, tempDir); 
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); 
    }
  });
  
  const upload = multer({ storage });
  
  router.post('/editor', upload.array('fuMain', 5), async function (req, res) {
    try {
      const entity = {
        id : req.body.id,
        title : req.body.title,
        author : req.body.author,
        abstract : req.body.abstract,
        content : req.body.content,
        is_premium : req.body.is_premium,
        category_id : req.body.category_id,
      };
  
      const ret = await articlesService.add(entity); 
      console.log('Database response:', ret); 
  
      if (!Array.isArray(ret) || ret.length === 0) {
        console.error('id không có trong phản hồi:', ret);
        return res.status(400).send('id không hợp lệ');
      }
  
      const id = ret[0];  
      console.log('id:', id); 
  
      const proDir = path.join('E:', 'HTML', 'WebProgram', 'CuoiKy', 'static', 'imgs', 'sp', id.toString());
      if (!fs.existsSync(proDir)) {
        fs.mkdirSync(proDir, { recursive: true }); 
      }
  
      req.files.forEach(file => {
        const tempPath = path.join('E:', 'HTML', 'WebProgram', 'CuoiKy', 'static', 'imgs', 'temp', file.filename);
        const targetPath = path.join(proDir, 'main.jpg'); 
        sharp(tempPath)
          .resize(400, 300)  
          .toFile(targetPath, (err, info) => {
            if (err) {
              console.error('Error resizing the image:', err);
              throw err;
            }
            console.log(`File resized and moved to ${targetPath}`, info);
            fs.unlink(tempPath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Error removing temporary file:', unlinkErr);
              }
            });
          });
      });
  
      res.render('vwArticles/editor', { message: 'Upload và lưu thành công!' });
    } catch (err) {
      console.error('Error:', err);
      res.status(500).send('Có lỗi xảy ra.');
    }
});

export default router 