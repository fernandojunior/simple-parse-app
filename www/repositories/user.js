/**
* Repositorio de usuarios parse. Baseado nas classes especiais Parse.User e Parse.FacebookUtils
* https://github.com/fernandojunior/repository.js
**/
ParseRepository.g.user = ParseRepository.extend({

    prototype: {

        initialize: function (args){
            this._class = Parse.User;
        },

        /**
        * Create a new user. Before it does this, it also checks to make sure that both the username and email are unique
        * @param args.username Username
        * @param args.password Encrypeted password
        * @param args.email User email
        * @param args... Any data do you want to save
        **/
        signup : function(args, callback, error_callback) {            
            var data = args;
            var user = this._create();
            var log = "Signing up a user.";
            user.signUp(data, ParseRepository._handler(log, callback, error_callback));
            return;
        },

        /**
        * Redirect to signup method
        **/
        post : function(args, callback, error_callback){
            return this.signUp(args, callback, error_callback);
        },

        /**
        * Log the user in the app. Traditional mode.
        * @param args.username Username
        * @param args.password html input value Encrypted password
        **/
        login : function(args, callback, error_callback){
            var username = args.username;
            var password = args.password;            
            var log = "Logging the user in. Traditional mode.";

            this._class.logIn(
                username,
                password,
                ParseRepository._handler(log, callback, error_callback)
            );

            return;

        },

        /**
        * Log out the current user
        **/
        logout: function (){
            this._class.logOut();
            console.log("User was logged out.");
        },
        
        /**
        * Get the current user that is logged in the session (localStorage).
        **/
        current: function(callback, error_callback){
            var current_user = this._class.current();

            if (current_user) {

                console.log("getting current user");

                if (callback !== null && typeof callback !== "undefined"){
                    callback(current_user);
                }

            } else {

                console.log("User is not logged in.");

                if (error_callback !== null && typeof error_callback !== "undefined"){
                    error_callback();
                }
            }

            return;
        },

        /**
        * Request a password reset to parse.org
        * @param args.email The user email needed to reset the password
        **/
        reset_password : function(args, callback, error_callback){
            var email = args.email;
            var log = "Sending a request for reset the user passaword.";
            this._class.requestPasswordReset(
                email,
                ParseRepository._handler(log, callback, error_callback)
            );
            return;
        },

        /**
        * Login or sign up a user through Facebook
        * @param args.permisions Facebook permissions
        **/
        facebook_login: function(args, callback, error_callback){
            if (typeof args === "undefined"){
                args = {};
            }
            
            var permissions = args.permissions;
            var log = "Logging or signing up a user through Facebook";
            
            if (typeof permissions === "undefined"){
                permissions = "user_likes,email";
            }
            
            console.log(permissions);

            function login_callback(response){

                if (!response.existed()) {
                    console.log("User signed up and logged in through Facebook.");
                } else {
                    console.log("User just logged in through Facebook!");
                }

                if (callback !== null && typeof callback !== "undefined"){
                    callback(response);
                }

            };

            Parse.FacebookUtils.logIn(
                permissions,
                ParseRepository._handler(log, login_callback, error_callback)
            );
            return;
        },

        /**
        * Associate an existing Parse.User to a Facebook account
        **/
        facebook_link: function(args, callback, error_callback){            
            var id = args.id;
            var permissions = args.permissions;
            var log = "Linking parser user from facebook.";
            
            function get_callback(response){
                if (!Parse.FacebookUtils.isLinked(response)) {

                    Parse.FacebookUtils.link(
                        response,
                        permissions,
                        ParseRepository._handler(log, callback, error_callback)
                    );
                }
            }
            
            this.get({id: id}, get_callback, error_callback);
            return;
        },

        /**
        * Unassociate an existing Parse.User to a Facebook account
        * @param args.id User object ID
        **/
        facebook_unlink: function(args, callback, error_callback){
            var id = args.id;
            var log = "Unlinking parser user from facebook.";

            function get_callback(response){
                Parse.FacebookUtils.unlink(
                    response, ParseRepository._handler(log, callback, error_callback)
                );                
            }

            this.get({id: id}, get_callback, error_callback);
            return;
        }

    }

}).create();