var models = require('../models');
var Sequelize = require('sequelize');
var url = require('url');

var authenticate = function(login, password){
	return models.User.findOne({where: {username: login}})
		.then(function(user){
			if(user && user.verifyPassword(password)){
				return user;
			} else{
				return null;
			}
		});
};

exports.loginRequired = function(req, res, next){
	if (req.session.user){
		next();
	} else{
		res.redirect('/session?redir=' + (req.param('redir') || req.url));
	}
};

//GET /session --formulario de login
exports.new = function(req, res, next){
	var redir = req.query.redir || url.parse(req.headers.referer || "/").pathname;
	if (redir === '/session' || redir === '/users/new'){ redir = "/"; }
	res.render('session/new', { redir: redir });
};

//POST /session -- Crear sesion
exports.create = function(req, res, next){
	var redir = req.body.redir || '/';
	var login = req.body.login;
	var password = req.body.password;
	//
	var date = new Date();
    var expire = date.getTime() + 120000;
    //
	authenticate(login, password)
		.then(function(user){
			if(user){
				//Crear req.session.user y guardar campos id y username
				//La sesion se define por la existencia de: req.session.user
				req.session.user = {id:user.id, username:user.username, isAdmin:user.isAdmin, expire: expire};
				res.redirect(redir);//redireccion a redir
			} else{
				req.flash('error', 'La autenticación ha fallado. Reinténtelo otra vez.');
				res.redirect("/session?redir="+redir);
			}
		})
		.catch(function(error){
			req.flash('error', 'Se ha producido un error: ' + error);
			next(error);
		});
};

//DELETE /session -- Destruir sesion
exports.destroy = function(req, res, next){
	delete req.session.user;
	res.redirect("/session");//redirect a login
};

exports.adminOrMyselfRequired = function(req, res, next){
	var isAdmin = req.session.user.isAdmin;
	var userId = req.user.id;
	var loggedUserId = req.session.user.id;

	if(isAdmin || userId === loggedUserId){
		next();
	} else{
		console.log('Ruta prohibida: no es el usuario logeado, ni un administrador.');
		res.send(403);
	}
};

exports.adminAndNotMyselfRequired = function(req, res, next){
	var isAdmin = req.session.user.isAdmin;
	var userId = req.user.id;
	var loggedUserId = req.session.user.id;

	if(isAdmin && userId !== loggedUserId){
		next();
	} else{
		console.log('Ruta prohibida: no es el usuario logeado, ni un administrador.');
		res.send(403);
	}
};
