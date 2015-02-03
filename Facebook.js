'use strict';

angular.module('Facebook', [])
    .provider('Facebook', function FacebookProvider() {
        var config = {};
        var permissions = "";

        this.config = function(c, p) {
            config = c;
            permissions = p;
        }
        this.$get = ['$http', '$rootScope', '$q',
            function($http, $rootScope, $q) {
                var svc;
                var appDeferredLogin = $q.defer();
                var appDeferredLogout = $q.defer();

                FB.init(config);
                FB.Event.subscribe('auth.authResponseChange', function(response) {
                    svc.lastResponse = response;
                    if (response.status === "connected") {
                        appDeferredLogout = $q.defer();
                        svc.onLogin(response, appDeferredLogin);
                    } else {
                        appDeferredLogin = $q.defer();
                        svc.onLogout(response,appDeferredLogout);
                    }
                    $rootScope.$apply();
                });
                svc = {
                    login: function() {
                        var deferred = $q.defer();
                        if (svc.lastResponse && svc.lastResponse.status === "connected") {
                            console.log("already logged in")
                            appDeferredLogin.promise.then(function(){
                               deferred.resolve();
                            })
                            return deferred.promise;
                        }
                        FB.login(function(response) {
                            appDeferredLogin.promise.then(function() {
                                deferred.resolve(svc.lastResponse);
                            }, function(data) {
                                deferred.reject(data)
                            })
                        }, {
                            scope: permissions
                        })

                        return deferred.promise;
                    },
                    logout: function() {
                        var deferred = $q.defer()
                        FB.logout(function(response) {
                            appDeferredLogout.promise.then(function(){
                                deferred.resolve("Logged out");
                            },function(){
                                deferred.reject("Could not log out");
                            })
                        })
                        return deferred.promise;
                    },
                    onLogin: function(response, deferred) {
                        deferred.resolve(response)
                    },
                    onLogout: function(response, deferred) {
                        deferred.resolve(response);
                    }
                };
                svc.ui = FB.ui;
                svc.api = FB.api;
                return svc;
            }
        ];
    })

.filter("fbProfilePicture", [
    function() {
        return function(fbid, size) {
            var builtURL = "https://graph.facebook.com/" + fbid + "/picture/";
            if (size) {
                var dimensions = size.split("x");
                builtURL += "?";
                builtURL += "width=" + dimensions[0];
                builtURL += "&";
                builtURL += "height=" + dimensions[1];
            }
            return builtURL;
        }
    }
])
.directive("fbComments",['$timeout',
    function($timeout){
        return {
            restrict: 'A',
            scope: {
                href: '@fbComments',
                numposts: '@?'
            },
            template: '<div class="fb-comments" data-width="100%" data-href="{{::href}}" data-numposts="{{::numposts || 5}}" data-colorscheme="light"></div>',
            link: function(scope,el,attrs){
                $timeout(function(){
                    console.log(scope)
                    FB.XFBML.parse(el[0]);
                })
            }
        }
    }
]);