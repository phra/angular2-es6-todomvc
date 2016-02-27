"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('angular2/core');
var http_1 = require('angular2/http');
var Observable_1 = require('rxjs/Observable');
require('rxjs/add/observable/throw');
require('rxjs/add/operator/map');
require('rxjs/add/operator/catch');
require('rxjs/add/operator/share');
var LoopBackAuth = (function () {
    function LoopBackAuth() {
        this.propsPrefix = '$LoopBack$';
        this.accessTokenId = this.load("accessTokenId");
        this.currentUserId = this.load("currentUserId");
        this.rememberMe = this.load("rememberMe");
        this.currentUserData = null;
    }
    LoopBackAuth.prototype.setRememberMe = function (value) {
        this.rememberMe = value;
        return this;
    };
    LoopBackAuth.prototype.getCurrentUserId = function () {
        return this.currentUserId;
    };
    LoopBackAuth.prototype.setCurrentUserData = function (data) {
        this.currentUserData = data;
        return this;
    };
    LoopBackAuth.prototype.getCurrentUserData = function () {
        return this.currentUserData;
    };
    LoopBackAuth.prototype.getAccessTokenId = function () {
        return this.accessTokenId;
    };
    LoopBackAuth.prototype.save = function () {
        var storage = this.rememberMe ? localStorage : sessionStorage;
        this.saveThis(storage, "accessTokenId", this.accessTokenId);
        this.saveThis(storage, "currentUserId", this.currentUserId);
        this.saveThis(storage, "rememberMe", this.rememberMe);
    };
    ;
    LoopBackAuth.prototype.setUser = function (accessTokenId, userId, userData) {
        this.accessTokenId = accessTokenId;
        this.currentUserId = userId;
        this.currentUserData = userData;
    };
    LoopBackAuth.prototype.clearUser = function () {
        this.accessTokenId = null;
        this.currentUserId = null;
        this.currentUserData = null;
    };
    LoopBackAuth.prototype.clearStorage = function () {
        this.saveThis(sessionStorage, "accessTokenId", null);
        this.saveThis(localStorage, "accessTokenId", null);
        this.saveThis(sessionStorage, "currentUserId", null);
        this.saveThis(localStorage, "currentUserId", null);
        this.saveThis(sessionStorage, "rememberMe", null);
        this.saveThis(localStorage, "rememberMe", null);
    };
    ;
    // Note: LocalStorage converts the value to string
    // We are using empty string as a marker for null/undefined values.
    LoopBackAuth.prototype.saveThis = function (storage, name, value) {
        try {
            var key = this.propsPrefix + name;
            if (value == null) {
                value = '';
            }
            storage[key] = value;
        }
        catch (err) {
            console.log('Cannot access local/session storage:', err);
        }
    };
    LoopBackAuth.prototype.load = function (name) {
        var key = this.propsPrefix + name;
        return localStorage[key] || sessionStorage[key] || null;
    };
    return LoopBackAuth;
}());
var auth = new LoopBackAuth();
var BaseLoopBackApi = (function () {
    function BaseLoopBackApi(http) {
        this.http = http;
        this.init();
    }
    /**
     * Get path for building part of URL for API
     * @return string
     */
    BaseLoopBackApi.prototype.getPath = function () {
        return this.path;
    };
    BaseLoopBackApi.prototype.init = function () {
        this.path = "/api";
    };
    /**
     * Process request
     * @param string  method    Request method (GET, POST, PUT)
     * @param string  url       Request url (my-host/my-url/:id)
     * @param any     urlParams Values of url parameters
     * @param any     params    Parameters for building url (filter and other)
     * @param any     data      Request body
     */
    BaseLoopBackApi.prototype.request = function (method, url, urlParams, params, data) {
        if (urlParams === void 0) { urlParams = {}; }
        if (params === void 0) { params = {}; }
        if (data === void 0) { data = null; }
        var requestUrl = url;
        var key;
        for (key in urlParams) {
            requestUrl = requestUrl.replace(new RegExp(":" + key + "(\/|$)", "g"), urlParams[key] + "$1");
        }
        var parameters = [];
        if (auth.getAccessTokenId()) {
            params.access_token = auth.getAccessTokenId();
        }
        for (var param in params) {
            parameters.push(param + '=' + (typeof params[param] === 'object' ? JSON.stringify(params[param]) : params[param]));
        }
        requestUrl += (parameters ? '?' : '') + parameters.join('&');
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        var request = new http_1.Request({
            headers: headers,
            method: method,
            url: requestUrl,
            body: data ? JSON.stringify(data) : undefined
        });
        return this.http.request(request)
            .map(function (res) { return (res.text() != "" ? res.json() : {}); })
            .catch(this.handleError);
    };
    BaseLoopBackApi.prototype.handleError = function (error) {
        return Observable_1.Observable.throw(error.json().error || 'Server error');
    };
    BaseLoopBackApi = __decorate([
        core_1.Injectable()
    ], BaseLoopBackApi);
    return BaseLoopBackApi;
}());
exports.BaseLoopBackApi = BaseLoopBackApi;
/**
 * Api for the `User` model.
 */
var UserApi = (function (_super) {
    __extends(UserApi, _super);
    function UserApi(http) {
        _super.call(this, http);
    }
    // INTERNAL. Use User.accessTokens.findById() instead.
    UserApi.prototype.prototype$__findById__accessTokens = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/users/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.accessTokens.destroyById() instead.
    UserApi.prototype.prototype$__destroyById__accessTokens = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.accessTokens.updateById() instead.
    UserApi.prototype.prototype$__updateById__accessTokens = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/users/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    // INTERNAL. Use User.credentials.findById() instead.
    UserApi.prototype.prototype$__findById__credentials = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/users/:id/credentials/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.credentials.destroyById() instead.
    UserApi.prototype.prototype$__destroyById__credentials = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/credentials/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.credentials.updateById() instead.
    UserApi.prototype.prototype$__updateById__credentials = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/users/:id/credentials/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    // INTERNAL. Use User.identities.findById() instead.
    UserApi.prototype.prototype$__findById__identities = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/users/:id/identities/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.identities.destroyById() instead.
    UserApi.prototype.prototype$__destroyById__identities = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/identities/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.identities.updateById() instead.
    UserApi.prototype.prototype$__updateById__identities = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/users/:id/identities/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    // INTERNAL. Use User.fornitores() instead.
    UserApi.prototype.prototype$__get__fornitores = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/fornitores";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.fornitores.create() instead.
    UserApi.prototype.prototype$__create__fornitores = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/fornitores";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    // INTERNAL. Use User.fornitores.update() instead.
    UserApi.prototype.prototype$__update__fornitores = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/users/:id/fornitores";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    // INTERNAL. Use User.fornitores.destroy() instead.
    UserApi.prototype.prototype$__destroy__fornitores = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/fornitores";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.accessTokens() instead.
    UserApi.prototype.prototype$__get__accessTokens = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.accessTokens.create() instead.
    UserApi.prototype.prototype$__create__accessTokens = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    // INTERNAL. Use User.accessTokens.destroyAll() instead.
    UserApi.prototype.prototype$__delete__accessTokens = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.accessTokens.count() instead.
    UserApi.prototype.prototype$__count__accessTokens = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/accessTokens/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.credentials() instead.
    UserApi.prototype.prototype$__get__credentials = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/credentials";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.credentials.create() instead.
    UserApi.prototype.prototype$__create__credentials = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/credentials";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    // INTERNAL. Use User.credentials.destroyAll() instead.
    UserApi.prototype.prototype$__delete__credentials = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/credentials";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.credentials.count() instead.
    UserApi.prototype.prototype$__count__credentials = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/credentials/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.identities() instead.
    UserApi.prototype.prototype$__get__identities = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/identities";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.identities.create() instead.
    UserApi.prototype.prototype$__create__identities = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/identities";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    // INTERNAL. Use User.identities.destroyAll() instead.
    UserApi.prototype.prototype$__delete__identities = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/identities";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    // INTERNAL. Use User.identities.count() instead.
    UserApi.prototype.prototype$__count__identities = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/identities/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `User` object.)
     * </em>
     */
    UserApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `User` object.)
     * </em>
     */
    UserApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Update an existing model instance or insert a new one into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `User` object.)
     * </em>
     */
    UserApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/users";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Check whether a model instance exists in the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `exists` – `{boolean}` -
     */
    UserApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/users/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @param object filter Filter defining fields and include
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `User` object.)
     * </em>
     */
    UserApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find all instances of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `User` object.)
     * </em>
     */
    UserApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find first instance of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `User` object.)
     * </em>
     */
    UserApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * The number of instances updated
     */
    UserApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Delete a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `User` object.)
     * </em>
     */
    UserApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Count instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `count` – `{number}` -
     */
    UserApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update attributes for a model instance and persist it into the data source.
     *
     * @param any id User id
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `User` object.)
     * </em>
     */
    UserApi.prototype.prototype$updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/users/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a change stream.
     *
     * @param object data Request data.
     *
     *  - `options` – `{object}` -
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `changes` – `{ReadableStream}` -
     */
    UserApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
    /**
     * Login a user with username/email and password.
     *
     * @param string include Related objects to include in the response. See the description of return value for more details.
     *   Default value: `user`.
     *
     *  - `rememberMe` - `boolean` - Whether the authentication credentials
     *     should be remembered in localStorage across app/browser restarts.
     *     Default: `true`.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * The response body contains properties of the AccessToken created on login.
     * Depending on the value of `include` parameter, the body may contain additional properties:
     *
     *   - `user` - `{User}` - Data of the currently logged in user. (`include=user`)
     *
     *
     */
    UserApi.prototype.login = function (credentials, include) {
        if (include === void 0) { include = "user"; }
        var method = "POST";
        var url = this.getPath() + "/users/login";
        var urlParams = {};
        var params = {};
        if (include !== undefined) {
            params.include = include;
        }
        var result = this.request(method, url, urlParams, params, credentials)
            .share();
        result.subscribe(function (response) {
            auth.setUser(response.id, response.userId, response.user);
            auth.setRememberMe(true);
            auth.save();
        });
        return result;
    };
    /**
     * Logout a user with access token.
     *
     * @param object data Request data.
     *
     *  - `access_token` – `{string}` - Do not supply this argument, it is automatically extracted from request headers.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * This method returns no data.
     */
    UserApi.prototype.logout = function () {
        var method = "POST";
        var url = this.getPath() + "/users/logout";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params)
            .share();
        result.subscribe(function () {
            auth.clearUser();
            auth.clearStorage();
        });
        return result;
    };
    /**
     * Confirm a user registration with email verification token.
     *
     * @param string uid
     *
     * @param string token
     *
     * @param string redirect
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * This method returns no data.
     */
    UserApi.prototype.confirm = function (uid, token, redirect) {
        if (redirect === void 0) { redirect = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/confirm";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Reset password for a user with email.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * This method returns no data.
     */
    UserApi.prototype.resetPassword = function (options) {
        var method = "POST";
        var url = this.getPath() + "/users/reset";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param object req
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `data` – `{object}` -
     */
    UserApi.prototype.time = function (req) {
        if (req === void 0) { req = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/time";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param object data Request data.
     *
     *  - `req` – `{object}` -
     *
     *  - `fornitore` – `{object}` -
     *
     *  - `user` – `{object}` -
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `data` – `{object}` -
     */
    UserApi.prototype.creafornitore = function (req, fornitore, user) {
        if (req === void 0) { req = undefined; }
        if (fornitore === void 0) { fornitore = undefined; }
        if (user === void 0) { user = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/creafornitore";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, req);
        return result;
    };
    UserApi.prototype.user = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/accessTokens/:id/user";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    UserApi.prototype.user = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userCredentials/:id/user";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    UserApi.prototype.user = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userIdentities/:id/user";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    UserApi.prototype.user = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/fornitori/:id/user";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * @ngdoc method
     * @name lbServices.User#getCurrent
     * @methodOf lbServices.User
     *
     * @description
     *
     * Get data of the currently logged user. Fail with HTTP result 401
     * when there is no user logged in.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     */
    UserApi.prototype.getCurrent = function () {
        var method = "GET";
        var url = this.getPath() + "/users" + "/:id";
        var urlParams = {
            id: function () {
                var id = auth.getCurrentUserId();
                if (id == null) {
                    id = '__anonymous__';
                }
                return id;
            }
        };
        return this.request(method, url, urlParams)
            .subscribe(function (response) {
            auth.setCurrentUserData(response);
            return response.resource;
        });
    };
    /**
     * Get data of the currently logged user that was returned by the last
     * call to {@link lbServices.User#login} or
     * {@link lbServices.User#getCurrent}. Return null when there
     * is no user logged in or the data of the current user were not fetched
     * yet.
     *
     * @returns object A User instance.
     */
    UserApi.prototype.getCachedCurrent = function () {
        var data = auth.getCurrentUserData();
        return data ? new UserApi(data) : null;
    };
    /**
     * @name lbServices.User#isAuthenticated
     *
     * @returns {boolean} True if the current user is authenticated (logged in).
     */
    UserApi.prototype.isAuthenticated = function () {
        return this.getCurrentId() != null;
    };
    /**
     * @name lbServices.User#getCurrentId
     *
     * @returns object Id of the currently logged-in user or null.
     */
    UserApi.prototype.getCurrentId = function () {
        return auth.getCurrentUserId();
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `User`.
     */
    UserApi.prototype.getModelName = function () {
        return "User";
    };
    UserApi = __decorate([
        core_1.Injectable()
    ], UserApi);
    return UserApi;
}(BaseLoopBackApi));
exports.UserApi = UserApi;
/**
 * Api for the `AccessToken` model.
 */
var AccessTokenApi = (function (_super) {
    __extends(AccessTokenApi, _super);
    function AccessTokenApi(http) {
        _super.call(this, http);
    }
    // INTERNAL. Use AccessToken.user() instead.
    AccessTokenApi.prototype.prototype$__get__user = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/accessTokens/:id/user";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `AccessToken` object.)
     * </em>
     */
    AccessTokenApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/accessTokens";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `AccessToken` object.)
     * </em>
     */
    AccessTokenApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/accessTokens";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Update an existing model instance or insert a new one into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `AccessToken` object.)
     * </em>
     */
    AccessTokenApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/accessTokens";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Check whether a model instance exists in the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `exists` – `{boolean}` -
     */
    AccessTokenApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/accessTokens/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @param object filter Filter defining fields and include
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `AccessToken` object.)
     * </em>
     */
    AccessTokenApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/accessTokens/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find all instances of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `AccessToken` object.)
     * </em>
     */
    AccessTokenApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/accessTokens";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find first instance of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `AccessToken` object.)
     * </em>
     */
    AccessTokenApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/accessTokens/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * The number of instances updated
     */
    AccessTokenApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/accessTokens/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Delete a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `AccessToken` object.)
     * </em>
     */
    AccessTokenApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/accessTokens/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Count instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `count` – `{number}` -
     */
    AccessTokenApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/accessTokens/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update attributes for a model instance and persist it into the data source.
     *
     * @param any id AccessToken id
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `AccessToken` object.)
     * </em>
     */
    AccessTokenApi.prototype.prototype$updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/accessTokens/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a change stream.
     *
     * @param object data Request data.
     *
     *  - `options` – `{object}` -
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `changes` – `{ReadableStream}` -
     */
    AccessTokenApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/accessTokens/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param object data Request data.
     *
     *  - `req` – `{object}` -
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * This method returns no data.
     */
    AccessTokenApi.prototype.check = function (req) {
        if (req === void 0) { req = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/accessTokens/check";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, req);
        return result;
    };
    AccessTokenApi.prototype.accessTokens = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/users/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    AccessTokenApi.prototype.accessTokens = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    AccessTokenApi.prototype.accessTokens = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/users/:id/accessTokens/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    AccessTokenApi.prototype.accessTokens = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    AccessTokenApi.prototype.accessTokens = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    AccessTokenApi.prototype.accessTokens = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    AccessTokenApi.prototype.accessTokens = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/accessTokens";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    AccessTokenApi.prototype.accessTokens = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/accessTokens/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `AccessToken`.
     */
    AccessTokenApi.prototype.getModelName = function () {
        return "AccessToken";
    };
    AccessTokenApi = __decorate([
        core_1.Injectable()
    ], AccessTokenApi);
    return AccessTokenApi;
}(BaseLoopBackApi));
exports.AccessTokenApi = AccessTokenApi;
/**
 * Api for the `UserCredential` model.
 */
var UserCredentialApi = (function (_super) {
    __extends(UserCredentialApi, _super);
    function UserCredentialApi(http) {
        _super.call(this, http);
    }
    // INTERNAL. Use UserCredential.user() instead.
    UserCredentialApi.prototype.prototype$__get__user = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userCredentials/:id/user";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserCredential` object.)
     * </em>
     */
    UserCredentialApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/userCredentials";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserCredential` object.)
     * </em>
     */
    UserCredentialApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/userCredentials";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Update an existing model instance or insert a new one into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserCredential` object.)
     * </em>
     */
    UserCredentialApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/userCredentials";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Check whether a model instance exists in the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `exists` – `{boolean}` -
     */
    UserCredentialApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/userCredentials/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @param object filter Filter defining fields and include
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserCredential` object.)
     * </em>
     */
    UserCredentialApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userCredentials/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find all instances of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserCredential` object.)
     * </em>
     */
    UserCredentialApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userCredentials";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find first instance of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserCredential` object.)
     * </em>
     */
    UserCredentialApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userCredentials/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * The number of instances updated
     */
    UserCredentialApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/userCredentials/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Delete a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserCredential` object.)
     * </em>
     */
    UserCredentialApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/userCredentials/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Count instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `count` – `{number}` -
     */
    UserCredentialApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userCredentials/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update attributes for a model instance and persist it into the data source.
     *
     * @param any id UserCredential id
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserCredential` object.)
     * </em>
     */
    UserCredentialApi.prototype.prototype$updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/userCredentials/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a change stream.
     *
     * @param object data Request data.
     *
     *  - `options` – `{object}` -
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `changes` – `{ReadableStream}` -
     */
    UserCredentialApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/userCredentials/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
    UserCredentialApi.prototype.credentials = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/users/:id/credentials/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    UserCredentialApi.prototype.credentials = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/credentials/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    UserCredentialApi.prototype.credentials = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/users/:id/credentials/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    UserCredentialApi.prototype.credentials = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/credentials";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    UserCredentialApi.prototype.credentials = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/credentials";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    UserCredentialApi.prototype.credentials = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/credentials";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    UserCredentialApi.prototype.credentials = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/credentials";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    UserCredentialApi.prototype.credentials = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/credentials/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `UserCredential`.
     */
    UserCredentialApi.prototype.getModelName = function () {
        return "UserCredential";
    };
    UserCredentialApi = __decorate([
        core_1.Injectable()
    ], UserCredentialApi);
    return UserCredentialApi;
}(BaseLoopBackApi));
exports.UserCredentialApi = UserCredentialApi;
/**
 * Api for the `UserIdentity` model.
 */
var UserIdentityApi = (function (_super) {
    __extends(UserIdentityApi, _super);
    function UserIdentityApi(http) {
        _super.call(this, http);
    }
    // INTERNAL. Use UserIdentity.user() instead.
    UserIdentityApi.prototype.prototype$__get__user = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userIdentities/:id/user";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserIdentity` object.)
     * </em>
     */
    UserIdentityApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/userIdentities";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserIdentity` object.)
     * </em>
     */
    UserIdentityApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/userIdentities";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Update an existing model instance or insert a new one into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserIdentity` object.)
     * </em>
     */
    UserIdentityApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/userIdentities";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Check whether a model instance exists in the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `exists` – `{boolean}` -
     */
    UserIdentityApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/userIdentities/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @param object filter Filter defining fields and include
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserIdentity` object.)
     * </em>
     */
    UserIdentityApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userIdentities/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find all instances of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserIdentity` object.)
     * </em>
     */
    UserIdentityApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userIdentities";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find first instance of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserIdentity` object.)
     * </em>
     */
    UserIdentityApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userIdentities/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * The number of instances updated
     */
    UserIdentityApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/userIdentities/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Delete a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserIdentity` object.)
     * </em>
     */
    UserIdentityApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/userIdentities/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Count instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `count` – `{number}` -
     */
    UserIdentityApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/userIdentities/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update attributes for a model instance and persist it into the data source.
     *
     * @param any id UserIdentity id
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `UserIdentity` object.)
     * </em>
     */
    UserIdentityApi.prototype.prototype$updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/userIdentities/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a change stream.
     *
     * @param object data Request data.
     *
     *  - `options` – `{object}` -
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `changes` – `{ReadableStream}` -
     */
    UserIdentityApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/userIdentities/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
    UserIdentityApi.prototype.identities = function (id, fk) {
        var method = "GET";
        var url = this.getPath() + "/users/:id/identities/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    UserIdentityApi.prototype.identities = function (id, fk) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/identities/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    UserIdentityApi.prototype.identities = function (id, fk, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/users/:id/identities/:fk";
        var urlParams = {
            id: id,
            fk: fk
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    UserIdentityApi.prototype.identities = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/identities";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    UserIdentityApi.prototype.identities = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/identities";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    UserIdentityApi.prototype.identities = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/identities";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    UserIdentityApi.prototype.identities = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/identities";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    UserIdentityApi.prototype.identities = function (id, where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/identities/count";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `UserIdentity`.
     */
    UserIdentityApi.prototype.getModelName = function () {
        return "UserIdentity";
    };
    UserIdentityApi = __decorate([
        core_1.Injectable()
    ], UserIdentityApi);
    return UserIdentityApi;
}(BaseLoopBackApi));
exports.UserIdentityApi = UserIdentityApi;
/**
 * Api for the `Prodotto` model.
 */
var ProdottoApi = (function (_super) {
    __extends(ProdottoApi, _super);
    function ProdottoApi(http) {
        _super.call(this, http);
    }
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Prodotto` object.)
     * </em>
     */
    ProdottoApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/prodotti";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Prodotto` object.)
     * </em>
     */
    ProdottoApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/prodotti";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Update an existing model instance or insert a new one into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Prodotto` object.)
     * </em>
     */
    ProdottoApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/prodotti";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Check whether a model instance exists in the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `exists` – `{boolean}` -
     */
    ProdottoApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/prodotti/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @param object filter Filter defining fields and include
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Prodotto` object.)
     * </em>
     */
    ProdottoApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/prodotti/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find all instances of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Prodotto` object.)
     * </em>
     */
    ProdottoApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/prodotti";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find first instance of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Prodotto` object.)
     * </em>
     */
    ProdottoApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/prodotti/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * The number of instances updated
     */
    ProdottoApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/prodotti/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Delete a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Prodotto` object.)
     * </em>
     */
    ProdottoApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/prodotti/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Count instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `count` – `{number}` -
     */
    ProdottoApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/prodotti/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update attributes for a model instance and persist it into the data source.
     *
     * @param any id MyProtectedPersistedModel id
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Prodotto` object.)
     * </em>
     */
    ProdottoApi.prototype.prototype$updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/prodotti/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a change stream.
     *
     * @param object data Request data.
     *
     *  - `options` – `{object}` -
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `changes` – `{ReadableStream}` -
     */
    ProdottoApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/prodotti/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `Prodotto`.
     */
    ProdottoApi.prototype.getModelName = function () {
        return "Prodotto";
    };
    ProdottoApi = __decorate([
        core_1.Injectable()
    ], ProdottoApi);
    return ProdottoApi;
}(BaseLoopBackApi));
exports.ProdottoApi = ProdottoApi;
/**
 * Api for the `Fornitore` model.
 */
var FornitoreApi = (function (_super) {
    __extends(FornitoreApi, _super);
    function FornitoreApi(http) {
        _super.call(this, http);
    }
    // INTERNAL. Use Fornitore.user() instead.
    FornitoreApi.prototype.prototype$__get__user = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/fornitori/:id/user";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Fornitore` object.)
     * </em>
     */
    FornitoreApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/fornitori";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Fornitore` object.)
     * </em>
     */
    FornitoreApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/fornitori";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Update an existing model instance or insert a new one into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Fornitore` object.)
     * </em>
     */
    FornitoreApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/fornitori";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Check whether a model instance exists in the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `exists` – `{boolean}` -
     */
    FornitoreApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/fornitori/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @param object filter Filter defining fields and include
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Fornitore` object.)
     * </em>
     */
    FornitoreApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/fornitori/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find all instances of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Fornitore` object.)
     * </em>
     */
    FornitoreApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/fornitori";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find first instance of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Fornitore` object.)
     * </em>
     */
    FornitoreApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/fornitori/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * The number of instances updated
     */
    FornitoreApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/fornitori/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Delete a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Fornitore` object.)
     * </em>
     */
    FornitoreApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/fornitori/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Count instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `count` – `{number}` -
     */
    FornitoreApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/fornitori/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update attributes for a model instance and persist it into the data source.
     *
     * @param any id MyProtectedPersistedModel id
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `Fornitore` object.)
     * </em>
     */
    FornitoreApi.prototype.prototype$updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/fornitori/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a change stream.
     *
     * @param object data Request data.
     *
     *  - `options` – `{object}` -
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `changes` – `{ReadableStream}` -
     */
    FornitoreApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/fornitori/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param number tipo
     *
     * @param number lat
     *
     * @param number lng
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `fornitori` – `{fornitore}` -
     */
    FornitoreApi.prototype.near = function (tipo, lat, lng) {
        if (tipo === void 0) { tipo = undefined; }
        if (lat === void 0) { lat = undefined; }
        if (lng === void 0) { lng = undefined; }
        var method = "GET";
        var url = this.getPath() + "/fornitori/near";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    FornitoreApi.prototype.fornitores = function (id, refresh) {
        if (refresh === void 0) { refresh = undefined; }
        var method = "GET";
        var url = this.getPath() + "/users/:id/fornitores";
        var urlParams = {
            id: id
        };
        var params = {};
        if (refresh !== undefined) {
            params.refresh = refresh;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    FornitoreApi.prototype.fornitores = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/fornitores";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    FornitoreApi.prototype.fornitores = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/users/:id/fornitores";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    FornitoreApi.prototype.fornitores = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/users/:id/fornitores";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    FornitoreApi.prototype.fornitores = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/users/:id/fornitores";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `Fornitore`.
     */
    FornitoreApi.prototype.getModelName = function () {
        return "Fornitore";
    };
    FornitoreApi = __decorate([
        core_1.Injectable()
    ], FornitoreApi);
    return FornitoreApi;
}(BaseLoopBackApi));
exports.FornitoreApi = FornitoreApi;
/**
 * Api for the `File` model.
 */
var FileApi = (function (_super) {
    __extends(FileApi, _super);
    function FileApi(http) {
        _super.call(this, http);
    }
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.getContainers = function () {
        var method = "GET";
        var url = this.getPath() + "/files";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.createContainer = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/files";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param string container
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `` – `{}` -
     */
    FileApi.prototype.destroyContainer = function (container) {
        if (container === void 0) { container = undefined; }
        var method = "DELETE";
        var url = this.getPath() + "/files/:container";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param string container
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.getContainer = function (container) {
        if (container === void 0) { container = undefined; }
        var method = "GET";
        var url = this.getPath() + "/files/:container";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param string container
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.getFiles = function (container) {
        if (container === void 0) { container = undefined; }
        var method = "GET";
        var url = this.getPath() + "/files/:container/files";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param string container
     *
     * @param string file
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.getFile = function (container, file) {
        if (container === void 0) { container = undefined; }
        if (file === void 0) { file = undefined; }
        var method = "GET";
        var url = this.getPath() + "/files/:container/files/:file";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param string container
     *
     * @param string file
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `` – `{}` -
     */
    FileApi.prototype.removeFile = function (container, file) {
        if (container === void 0) { container = undefined; }
        if (file === void 0) { file = undefined; }
        var method = "DELETE";
        var url = this.getPath() + "/files/:container/files/:file";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param object data Request data.
     *
     *  - `req` – `{object}` -
     *
     *  - `res` – `{object}` -
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `result` – `{object}` -
     */
    FileApi.prototype.upload = function (req, res) {
        if (req === void 0) { req = undefined; }
        if (res === void 0) { res = undefined; }
        var method = "POST";
        var url = this.getPath() + "/files/:container/upload";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, req);
        return result;
    };
    /**
     * <em>
           * (The remote method definition does not provide any description.)
           * </em>
     *
     * @param string container
     *
     * @param string file
     *
     * @param object req
     *
     * @param object res
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * This method returns no data.
     */
    FileApi.prototype.download = function (container, file, req, res) {
        if (container === void 0) { container = undefined; }
        if (file === void 0) { file = undefined; }
        if (req === void 0) { req = undefined; }
        if (res === void 0) { res = undefined; }
        var method = "GET";
        var url = this.getPath() + "/files/:container/download/:file";
        var urlParams = {
            container: container,
            file: file
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.create = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/files";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a new instance of the model and persist it into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.createMany = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/files";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Update an existing model instance or insert a new one into the data source.
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.upsert = function (data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/files";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Check whether a model instance exists in the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `exists` – `{boolean}` -
     */
    FileApi.prototype.exists = function (id) {
        var method = "GET";
        var url = this.getPath() + "/files/:id/exists";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @param object filter Filter defining fields and include
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.findById = function (id, filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/files/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find all instances of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object[] An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.find = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/files";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Find first instance of the model matched by filter from the data source.
     *
     * @param object filter Filter defining fields, where, include, order, offset, and limit
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.findOne = function (filter) {
        if (filter === void 0) { filter = undefined; }
        var method = "GET";
        var url = this.getPath() + "/files/findOne";
        var urlParams = {};
        var params = {};
        if (filter !== undefined) {
            params.filter = filter;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * The number of instances updated
     */
    FileApi.prototype.updateAll = function (where, data) {
        if (where === void 0) { where = undefined; }
        if (data === void 0) { data = undefined; }
        var method = "POST";
        var url = this.getPath() + "/files/update";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Delete a model instance by id from the data source.
     *
     * @param any id Model id
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.deleteById = function (id) {
        var method = "DELETE";
        var url = this.getPath() + "/files/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Count instances of the model matched by where from the data source.
     *
     * @param object where Criteria to match model instances
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `count` – `{number}` -
     */
    FileApi.prototype.count = function (where) {
        if (where === void 0) { where = undefined; }
        var method = "GET";
        var url = this.getPath() + "/files/count";
        var urlParams = {};
        var params = {};
        if (where !== undefined) {
            params.where = where;
        }
        var result = this.request(method, url, urlParams, params);
        return result;
    };
    /**
     * Update attributes for a model instance and persist it into the data source.
     *
     * @param any id MyProtectedPersistedModel id
     *
     * @param object data Request data.
     *
     * This method expects a subset of model properties as request parameters.
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * <em>
     * (The remote method definition does not provide any description.
     * This usually means the response is a `File` object.)
     * </em>
     */
    FileApi.prototype.prototype$updateAttributes = function (id, data) {
        if (data === void 0) { data = undefined; }
        var method = "PUT";
        var url = this.getPath() + "/files/:id";
        var urlParams = {
            id: id
        };
        var params = {};
        var result = this.request(method, url, urlParams, params, data);
        return result;
    };
    /**
     * Create a change stream.
     *
     * @param object data Request data.
     *
     *  - `options` – `{object}` -
     *
     * @returns object An empty reference that will be
     *   populated with the actual data once the response is returned
     *   from the server.
     *
     * Data properties:
     *
     *  - `changes` – `{ReadableStream}` -
     */
    FileApi.prototype.createChangeStream = function (options) {
        if (options === void 0) { options = undefined; }
        var method = "POST";
        var url = this.getPath() + "/files/change-stream";
        var urlParams = {};
        var params = {};
        var result = this.request(method, url, urlParams, params, options);
        return result;
    };
    /**
     * The name of the model represented by this $resource,
     * i.e. `File`.
     */
    FileApi.prototype.getModelName = function () {
        return "File";
    };
    FileApi = __decorate([
        core_1.Injectable()
    ], FileApi);
    return FileApi;
}(BaseLoopBackApi));
exports.FileApi = FileApi;
