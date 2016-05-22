var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');
var sessionController = require('../controllers/session_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Quiz' });
});

//Autoload
router.param('quizId', quizController.load);
router.param('userId', userController.load);
router.param('commentId', commentController.load);

// Definición de rutas de sesion
router.get('/session',    sessionController.new);     // formulario login
router.post('/session',   sessionController.create);  // crear sesión
router.delete('/session', sessionController.destroy); // destruir sesión

// Definición de rutas de cuenta
router.get('/users',                    userController.index);   // listado usuarios
router.get('/users/:userId(\\d+)',      userController.show);    // ver un usuario
router.get('/users/new',                userController.new);     // formulario sign un
router.post('/users',                   userController.create);     // registrar usuario
router.get('/users/:userId(\\d+)/edit', sessionController.loginRequired, userController.edit);
router.put('/users/:userId(\\d+)',     sessionController.loginRequired, userController.update);
router.delete('/users/:userId(\\d+)',   sessionController.loginRequired,userController.destroy);

//Definición de rutas de /quizzes
router.get('/quizzes', quizController.index);
router.get('/quizzes/:quizId(\\d+)', quizController.show);
router.get('/quizzes/:quizId/(\\d+)/check', quizController.check);
router.get('/quizzes/new', sessionController.loginRequired, quizController.new);
router.post('/quizzes', sessionController.loginRequired, quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit', sessionController.loginRequired, quizController.edit);
router.put('/quizzes/:quizId(\\d+)', sessionController.loginRequired, quizController.update);
router.delete('/quizzes/:quizId(\\d+)', sessionController.loginRequired, quizController.destroy);
//Definición de rutas de comentarios
router.get('/quizzes/:quizId(\\d+)/comments/new', sessionController.loginRequired, commentController.new);
router.post('/quizzes/:quizId(\\d+)/comments', sessionController.loginRequired,  commentController.create);
router.put('/quizzes/:quizId(\\d+)/comments/:commentId(\\d+)/accept', sessionController.loginRequired, commentController.accept);



module.exports = router;
