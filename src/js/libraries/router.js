/*
    Router
*/
(function()  {
    var Router=function()   {
        this.routes=new Array();
    };
    Router.prototype={
        routes: new Array(),
        registerRoute: function(route, fn, paramObject)  {
            var scope=paramObject?paramObject.scope?paramObject.scope:{}:{};
            var rules=paramObject?paramObject.rules?paramObject.rules:null:null;
            return this.routes[this.routes.length]=new Route({
                route: route,
                fn: fn,
                scope: scope,
                rules: rules
            })  
        }, 
        addRoute: function(routeConfig) {
            return this.routes[this.routes.length]=new Route(routeConfig);              
        },
        applyRoute: function(route)   {
            /*
            for(var i=0, j=this.routes.length;i<j; i++)  {
                var sRoute=this.routes[i];                    
                
                if(sRoute.matches(route)) {
                    var _args = sRoute.getArgumentsValues(route);
                    sRoute.fn.apply(sRoute.scope, _args);  
                    break; 
                }    
            }*/
            var _args_object = {};
            for(var i=0, j=this.routes.length;i<j; i++)  {
                var sRoute=this.routes[i];                    
                
                if(sRoute.matches(route)) {
                    var _all_args = sRoute.optionalRouteArguments.concat(sRoute.routeArguments);
                    var _route_parts_args = JSON.parse(JSON.stringify(sRoute.routeParts));
                    //remove all ":" and "{}"
                    for(var i = 0; i< _route_parts_args.length; i++){
                        _route_parts_args[i] = replaceAll(_route_parts_args[i], ":","");
                        _route_parts_args[i] = replaceAll(_route_parts_args[i], "{","");
                        _route_parts_args[i] = replaceAll(_route_parts_args[i], "}","");
                    }

                    //Create array with only allowed args
                    var _allowed_args = [];
                    for(var i = 0; i< _route_parts_args.length; i++){
                        if(_all_args.includes(_route_parts_args[i])){
                            _allowed_args.push(_route_parts_args[i]);
                        }
                    }
                    var _args = sRoute.getArgumentsValues(route);
                    var _args_object = {};
                    _args_object.params = {};
                    _args_object.params.args = _args;
                    _args_object.params.route_parts = sRoute.routeParts;
                    for(var i = 0; i< _allowed_args.length; i++){
                        _args_object[_allowed_args[i]] = _args[i];
                    }

                    if(window["router"] != undefined || window["router"] != null){
                        window["router"].current_route_args = _args_object;
                    }
                    sRoute.fn.apply(sRoute.scope, [_args_object]);  
                    break; 
                }    
            }
        },
        defaultRoute: function(route_name) {
            var default_route = (window.location.hash.split('#')[1]) == null;
            if(default_route){
                this.applyRoute(route_name);
            }
        }  
    }
    
    var Route=function()    {
        this.route=arguments[0].route;
        this.fn=arguments[0].fn;
        this.scope=arguments[0].scope ? arguments[0].scope : null;
        this.rules=arguments[0].rules ? arguments[0].rules: {};
        
        this.routeArguments=Array();
        this.optionalRouteArguments=Array();

        //Create the route arguments if they exist
        
        this.routeParts=this.route.split("/");
        for(var i=0, j=this.routeParts.length; i<j; i++)   {
            var rPart=this.routeParts[i]
            if(rPart.substr(0,1)=="{" && rPart.substr(rPart.length-1, 1) == "}") {
                var rKey=rPart.substr(1,rPart.length-2); 
                this.routeArguments.push(rKey);
            }
            if(rPart.substr(0,1)==":" && rPart.substr(rPart.length-1, 1) == ":") {
                var rKey=rPart.substr(1,rPart.length-2); 
                this.optionalRouteArguments.push(rKey);
            }
            
        }
       
        
    }
    
    Route.prototype.getArgumentsObject=function(route) {
        var rRouteParts=route.split("/");   
        var rObject={};
        for(var i=0, j=this.routeParts.length; i < j; i++) {
            var rP=this.routeParts[i];//current routePart
            var cP0=rP.substr(0,1); //char at postion 0
            var cPe=rP.substr(rP.length-1, 1);//char at last postion
            if((cP0=="{" || cP0==":" ) && (cPe == "}" || cPe == ":"))  {
                var rKey=rP.substr(1,rP.length-2); 
                rObject[rKey]=rRouteParts[i];
            }                   
        }
        return rObject;
    }
    
    Route.prototype.getArgumentsValues=function(route) {
        var rRouteParts=route.split("/");   
        var rArray=new Array();
        for(var i=0, j=this.routeParts.length; i < j; i++) {
            var rP=this.routeParts[i];//current routePart
            var cP0=rP.substr(0,1); //char at postion 0
            var cPe=rP.substr(rP.length-1, 1);//char at last postion
            if((cP0=="{" || cP0==":" ) && (cPe == "}" || cPe == ":"))  {
                rArray[rArray.length]=rRouteParts[i];
            }                   
        }
        return rArray;
    }
    
    Route.prototype.matches=function(route) {
        //We'd like to examen every individual part of the incoming route
        var incomingRouteParts=route != null? route.split("/"): [];
        //This might seem strange, but assuming the route is correct makes the logic easier, than assuming it is wrong.    
        var routeMatches=true;
        
        //if the route is shorter than the route we want to check it against we can immidiatly stop.
        if(incomingRouteParts.length < this.routeParts.length-this.optionalRouteArguments.length)  {
            routeMatches = false;   
            //return;
        } 
        else    {
            for(var i=0, j=incomingRouteParts.length; i<j && routeMatches; i++)    {
                //Lets cache the variables, to prevent variable lookups by the javascript engine
                var iRp=incomingRouteParts[i];//current incoming Route Part
                var rP=this.routeParts[i];//current routePart                     
                if(typeof rP=='undefined')  {
                    //The route almost certainly doesn't match it's longer than the route to check against
                    routeMatches=false;   
                }
                else    {
                    var cP0=rP.substr(0,1); //char at postion 0
                    var cPe=rP.substr(rP.length-1, 1);//char at last postion                   
                    if((cP0!="{" && cP0!=":") && (cPe != "}" && cPe != ":")) {
                        //This part of the route to check against is not a pseudo macro, so it has to match exactly
                        if(iRp != rP)   {
                            routeMatches=false; 
                        }
                    }
                    else    {
                        //Since this is a pseudo macro and there was a value at this place. The route is correct.
                        //But a rule might change that
                        if(this.rules!=null) {
                            var rKey=rP.substr(1,rP.length-2);
                            //Is the rules rKey a RegExp
                            if(this.rules[rKey] instanceof RegExp)   {
                                routeMatches=this.rules[rKey].test(iRp);  
                            }
                            //Is the rules rKey an Array
                            if(this.rules[rKey] instanceof Array)   {
                                //N.B. If you need older browser to use this, you'll need an Array.indexOf polyfill
                                if(this.rules[rKey].indexOf(iRp) < 0)  {
                                    routeMatches=false;
                                }
                            }
                            //Is the rules rKey a Function
                            if(this.rules[rKey] instanceof Function)   {
                                //this.getArgumentsObject(route) is added, so that it becomes possible to do a cross validation in the function
                                routeMatches=this.rules[rKey](iRp, this.getArgumentsObject(route), this.scope);
                            }
                        }
                        else {
                             routeMatches=true;                       
                        }
                    }
                }   
            }
                                           
        }
        return routeMatches;
    }

    function replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
    
 
    //Create a main instance to which we bind the window events
    
    window["router"]=new Router();
    
    //Copy the route prototype, so we can make another instance of router for internal purpuse
    window["Router"]=Router;
    
    //Copy the Route prototyp, so we kan make a sole instance of Route
    window["Route"]=Route;
    

    //Create the event that will listen for location hash changes
    if ("onhashchange" in window) { // event supported?
        window.onhashchange = function () {
            router.applyRoute(window.location.hash.split('#')[1]);
        }

    }
    else { // event not supported: This would be needed for older IE's
        var storedHash = window.location.hash.split('#')[1];
        window.setInterval(function () {
            if (window.location.hash.split('#')[1] != storedHash) {
                storedHash = window.location.hash.split('#')[1];
                router.applyRoute(window.location.hash.split('#')[1]);
            }
        }, 100);
    }

    document.addEventListener('DOMContentLoaded', function() {
        //console.log("dom loaded");
        router.applyRoute(window.location.hash.split('#')[1]);
     }, false);
   
})();