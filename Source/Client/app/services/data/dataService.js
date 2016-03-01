(function () {
    'use strict';

    var serviceId = 'dataService';
    angular.module('app.services.data').factory(serviceId, ['$http', 'config', 'repositories', 'common', function ($http, config, repositories, common) {
        var that = this;
        var logError = common.logger.getLogFn(this.serviceId, 'error', 'config');
        var _baseUrl = config.remoteServiceName;
        var _baseApiUrl = _baseUrl + "api/dna/";
        var _endpoint = '';

        var service = function (endpoint) {
            _endpoint = endpoint;

            this['delete'] = function (id) {
                return $http.delete(_baseUrl + endpoint + '(' + id + ')');
            };

            this.deleteByString = function (id) {
                return $http.delete(_baseUrl + endpoint + "('" + id + "')");
            };

            this.deleteByGuid = function (id) {
                return $http.delete(_baseUrl + endpoint + "(" + id + ")");
            };

            this.post = function (entity) {
                return $http.post(_baseUrl + endpoint, entity);
            };

            this.postApi = function (api, entity) {
                var url = _baseApiUrl + api;
                return $http.post(url, entity);
            };

            this.put = function (id, entity) {
                return $http.put(_baseUrl + endpoint + '(' + id + ')', entity);
            };

            this.putByString = function (id, entity) {
                return $http.put(_baseUrl + endpoint + "('" + id + "')", entity);
            };

            this.putByGuid = function (id, entity) {
                return $http.put(_baseUrl + endpoint + "(" + id + ")", entity);
            };

            this.patchByGuid = function (id, entity) {
                // return $http.patch(_baseUrl + endpoint + "(" + id + ")", entity);
                return $http({ method: 'Patch', url: _baseUrl + endpoint, data: { id: id, entity: entity } });
            };

            this.get = function (query) {
                var url = _baseUrl + endpoint + '?';
                return $http.get(query ? url + query.toString() : url);
            };

            this.getApi = function (api) {
                var url = _baseApiUrl + api;
                return $http.get(url);
            };

            this.getById = function (id) {
                return $http.get(_baseUrl + endpoint + '(' + id + ')');
            }

            this.createNewEntity = function () {
                return $http.get(_baseUrl + endpoint + '(' + common.emptyGuid + ')');
            }

            this.getByIdString = function (id) {
                return $http.get(_baseUrl + endpoint + "('" + id + "')");
            }

            this.getByIdGuid = function (id) {

                return $http.get(_baseUrl + endpoint + "(" + id + ")");
            }

            this.postFunction = function (functionName, data) {
                return $http.post(_baseUrl + endpoint + '/' + functionName, data);
            }

            this.deleteFunction = function (functionName, data) {
                return $http.delete(_baseUrl + endpoint + '/' + functionName, data);
            }

            this.entityAction = function (id, actionName, data) {
                return $http.post(_baseUrl + endpoint + '(' + id + ')/' + actionName, data);
            }

            this.entityFunction = function (id, actionName) {
                return $http.get(_baseUrl + endpoint + '(' + id + ')/' + actionName);
            }

            this.collectionFunction = function (actionName) {
                return $http.get(_baseUrl + endpoint + '/' + actionName);
            }

            this.getAll = function (forceRemote, orderBy, orderDesc, page, size, nameFilter, filterValue) {
                var take = size || 20;
                var skip = page ? (page - 1) * size : 0;
                var query = new that.query();
                var entityOrderBy = orderBy;
                if (orderDesc) {
                    entityOrderBy = orderBy + ' ' + orderDesc;
                }

                if (filterValue) {
                    query.filter("contains(" + nameFilter + ",'" + filterValue + "') ");
                }

                query.orderby(entityOrderBy).take(take).skip(skip);
                var url = _baseUrl + endpoint + '?';
                return $http.get(url + query.toString()).then(querySucceeded).catch(queryFailed);

                function querySucceeded(data) {
                    return data.data.value;
                }
            }

            this.getAllWithoutPaging = function (orderBy, expandBy) {
                var query = new that.query();
                if (orderBy && orderBy != '' && orderBy != null)
                {
                    query.orderby(orderBy);
                }

                if (expandBy && expandBy != '' && expandBy != null) {
                    query.expand(expandBy);
                }

                var url = _baseUrl + endpoint + '?';
                return $http.get(url + query.toString()).then(querySucceeded).catch(queryFailed);

                function querySucceeded(data) {
                    return data.data.value;
                }
            }

            this.getAllWithCustomExpand = function (forceRemote, orderBy, orderDesc, page, size, nameFilter, filterValue, customExpand) {
                var take = size || 20;
                var skip = page ? (page - 1) * size : 0;
                var query = new that.query();
                var entityOrderBy = orderBy;
                if (orderDesc) {
                    entityOrderBy = orderBy + ' ' + orderDesc;
                }

                if (orderDesc) { entityOrderBy = orderBy + ' ' + orderDesc; }
                if (filterValue) {
                    query.filter("contains(" + nameFilter + ",'" + filterValue + "') ");
                }

                query.orderby(entityOrderBy).take(take).skip(skip);
                var url = _baseUrl + endpoint + '?';
                return $http.get(url + query.toString() + customExpand).then(querySucceeded).catch(queryFailed);

                function querySucceeded(data) {
                    return data.data.value;
                }
            }

            this.getCount = function (nameFilter, filterValue) {
                var url = _baseUrl + endpoint + '/$count/?';
                var query = new that.query();
                if (filterValue) {
                    query.filter("contains(" + nameFilter + ",'" + filterValue + "') ");
                    return $http.get(url + query.toString()).then(querySucceeded).catch(queryFailed);
                } else {
                    return $http.get(url).then(querySucceeded).catch(queryFailed);
                }

                function querySucceeded(response) {
                    return response.data;
                };
            }

            var queryFailed = function (error) {
                if (error.status != 401) {
                    var msg = config.appErrorPrefix + 'Error retrieving data. ' + error.message;
                    logError(msg, error);
                    throw error;
                }
            }
        };

        this.query = function () {
            var _orderby = '';
            var _filter = '';
            var _expand = '';
            var _skip = 0;
            var _take = 0;
            var _select = '';

            this.orderby = function (orderby) {
                _orderby = orderby;
                return this;
            };

            this.filter = function (filter) {
                _filter = filter;
                return this;
            };

            this.take = function (take) {
                _take = take;
                return this;
            };

            this.skip = function (skip) {
                _skip = skip;
                return this;
            };

            this.expand = function (expand) {
                _expand = expand;
                return this;
            };

            this.select = function (select) {
                _select = select;
                return this;
            }

            this.toString = function () {
                var url = '';

                if (_filter)
                    url += "$filter=" + _filter + "&";

                if (_orderby)
                    url += '$orderby=' + _orderby + '&';

                if (_skip > 0)
                    url += '$skip=' + _skip + '&';

                if (_take > 0)
                    url += '$top=' + _take + '&';

                if (_expand)
                    url += '$expand=' + _expand + '&';

                if (_select)
                    url += '$select=' + _select + '&';

                url += '$count=true';
                return url;
            };
        };

        service.query = this.query;
        return service;
    }]);
}());