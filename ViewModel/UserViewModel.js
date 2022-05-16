require("dotenv").config()
const User = require('../Model/User');
const aws = require('aws-sdk');
const s3 = new aws.S3();

const BUCKET = process.env.BUCKET;

module.exports = {
    show: function(req, res) {
        //la función exec es un promesa por lo tanto no necesitas de await y async
        //solamente en este caso
        User.find().exec((err, users) => {
            //si hay error mostrar mensaje
            if(err) {
                res.json({message: err.message});
            } else { //si no hay error entonces mostrar datos
                res.render('list_user', {users: users});
            }
        })
    },     //esta es una manera de acortar funciones
    detail: (req, res) => {
        //obtener el id
        let id = req.params.id;
        User.findById(id, (err, user) => {
            if(err) {
                res.redirect('/users/list');
            } else {
                if(user == null) {
                    res.redirect('/users/list');
                } else {
                    res.render('detail_user', {user: user})
                }
            }
        });
    },
    edit: (req, res) => {
        let id = req.params.id;
        User.findById(id, (err, user) => {
            if(err) {
                res.redirect('/users/list');
            } else {
                if(user == null) {
                    res.redirect('/users/list');
                } else {
                    res.render('edit_user', {user: user})
                }
            }
        });
    },
    create: async (req, res) => {
        console.log(req.body);
        try {
            const user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                birth: req.body.birth,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
                description: req.body.description,
                photoUser: req.file.location
            });
            
            console.log(user);

            await user.save((err) => {
                if(err) {
                    res.json({ message: err, type: 'Danger'});
                } else {
                    req.session.message = {
                        type: 'success',
                        message: 'User has been added successfully'
                    };
                    res.redirect('/users/list');
                }
            })
        } catch(err) {
            console.log(err);
            res.redirect('/users/list');
        }
    },
    update: async (req, res) => {
        const id = req.params.id;
        let new_img = '';

        if (req.file) {
            new_img = req.file.location
            try {
                let params = { Bucket: BUCKET, Key: req.old_img.filename }
                console.log('params: ' + params)
                await s3.deleteObject(params).promise();
            } catch(err) {
                console.log(err);
            }
        } else {
            new_img = req.body.old_img;
        }

        const newUser = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            birth: req.body.birth,
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            description: req.body.description,
            photoUser: new_img
        };

        User.findByIdAndUpdate(id, newUser, (err, result) => {
            if(err) {
                res.json({ message: err.message, type: 'danger' });
            } else {
                req.session.message = { type: 'success', message: 'User has been updated successfully'};
                res.redirect('/users/list');
            }
        });
    },
    delete: (req, res) => {
        let id = req.params.id;
        User.findByIdAndDelete(id, async (err, result) => {
            if (result.photoUser != '') {
                try {
                    await s3.deleteObject({ Bucket: BUCKET, Key: result.photoUser }).promise();
                } catch (err) {
                    console.log(err);
                }
            }

            if(err) {
                res.json({ message: err.message });
            } else {
                req.params.message = { type: 'success', message: 'User has been deleted successfully'};
                res.redirect('/users/list');
            }
        })
    }
}