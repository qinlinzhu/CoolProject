/**
 * UserController Class.
 * 
 * Adds routing middleware for all user functionality.
 * Includes simple Facade methods for Firebase transactions
 * such as login and register.
 *
 * @class
 *
 */
class UserController{

    /**
     * Instantiates class, calls method to set 
     * required session variables 
     * for the user
     */
    constructor(){
        // Set current user variables before each request
        this.setVariables();
    }

    /**
     * Assigns middleware to add User to
     * UserModel, request.session, 
     * and response.locals variables
     */
    setVariables(){
        AraDTApp.use(async (request, response, next) => {
            // Pass on to next middleware
            next();
        });
    }
        
    /**
     * Assigns middleware to routes
     */
    addRoutes(){
        // Add all routing middleware for user endpoints
        AraDTApp.get('/register', this.signup);
        AraDTApp.post('/register', this.register);
        AraDTApp.post('/login', this.login);
        AraDTApp.get('/login', this.signin);
        AraDTApp.get('/logout', this.logout);
        AraDTApp.get('/account', this.getAccount);
        AraDTApp.post('/account', this.updateAccount);
        AraDTApp.post('/password', this.updatePassword);
    }

    signup = async (request, response) => {
        response.render('register');
    };
    signin = async (request, response) => {
        response.render('login');
    };

    /**
     * Asynchronous function that handles post form submission to '/login'
     * On success, redirects to '/account'
     * Onfailure, redirects to '/' with error message
     * Requires the following POST form name fields:
     * 
     * @param {string}      request.body.email          email form field
     * @param {string}      request.body.password       password form field
     * 
     * @returns {Object}    response.redirect object
     */
    login = async (request, response) => {
        // Try to see if form submission is valid
        try{
            await AraDTUserModel.login(request, response)
                .then(() => {
                    // Login successful, so redirect to account
                    response.redirect('/account');
                }).catch((error) => {
                    // Firebase login has failed, so return Firebase errors
                    request.session.errors.login = [error.message];
                    response.redirect('/login');
                });
        } catch(errors) {
            // Form has failed validation, so return errors
            request.session.errors.login = errors;
            response.redirect('/login');
        }
    };


    /**
     * Asynchronous function that handles POST form submission to '/register'
     * On success, redirects to '/account'
     * Onfailure, redirects to '/' with error message
     * Requires the following POST form name fields:
     * 
     * @param {string}      request.body.email              email form field
     * @param {string}      request.body.password           password form field
     * @param {string}      request.body.passwordConfirm    passwordConfirm form field
     * 
     * @returns {Object}    response.redirect object
     */
    register = async (request, response) => {
        // Try to see if form submission is valid
        try{
            await AraDTUserModel.register(request, response)
                .then(() => {
                    // registration successful, so redirect to account
                    response.redirect('/account');
                }).catch((error) => {
                    // Firebase registration has failed, so return Firebase errors
                    request.session.errors.register = [error.message];
                    response.redirect('/register');
                });
        } catch(errors) {
            // Form has failed validation, so return errors
            request.session.errors.register = errors;
            response.redirect('/register');
        }
    };

    /* YOU NEED TO ADD COMMENTS FROM HERE ON */

    updateAccount =  async (request, response) => {

        try{
            await AraDTUserModel.update(request, response)
                .then(() => {
                    response.locals.errors.profile = ['Your details have been updated'];
                    response.render('account');
                }).catch((error) => {
                    response.locals.errors.profile = [error.message];
                    response.render('account');
                });
        } catch(errors) {
            response.locals.errors.profile = errors;
            response.render('account');
        }

    };

    getAccount(request, response){
        
        if (!request.session.token) {
            response.redirect('/');
        }
        response.render('account');
    }

    logout = async (request, response) => {
        request.session.errors.general = ['You have been logged out'];
        response.locals.loggedin = false;
        request.session.destroy();
        await AraDTDatabase.firebase.auth().signOut().then(function() {
                response.redirect('/');
            }).catch(function(error) {
                response.redirect('/');
            });
    }

    /**
     * Asynchronous function that handles POST form submission to '/password'
     * On success, redirects to '/account'
     * Onfailure, redirects to '/account' with error message
     * Requires the following POST form name fields:
     * 
     * @param {string}      request.body.password           password form field
     * @param {string}      request.body.passwordConfirm    passwordConfirm form field
     * 
     * @returns {Object}    response.redirect object
     */
    updatePassword = async (request, response) => {

        try{
            await AraDTUserModel.updatePassword(request, response)
                .then(() => {
                    // updated password successful, so redirects to account
                    request.session.errors.password = ['Your password has been updated'];
                    response.redirect('/account');
                }).catch((error) => {
                    // updated password not succesfful, so keeps user on account and displays error
                    request.session.errors.password = [error.message];
                    response.redirect('/account');
                });
        } catch(errors) {
            // Form has failed validation, so returns errors
            request.session.errors.password = errors;
            response.redirect('/account');
        }

    };

}
module.exports = UserController;