const express = require('express');
const router = express.Router();
const userViewModel = require('../ViewModel/UserViewModel');
const methodOverride = require('method-override');
const upload = require('../Helper/file');

//es para poder utilizar put, delete, etc. y no solamente usar post y get
//si no se utiliza esto y se llama a un put o delete, va mostrar error
router.use(methodOverride('_method'));

//poder utilizar delte sin un form y solamente con link
router.use((req, res, next) => {
    //req.query: en la url se va obtener una peticion
    //de esta peticion si es "delete"
    if(req.query._method == 'DELETE') {
        req.method = 'DELETE';
        req.url = req.path;
    }
    next();
});

router.get('/list', (req, res) => {
    userViewModel.show(req, res);
});

router.get('/create', (req, res) => {
    res.render('add_user');
});

router.post('/create', upload.single("file"), (req, res) => {
    userViewModel.create(req, res);
});

router.get('/detail/:id', (req, res) => {
    userViewModel.detail(req, res);
});

router.get('/edit/:id', (req, res) => {
    userViewModel.edit(req, res);
});

router.put('/edit/:id', upload.single("file"), (req, res) => {
    userViewModel.update(req, res);
});

router.delete('/delete/:id', (req, res) => {
    userViewModel.delete(req, res);
});

module.exports = router;