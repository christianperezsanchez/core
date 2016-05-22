var models = require('../models');
var Sequelize = require('sequelize');

// Autoload el quiz asociado a :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.findById(quizId, { include: [ models.Comment] })
  		.then(function(quiz) {
      		if (quiz) {
        		req.quiz = quiz;
        		next();
      		} else { 
      			throw new Error('No existe quizId=' + quizId);
      		}
        })
        .catch(function(error) { next(error); });
};

// MW que permite acciones solamente si al usuario logeado es admin o es el autor del quiz.
exports.ownershipRequired = function(req, res, next){

    var isAdmin      = req.session.user.isAdmin;
    var quizAuthorId = req.quiz.AuthorId;
    var loggedUserId = req.session.user.id;

    if (isAdmin || quizAuthorId === loggedUserId) {
        next();
    } else {
      console.log('Operación prohibida: El usuario logeado no es el autor del quiz, ni un administrador.');
      res.send(403);
    }
};

//GET /quizzes
exports.index= function(req, res, next){
  models.Quiz.findAll().then(function(quizzes){
      res.render('quizzes/index.ejs', {quizzes: quizzes});
}).catch(function(error) {next(error); });
};

//GET /quizzes/:id
exports.show=function(req, res, next){
	var answer= req.query.answer || '';
	res.render('quizzes/show', {quiz: req.quiz, answer: answer});
     
};

// GET /quizzes/:quizId/check
exports.check = function(req, res, next) {

	var answer = req.query.answer || "";

	var result = answer === req.quiz.answer ? 'Correcta' : 'Incorrecta';

	res.render('quizzes/result', { quiz: req.quiz, 
								   result: result, 
								   answer: answer });
};

//GET /quizzes/new
  exports.new = function(req, res, next) {
	var quiz= models.Quiz.build({question: "", answer: ""});
	res.render('quizzes/new',  {quiz: quiz});
};

// POST /quizzes/create
exports.create = function(req, res, next) {

    var redir = req.body.redir || '/quizzes'

    var authorId = req.session.user && req.session.user.id || 0;
    var quiz = { question: req.body.question, 
                 answer:   req.body.answer,
                 AuthorId: authorId };

    // Guarda en la tabla Quizzes el nuevo quiz.
    models.Quiz.create(quiz)
    .then(function(quiz) {
        req.flash('success', 'Pregunta y Respuesta guardadas con éxito.');

        if (!req.file) { 
            req.flash('info', 'Es un Quiz sin imagen.');
            return; 
        }    

        // Salvar la imagen en Cloudinary
        return uploadResourceToCloudinary(req)
        .then(function(uploadResult) {
            // Crear nuevo attachment en la BBDD.
            return createAttachment(req, uploadResult, quiz);
        });
    })
    .then(function() {
        res.redirect(redir);
    })
    .catch(Sequelize.ValidationError, function(error) {
        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        };
  
        res.render('quizzes/new', {quiz: quiz,
                                   redir: redir});
    })
    .catch(function(error) {
        req.flash('error', 'Error al crear un Quiz: '+error.message);
        next(error);
    }); 
};


//PUT /quizzes/:id
exports.update = function(req, res, next) {
  req.quiz.question = req.body.quiz.question;
  req.quiz.answer = req.body.quiz.answer;

  req.quiz.save({fields: ["question", "answer"]}).then(function(quiz) {
	req.flash('success', 'Quiz editado con éxito.');
	res.redirect('/quizzes');
  }).catch(Sequelize.ValidationError, function(error) {

	req.flash('error', 'Errores en el formulario:');
	for (var i in error.errors) {
	req.flash('error', error.errors[i].value);
	};

	res.render('quizzes/edit', {quiz: req.quiz});
	}).catch(function(error) {
	req.flash('error', 'Error al editar el Quiz: '+error.message);
	  next(error);
	});
};

//DELETE /quizzes/:id
exports.destroy = function(req, res, next) {
	req.quiz.destroy().then(function()  {
	   req.flash('success', 'Quiz borrado con éxito.');
	   req.redirect('/quizzes');
	}).catch(function(error){
	req.flash('error', 'Error al editar el Quiz: '+error.message);
	next(error);
	});
};









	
























