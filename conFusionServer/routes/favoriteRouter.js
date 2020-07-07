const express = require('express');
const bodyParser = require('body-parser');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router()

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('dishes')
    .populate('user')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite != null) {
            for (let index = 0; index < req.body.length; index++) {
                if(!favorite.dishes.includes(req.body[index]._id)){
                    favorite.dishes.push(req.body[index]);
                }
            }
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);   
                    })          
            }, (err) => next(err));
        }
        else {
           Favorites.create({user: req.user._id, dishes: req.body})
           .then((favorite) => {
                console.log('Favorite list for user Created with dishes');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => { 
    Favorites.findOneAndDelete({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

// -------/:dishId--------------------------------------------------------------

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req,res)=>{res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on favorites/:dishId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        if (favorite != null) {
            if(!favorite.dishes.includes(req.params.dishId)){
                favorite.dishes.push({"_id": req.params.dishId});
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);   
                        })          
                }, (err) => next(err));
            }
            else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end('Dish already exist in user favorite list');
            }
        }
        else {
           Favorites.create({user: req.user._id, dishes: [{"_id": req.params.dishId}]})
           .then((favorite) => {
                console.log('Favorite list for user Created with the dish');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
        console.log(favorite);
        if (favorite != null && favorite.dishes.includes(req.params.dishId)) {
            var index = favorite.dishes.indexOf(req.params.dishId);
            favorite.dishes.splice(index, 1);
            if(favorite.dishes.length===0){
                Favorites.findOneAndDelete({_id: favorite._id})
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end('no dishes in user favorite list');
                }, (err) => next(err))
                .catch((err) => next(err));
            }
            else{
            favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite); 
                }, (err) => next(err));  
            }    
        }
        else if (favorite == null) {
            err = new Error('favorite list not found for user');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error(req.params.dishId + ' not found in favorite dish list');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;

