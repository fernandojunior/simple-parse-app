/**
* Repositorio de objetos do Parse.org 
* https://parse.com/docs/js_guide
**/
var ParseRepository = PrototypeClass.extend({

    prototype: {
       
       /**
       * Repository initializer
       * @param args.class_name Parse class name or
       * @param args.class Parse class. If setted then class_name not needed
       **/
       initialize: function (args){
           this._class_name = args.class_name;
           this._class = args.class;
           
           if (typeof this._class_name !== "undefined"){
               this._class = Parse.Object.extend(this._class_name);
           }
           
       },
       
       /**
       * Parse query object for the class
       **/
       _query: function(){
           return new Parse.Query(this._class);
       },
       
       /**
       * Create a parse object
       **/
       _create: function(){
           return new this._class();
       },
       
       /**
       * Retrieve all objects
       **/
       getAll: function(callback, error_callback){           
           return this.find(null, callback, error_callback);           
       },
        
       /**
       * Retrieve only a object
       * @param args.id The object ID
       **/
       get: function(args, callback, error_callback){
           var id = args.id;
           this.first({objectId : id}, callback, error_callback);
           return;
       },
       
       /**
       * Update a parse object
       * @param args.id The object ID
       * @param args.data The new data of object
       **/
       put: function(args, callback, error_callback){
           var id = args.id;
           var data = args.data;           
           var log = "Updating a parse object.";

           function get_callback(response){
               response.save(data,  ParseRepository._handler(log, callback, error_callback));                
           };

           this.get({id : args.id}, get_callback, error_callback);

           return;
       },

       /**
       * Create a parse object
       * @param data The data of the new object
       **/
       post: function(args, callback, error_callback) {
           var data = args;         
           var log = "Creating a parse object in cloud.";           
           this._create().save(data, ParseRepository._handler(log, callback, error_callback));
           return;
       },
       
       /**
       * Delete a parse object
       * @param args.id The ID of the object that will be deleted
       **/
       delete: function(args, callback, error_callback){
           var id = args.id;
           var log = "Deleting a parse object.";
       
           function get_callback(response){
               response.destroy(ParseRepository._handler(log, callback, error_callback));
           };

           this.get({id: id}, get_callback, error_callback);           
           return;
       },

        /**
        * Find objects
        * @param args The key : value sings
        **/        
       find: function(args, callback, error_callback){
           var log = "Finding objects.";
           
           var query = this._query();
           for(var key in args){
               query.equalTo(key, args[key]);
           }
           
           query.find(ParseRepository._handler(log, callback, error_callback));
           return;
       },
       
        /**
        * Find first object
        * @param args The key : value sings
        **/        
       first: function(args, callback, error_callback){
           var log = "Retrieving first object";
           
           var query = this._query();
           for(var key in args){
               query.equalTo(key, args[key]);
           }
           
           query.first(ParseRepository._handler(log, callback, error_callback));
           return;
       },
           
    },

    /**
    * Upload a file to parse
    * @param args.name filename
    * @param args.ext file extension
    * @param args.content_type The file content type
    * @param args.file_upload_control $("#id")[0] or document.getElementById("id")
    **/
    uploadFile: function(args, callback, error_callback){ 
        var name = args.name;
        var ext = args.ext;
        var content_type = args.content_type;
        var file_upload_control = args.file_upload_control;

        if (file_upload_control.files.length > 0) {

            var file = file_upload_control.files[0];
            var parseFile = new Parse.File(name + ext, file, content_type);
            
            parseFile.save().then(
                function(response){
                    console.log("Sucess: The file was uploaded");
                    console.log(response.url());
                    if (callback !== null && typeof callback !== "undefined"){
                        callback();
                    }
                },
                function(error){
                    console.log("Error: The file was not uploaded");
                    if (error_callback !== null && typeof error_callback !== "undefined"){
                        error_callback(error);
                    }
                }
            );
        }

        return;
   },
       
   /**
   * Callback and error callback handler
   **/
   _handler : function (log, callback, error_callback){
       var calls = {
           success: function(response){
               console.log("Sucess: "+ log);

               if (callback !== null && typeof callback !== "undefined"){
                   callback(response);
               }
           },
           error: function (error){
               console.log("Error: "+ log + JSON.stringify(error));

               if (error_callback !== null && typeof error_callback !== "undefined"){
                   error_callback(error);
               }
           }
       }

       return calls;
   },

   /**
   * Repository objects dictionary for global use
   **/
   g: {}
});

/**
* Repositorio de usuarios parse. Baseado nas classes especiais Parse.User e Parse.FacebookUtils
**/
ParseRepository.User = ParseRepository.extend({

    prototype: {

        initialize: function (){
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
        }
    }

});

/**
* Repositorio de usuarios parse. Baseado nas classes especiais Parse.User e Parse.FacebookUtils
**/
ParseRepository.FacebookUser = ParseRepository.User.extend({

    prototype: {

        initialize: function (){
            this._util = Parse.FacebookUtils;
        },

        /**
        * @see ParseRepository.FacebookUser.login
        **/
        signup : function(args, callback, error_callback) {
            return this.login(args, callback, error_callback);
        },

        /**
        * Redirect to signup method
        **/
        post : function(args, callback, error_callback){
            return this.login(args, callback, error_callback);
        },

        /**
        * Login or sign up a user through Facebook
        * @param args.permisions Facebook permissions
        **/
        login: function(args, callback, error_callback){
            
            console.log("ate aqui");
            
            if (typeof args === "undefined"){
                args = {};
            }

            var permissions = args.permissions;
            var log = "Logging or signing up a user through Facebook";
            
            if (typeof permissions === "undefined"){
                permissions = "user_likes,email";
            }

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

            this._util.logIn(
                permissions,
                ParseRepository._handler(log, login_callback, error_callback)
            );
            return;
        },

        /**
        * Associate an existing Parse.User to a Facebook account
        * @param args.id User ID
        **/
        link: function(args, callback, error_callback){            
            var id = args.id;
            var permissions = args.permissions;
            var log = "Linking parser user from facebook.";
            
            function get_callback(response){
                if (!this._util.isLinked(response)) {

                    this._util.link(
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
        unlink: function(args, callback, error_callback){
            var id = args.id;
            var log = "Unlinking parser user from facebook.";

            function get_callback(response){
                this._util.unlink(
                    response, ParseRepository._handler(log, callback, error_callback)
                );                
            }

            this.get({id: id}, get_callback, error_callback);
            return;
        }

    }

});

ParseRepository.g.user = ParseRepository.User.create();
ParseRepository.g.facebook_user = ParseRepository.FacebookUser.create();