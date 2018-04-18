/*!
 * 
 * dashboard.js v1.0 
 * Copyright (c) 2016-2017 EMQ Enterprise, Inc. (http://emqtt.io).
 * 
 */

(function (dashboard, $) {

    'use strict';

    dashboard.version = '1.0';
    var wshost = 'uuxia.cn';

    var WebAPI = function (options) {
        this.options = $.extend(
            {},
            WebAPI.DEFAULTS,
            options || {});
    };

    WebAPI.DEFAULTS = {
        apiPath: 'http://uuxia.cn:8421/',
        method: 'GET',
        cache: false,
        /*dataType: 'json',*/
        dataType: 'jsonp',
        callback: null
    };

    /** Instantiation WebAPI */
    WebAPI._instance = null;
    /**
     * Get the Instantiation WebAPI
     */
    WebAPI.getInstance = function () {
        if (!WebAPI._instance) {
            throw new Error('WebAPI is not initialized.');
        }
        return WebAPI._instance;
    };

    // WebAPI initialized
    WebAPI.init = function (options) {
        if (!WebAPI._instance) {
            WebAPI._instance = new WebAPI(options);
        }
        return WebAPI.getInstance();
    };

    // var callback = function(ret, err) {};
    WebAPI.prototype._ajax = function (path, params, callback, ajaxInfo) {
        var _this = this, options = _this.options;
        var info = {
            type: options.method,
            url: options.apiPath + path,
            data: params,
            dataType: options.dataType,
            cache: options.cache,
            success: function (ret) {
                if (!callback) {
                    return;
                }
                if ((path == 'api/remove_user'
                        || path == 'api/add_user')
                    && typeof ret == 'object'
                    && ret.status == 'failure') {
                    callback(undefined, ret);
                } else {
                    callback(ret, undefined);
                }

                // Do "options.callback" after
                // the request is successful
                if (typeof options.callback === 'function') {
                    options.callback();
                }
            },
            error: function (err) {
                if (typeof callback === 'function') {
                    callback(undefined, err);
                }
            }
        };
        $.extend(info, ajaxInfo || {});
        $.ajax(info);
    };

    $.extend(WebAPI.prototype, {
        //http://192.168.1.100:18083/api/v2/nodes/emq@127.0.0.1/subscriptions/GID@ClientID_90
        // clients
        clients: function (params, callback) {
            this._ajax('v1/mqtt/clients', params, callback);
        },

        // sessions
        sessions: function (params, callback) {
            this._ajax('v1/mqtt/clients', params, callback);
        },

        // get client's topics
        topics: function (params, callback) {
            this._ajax('v1/mqtt/topics', params, callback);
        },

        // http://uuxia.cn:8421/v1/ip/getlocationbyip?ip=61.141.158.189
        getLocation: function (params, callback) {
            this._ajax('v1/ip/getlocationbyip', params, callback);
        }
    });

    var PageInfo = function (currPage, pageSize, totalNum) {
        this.currPage = currPage;
        this.pageSize = pageSize;
        this.totalNum = totalNum;
        this.totalPage = 0;
        this.currentClient = {};
    };
    PageInfo.prototype.countTotalPage = function (totalPage) {
        if (totalPage) {
            this.totalPage = totalPage;
            return;
        }
        if (this.totalNum % this.pageSize == 0) {
            this.totalPage = this.totalNum / this.pageSize;
        } else {
            this.totalPage = this.totalNum / this.pageSize + 1;
        }
    };
    PageInfo.prototype.offsetting = function () {
        if (this.totalNum == 0) {
            return 0;
        } else {
            return (this.currPage - 1) * this.pageSize + 1;
        }
    };
    PageInfo.prototype.endNum = function () {
        if (this.totalNum == 0) {
            return 0;
        }
        if (this.currPage == this.totalPage) {
            return this.totalNum;
        } else {
            return this.offsetting() + this.pageSize - 1;
        }
    };

    PageInfo.prototype.getClient = function () {
        return this.currentClient;
    };

    // Modules save container.
    var modules = {};
    dashboard.modules = modules;

    // Overview-----------------------------------------

    // Clients------------------------------------------

    var Clients = function () {
        this.modName = 'clients';
        this.$html = $('#dashboard_clients',
            sog.mainCenter.$html);
        this.pageInfo = new PageInfo(1, 50, 0);
        this._init();
    };
    Clients.prototype._init = function () {
        var _this = this;
        loading('clients.html', function () {
            _this.vmClients = new Vue({
                el: $('#clients_list', _this.$html)[0],
                data: {
                    clientKey: null,
                    pageInfo: _this.pageInfo,
                    clients: []
                },
                methods: {
                    search: function () {
                        _this.list();
                    },
                    changeSize: function (pageSize) {
                        _this.pageInfo.pageSize = pageSize;
                        _this.pageInfo.currPage = 1;
                        _this.list();
                    },
                    go: function (currPage) {
                        _this.pageInfo.currPage = currPage;
                        _this.list();
                    },
                    getLocationById: function (id,ip) {
                        _this.getLocationById(id,ip);
                    }
                }
            });

            _this.list();
        }, _this.$html);
    };

    Clients.prototype.getLocationById = function (id,ip) {
        var _this = this;
        var params = {
            ip: ip
        };
        dashboard.webapi.getLocation(params, function (ret, err) {
            if (ret) {
                var td = document.getElementById(id);
                var rData = ret.data;
                td.innerHTML = rData.country + rData.region + rData.city;
                td.style.color = "#FF0A2C"
                td.style.fontWeight = "bold";//加粗文本
            }
        });
    };
    Clients.prototype.clear = function () {
        var _this = this;
        _this.pageInfo = new PageInfo(1, 100, 0);
        _this.vmClients.clientKey = null;
    };
    Clients.prototype.show = function () {
        this.$html.show();
    };
    Clients.prototype.hide = function () {
        this.$html.hide();
    };
    Clients.prototype.list = function () {
        var _this = this;
        var cKey = _this.vmClients.clientKey;
        _this.vmClients.clientKey = cKey ? cKey.trim() : '';
        var params = {
            page_size: _this.pageInfo.pageSize,
            curr_page: _this.pageInfo.currPage,
            client_key: _this.vmClients.clientKey
        };
        dashboard.webapi.clients(params, function (ret, err) {
            console.log("ret:" + JSON.stringify(ret) + " err:" + err)
            if (ret) {
                _this.vmClients.clients = ret.result.objects;
                _this.pageInfo.currPage = ret.result.current_page;
                _this.pageInfo.pageSize = ret.result.page_size;
                _this.pageInfo.totalNum = ret.result.total_num;
                _this.pageInfo.totalPage = ret.result.total_page;
                _this.vmClients.pageInfo = _this.pageInfo;
            }
        });
    };

    // Sessions-----------------------------------------

    var Sessions = function () {
        this.modName = 'sessions';
        this.$html = $('#dashboard_sessions',
            sog.mainCenter.$html);
        this.pageInfo = new PageInfo(1, 100, 0);
        this.client = null;
        this._init();
    };
    Sessions.prototype._init = function () {
        var _this = this;
        loading('sessions.html', function () {
            _this.vmSessions = new Vue({
                el: $('#sessions_list', _this.$html)[0],
                data: {
                    connState: false,
                    logScrollState: true,
                    logOpenState: false,
                    isStopLog: false,
                    clientKey: null,
                    pageInfo: _this.pageInfo,
                    sessions: [],
                    topics: [],
                    logTopic: '',
                    deviceLocation: '',
                    tarInfos: {
                        host: location.hostname,
                        port: 8083,
                        userName: 'admin',
                        password: 'public'
                    },

                    cInfo: {
                        host: wshost,//location.hostname,
                        port: 8083,
                        clientId: 'C_' + new Date().getTime(),
                        userName: 'admin',
                        password: 'public',
                        keepAlive: '60',
                        cleanSession: true,
                        useSSL: false
                    },
                    subInfo: {
                        topic: 'log',
                        qos: 0
                    },
                    subscriptions: [],
                    sendInfo: {
                        topic: 'log',
                        text: 'Hello log!',
                        qos: 0,
                        retained: true
                    },
                    sendMsgs: [],
                    receiveMsgs: [],
                    logMsgs: [],
                    jsonMsgs: [],
                    deviceDetail: ''
                },
                methods: {
                    connect: function () {
                        _this.connect();
                    },
                    disconnect: function () {
                        _this.disconnect();
                    },
                    search: function () {
                        _this.list();
                    },
                    chooseClient: function (cc) {
                        _this.pageInfo.currentClient = cc;
                    },
                    gernerateId: function (index) {
                        return _this.gernerateId(index);
                    },
                    logType: function (str, index, thiz) {
                        return _this.logType(str, index, thiz);
                    },
                    go: function (currPage) {
                        _this.pageInfo.currPage = currPage;
                        _this.list();
                    },
                    selectClient: function (clientId) {
                        _this.selectClient();
                    },
                    selectTopic: function (clientId) {
                        _this.selectTopic();
                    },
                    sub: function () {
                        _this.subscribe();
                    },
                    unsub: function () {
                        _this.unsubscribe()
                    },
                    onScroll: function () {
                        _this.onScroll();
                    },
                    stopScroll: function () {
                        _this.stopScroll();
                    },
                    onSaveLog: function () {
                        _this.onSaveLog();
                    },
                    onClearLog: function () {
                        _this.onClearLog();
                    },
                    onMouseWheel: function () {
                    },
                    onOpenLog: function () {
                        _this.onOpenLog();
                    },
                    requestDetail: function () {
                        _this.requestDetail();
                    },
                    reboot: function () {
                        _this.reboot();
                    },
                    logctrl: function () {
                        _this.logctrl();
                    },
                    onRefresh: function () {
                        _this.list();
                        _this.vmSessions.deviceDetail = '';
                    },
                    onSwMqttServer: function () {
                        _this.onSwMqttServer();
                    },
                    cacheLog: function () {
                        _this.cacheLog();
                    },
                    clsCache: function () {
                        _this.clsCache();
                    }
                }
            });

            _this.list();
        }, _this.$html);
    };

    Sessions.prototype.clear = function () {
        var _this = this;
        _this.pageInfo = new PageInfo(1, 100, 0);
        _this.vmSessions.clientKey = null;
    };
    Sessions.prototype.show = function () {
        this.$html.show();
    };
    Sessions.prototype.hide = function () {
        this.$html.hide();
    };

    Sessions.prototype.scrollUI = function () {
        var _this = this;
        var content = document.getElementById('container');
        if (_this.vmSessions.logScrollState) {
            content.scrollTop = content.scrollHeight;
        }
    };

    Sessions.prototype.onSaveLog = function () {
        var _this = this;
        var arrays = _this.vmSessions.logMsgs;
        var string = arrays.join("\r\n");
        saveLogFile(string);
    };
    Sessions.prototype.onClearLog = function () {
        var _this = this;
        _this.vmSessions.receiveMsgs = [];
        _this.vmSessions.logMsgs = [];
    };

    Sessions.prototype.onOpenLog = function () {
        var _this = this;
        if (!_this.client || !_this.client.isConnected()) {
            _this.connect();
        } else {
            if (!_this.vmSessions.logOpenState) {
                if (_this.vmSessions.logTopic) {
                    _this.vmSessions.subInfo.topic = _this.vmSessions.logTopic;
                    _this.subscribe();
                }
            }
        }
    };

    Sessions.prototype.cacheLog = function () {
        var _this = this;
        var json = {"type": 4};
        var str = JSON.stringify(json);
        _this.vmSessions.sendInfo.text = str;
        console.log('===========================cacheLog===================================' + str)
        _this.sendMessage();
        _this.requestDetail();
    };

    Sessions.prototype.clsCache = function () {
        var _this = this;
        var json = {"type": 5};
        var str = JSON.stringify(json);
        _this.vmSessions.sendInfo.text = str;
        console.log('===========================clsCache===================================' + str)
        _this.sendMessage();
        _this.requestDetail();
    };

    Sessions.prototype.onSwMqttServer = function () {
        var r = confirm("是否决定确定MQTT服务器，请慎重思考!!!");
        if (r) {
            var _this = this;
            var json = {
                "type": 3,
                "data": {
                    "host": _this.vmSessions.tarInfos.host,
                    "port": _this.vmSessions.tarInfos.port,
                    "username": _this.vmSessions.tarInfos.userName,
                    "password": _this.vmSessions.tarInfos.password
                }
            };
            var str = JSON.stringify(json);
            _this.vmSessions.sendInfo.text = str;
            console.log('===========================onSwMqttServer===================================' + str)
            _this.sendMessage();
        } else {
        }
        _this.requestDetail();
    };

    Sessions.prototype.logctrl = function () {
        var _this = this;
        var json = {"type": 2};
        if (_this.vmSessions.isStopLog) {
            json = {"type": 2, "data": "on"};
            _this.vmSessions.isStopLog = false;
        } else {
            json = {"type": 2, "data": "off"};
            _this.vmSessions.isStopLog = true;
        }
        var str = JSON.stringify(json);
        console.log(str);
        _this.vmSessions.sendInfo.text = str;
        _this.vmSessions.sendInfo.topic = _this.pageInfo.currentClient.client_id + "/client";
        _this.sendMessage();
    };

    Sessions.prototype.reboot = function () {
        var _this = this;
        var json = {"type": 1};
        var str = JSON.stringify(json);
        _this.vmSessions.sendInfo.text = str;
        _this.vmSessions.sendInfo.topic = _this.pageInfo.currentClient.client_id + "/client";
        console.log('===========================reboot===================================')
        _this.sendMessage();
        _this.requestDetail();
    };

    Sessions.prototype.requestDetail = function () {
        var _this = this;
        var json = {"type": 0};
        var str = JSON.stringify(json);
        _this.vmSessions.sendInfo.text = str;
        _this.vmSessions.sendInfo.topic = _this.pageInfo.currentClient.client_id + "/client";
        _this.sendMessage();
    };

    Sessions.prototype.gernerateId = function (index) {
        var id = "uuxia_id_" + index;
        //console.log('==========================gernerateId='+id)
        return id;
    };
    Sessions.prototype.logType = function (str, index, thiz) {
        var _this = this;
        var tabName = thiz.$forContext.el.children[0];

        var info = /^\d{2}\-\d{2}\s\d{2}:\d{2}:\d{2}.\d{3}\sI/;
        var debug = /^\d{2}\-\d{2}\s\d{2}:\d{2}:\d{2}.\d{3}\sD/;
        var warm = /^\d{2}\-\d{2}\s\d{2}:\d{2}:\d{2}.\d{3}\sW/;
        var error = /^\d{2}\-\d{2}\s\d{2}:\d{2}:\d{2}.\d{3}\sE/;
        if (info.test(str)) {
            tabName.style.color = "#038856"
            tabName.style.fontWeight = "bold";//加粗文本
        } else if (debug.test(str)) {
            tabName.style.color = "#1012FF"
        } else if (warm.test(str)) {
            tabName.style.color = "#ff7f50"
        } else if (error.test(str)) {
            tabName.style.color = "#FF0A2C"
            tabName.style.fontWeight = "bold";//加粗文本
        } else {
            tabName.style.color = "#0A080E"
        }
        tabName.innerHTML = str;
        return str;//'uu'+index;
    };

    Sessions.prototype.onScroll = function () {
        var _this = this;
        _this.vmSessions.logScrollState = true;
    };

    Sessions.prototype.stopScroll = function () {
        var _this = this;
        _this.vmSessions.logScrollState = false;
    };
    Sessions.prototype.newClient = function () {
        this.client = new Paho.MQTT.Client(
            this.vmSessions.cInfo.host,
            Number(this.vmSessions.cInfo.port),
            this.vmSessions.cInfo.clientId);
    };
    Sessions.prototype.sslPort = function () {
        var useSSL = this.vmSessions.cInfo.useSSL;
        if (useSSL) {
            this.vmSessions.cInfo.port = 8084
        } else {
            this.vmSessions.cInfo.port = 8083
        }
    };
    Sessions.prototype.connect = function () {
        var _this = this;
        _this.newClient();

        if (!_this.client) {
            return;
        }
        // called when the client loses its connection
        _this.client.onConnectionLost = function (responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost: " + responseObject.errorMessage);
            }
            _this.disconnect();
        }
        // called when a message arrives
        _this.client.onMessageArrived = function (message) {
            // console.log("onMessageArrived: " + message.payloadString);
            message.arrived_at = (new Date()).format("yyyy-MM-dd hh:mm:ss");
            try {
                message.msgString = message.payloadString;
            } catch (e) {
                message.msgString = "Binary message(" + message.payloadBytes.length + ")";
            }
            _this.vmSessions.receiveMsgs.push(message);
            var payloadString = message.payloadString;
            try {
                var json = JSON.parse(payloadString);
                console.log("####Json格式: " + payloadString);
                _this.vmSessions.jsonMsgs.push(json);
                var type = json.type;
                if (type == 0) {
                    _this.vmSessions.deviceDetail = json.data;
                }
            } catch (e) {
                console.log("####非Json格式: " + payloadString);
            }
            _this.vmSessions.logMsgs.push(payloadString);
            _this.scrollUI();
        }

        var options = {
            onSuccess: function () {
                console.log("The client connect success.");
                _this.vmSessions.connState = true;
                if (_this.vmSessions.logTopic) {
                    _this.vmSessions.subInfo.topic = _this.vmSessions.logTopic;
                    _this.subscribe();

                    _this.requestDetail();
                }
            },
            onFailure: function (err) {
                alert("The client connect failure " + err.errorMessage);
                // console.log("==========." + err.errorMessage);
                // console.log("==========." + JSON.stringify(err));
                // console.log("The client connect failure.");
                _this.vmSessions.connState = false;
            }
        };
        var userName = _this.vmSessions.cInfo.userName;
        var password = _this.vmSessions.cInfo.password;
        var keepAlive = _this.vmSessions.cInfo.keepAlive;
        var cleanSession = _this.vmSessions.cInfo.cleanSession;
        var useSSL = _this.vmSessions.cInfo.useSSL;
        if (userName) {
            options.userName = userName;
        }
        if (password) {
            options.password = password;
        }
        if (keepAlive) {
            options.keepAliveInterval = Number(keepAlive);
        }
        options.cleanSession = cleanSession;
        options.useSSL = useSSL;
        _this.client.connect(options);
    };

    Sessions.prototype.disconnect = function () {
        var _this = this;
        if (_this.client && _this.client.isConnected()) {
            _this.client.disconnect();
            _this.client = null;
        }
        console.log("The client disconnect success.");
        _this.vmSessions.connState = false;
        _this.vmSessions.logOpenState = false;
    };

    Sessions.prototype.subscribe = function () {
        var _this = this;
        if (!_this.client || !_this.client.isConnected()) {
            alert('subscribe The client does not connect to the broker');
            return;
        }
        if (!_this.vmSessions.subInfo.topic) {
            alert('subscribe Please fill in the topic.');
            return;
        }
        this.client.subscribe(_this.vmSessions.subInfo.topic, {
            qos: Number(_this.vmSessions.subInfo.qos),
            onSuccess: function (msg) {
                console.log(JSON.stringify(msg));
                _this.vmSessions.subInfo.time = (new Date()).format("yyyy-MM-dd hh:mm:ss");
                _this.vmSessions.subscriptions.push(_this.vmSessions.subInfo);
                //_this.vmSessions.subInfo = {qos: _this.vmSessions.subInfo.qos};
                if (_this.vmSessions.subInfo.topic == _this.vmSessions.logTopic) {
                    _this.vmSessions.logOpenState = true;
                }
            },
            onFailure: function (err) {
                if (err.errorCode[0] == 128) {
                    alert('The topic cannot SUBSCRIBE for ACL Deny');
                    console.log(JSON.stringify(err));
                }
            }
        });
    };
    Sessions.prototype.unsubscribe = function () {
        var _this = this;
        if (!_this.client || !_this.client.isConnected()) {
            alert('unsubscribe The client does not connect to the broker');
            return;
        }
        if (!_this.vmSessions.subInfo.topic) {
            alert('unsubscribe Please fill in the topic.' + _this.vmSessions.subInfo.topic);
            return;
        }
        this.client.unsubscribe(_this.vmSessions.subInfo.topic, {
            onSuccess: function (msg) {
                console.log(JSON.stringify(msg));
                if (_this.vmSessions.subInfo.topic == _this.vmSessions.logTopic) {
                    _this.vmSessions.logOpenState = false;
                }
                // _this.vmSessions.subInfo = {qos: _this.vmSessions.subInfo.qos};
            },
            onFailure: function (err) {
                console.log(JSON.stringify(err));
            }
        });
    };
    Sessions.prototype.sendMessage = function () {
        var _this = this;
        var text = _this.vmSessions.sendInfo.text;
        if (!_this.client || !_this.client.isConnected()) {
            alert('sendMessage The client does not connect to the broker');
            return;
        }
        if (!_this.vmSessions.sendInfo.topic) {
            alert('Please fill in the message topic.');
            return;
        }
        if (!text) {
            alert('Please fill in the message content.');
            return;
        }
        var message = new Paho.MQTT.Message(text);
        message.destinationName = _this.vmSessions.sendInfo.topic;
        message.qos = Number(_this.vmSessions.sendInfo.qos);
        message.retained = _this.vmSessions.sendInfo.retained;
        _this.client.send(message);
        _this.vmSessions.sendInfo.time = (new Date()).format("yyyy-MM-dd hh:mm:ss");
        _this.vmSessions.sendMsgs.push(this.vmSessions.sendInfo);
        _this.vmSessions.sendInfo = {
            topic: _this.vmSessions.sendInfo.topic,
            qos: _this.vmSessions.sendInfo.qos,
            retained: _this.vmSessions.sendInfo.retained
        };
    };

    Sessions.prototype.getLocaionByIp = function (ip) {
        var _this = this;
        var params = {
            ip: ip
        };
        dashboard.webapi.getLocation(params, function (ret, err) {
            console.log("#### getLocaionByIp :" + JSON.stringify(ret) + " err:" + err)
            if (ret) {
                var rData = ret.data;
                _this.vmSessions.deviceLocation = rData.country + rData.region + rData.city;
            }
        });
    };

    Sessions.prototype.selectClient = function () {
        var _this = this;
        var myselect = document.getElementById("client_select_id");
        var index = myselect.selectedIndex;
        var curClient = _this.vmSessions.sessions[index];
        _this.pageInfo.currentClient = curClient;
        _this.vmSessions.logTopic = 'log/' + _this.pageInfo.currentClient.client_id;
        _this.getLocaionByIp(curClient.ipaddress);
        var params = {
            client_id: curClient.client_id
        };
        dashboard.webapi.topics(params, function (ret, err) {
            console.log("#### getTopics :" + JSON.stringify(ret) + " err:" + err)
            if (ret) {
                // _this.vmSessions.topics = ret.result;
                _this.vmSessions.topics = ret.result.objects;
            }
        });
    };

    Sessions.prototype.selectTopic = function () {
        var _this = this;
        var myselect = document.getElementById("topic_list");
        var index = myselect.selectedIndex;
        var currentTopic = _this.vmSessions.topics[index];
        _this.vmSessions.subInfo.topic = currentTopic.topic;
    };

    Sessions.prototype.list = function () {
        var _this = this;
        var cKey = _this.vmSessions.clientKey;
        _this.vmSessions.clientKey = cKey ? cKey.trim() : '';
        var params = {
            page_size: _this.pageInfo.pageSize,
            curr_page: _this.pageInfo.currPage,
            client_key: _this.vmSessions.clientKey
        };
        dashboard.webapi.sessions(params, function (ret, err) {
            if (ret) {
                _this.vmSessions.sessions = ret.result.objects;
                _this.pageInfo.currPage = ret.result.current_page;
                _this.pageInfo.pageSize = ret.result.page_size;
                _this.pageInfo.totalNum = ret.result.total_num;
                _this.pageInfo.totalPage = ret.result.total_page;
                _this.vmSessions.pageInfo = _this.pageInfo;

                var curClient = _this.vmSessions.sessions[0];
                _this.pageInfo.currentClient = curClient;
                _this.vmSessions.logTopic = 'log/' + _this.pageInfo.currentClient.client_id;
                _this.vmSessions.subInfo.topic = _this.vmSessions.logTopic;
                _this.getLocaionByIp(curClient.ipaddress);
                var params = {
                    client_id: curClient.client_id
                };
                dashboard.webapi.topics(params, function (ret, err) {
                    console.log("#### getTopics :" + JSON.stringify(ret) + " err:" + err)
                    if (ret) {
                        _this.vmSessions.topics = ret.result.objects;
                        var currentTopic = _this.vmSessions.topics[0];
                        console.log("#### currentTopic :" + currentTopic.topic);
                    }
                });
            }
        });
    };
    // Websocket----------------------------------------

    var Websocket = function () {
        this.modName = 'websocket';
        this.$html = $('#dashboard_websocket',
            sog.mainCenter.$html);
        this.client = null;
        this._init();
    };
    Websocket.prototype._init = function () {
        var _this = this;
        loading('websocket.html', function () {
            _this.vmWS = new Vue({
                el: _this.$html[0],
                data: {
                    connState: false,
                    cInfo: {
                        host: wshost,//location.hostname,
                        port: 8083,
                        clientId: 'C_' + new Date().getTime(),
                        userName: null,
                        password: null,
                        keepAlive: null,
                        cleanSession: true,
                        useSSL: false
                    },
                    subInfo: {
                        topic: 'world',
                        qos: 0
                    },
                    subscriptions: [],
                    sendInfo: {
                        topic: 'world',
                        text: 'Hello world!',
                        qos: 0,
                        retained: true
                    },
                    sendMsgs: [],
                    receiveMsgs: []
                },
                filters: {
                    reverse: function (arr) {
                        return arr.reverse();
                    }
                },
                methods: {
                    connect: function () {
                        _this.connect();
                    },
                    disconnect: function () {
                        _this.disconnect();
                    },
                    sub: function () {
                        _this.subscribe();
                    },
                    unsub: function () {
                        _this.unsubscribe();
                    },
                    send: function () {
                        _this.sendMessage();
                    },
                    sslPort: function () {
                        _this.sslPort();
                    }
                }
            });
        }, _this.$html);
    };
    Websocket.prototype.show = function () {
        if (this.client && !this.client.isConnected()) {
            this.disconnect();
        }
        this.$html.show();
    };
    Websocket.prototype.hide = function () {
        this.$html.hide();
    };
    Websocket.prototype.newClient = function () {
        this.client = new Paho.MQTT.Client(
            this.vmWS.cInfo.host,
            Number(this.vmWS.cInfo.port),
            this.vmWS.cInfo.clientId);
    };
    Websocket.prototype.sslPort = function () {
        var useSSL = this.vmWS.cInfo.useSSL;
        if (useSSL) {
            this.vmWS.cInfo.port = 8084
        } else {
            this.vmWS.cInfo.port = 8083
        }
    };
    Websocket.prototype.connect = function () {
        var _this = this;
        _this.newClient();

        if (!_this.client) {
            return;
        }
        // called when the client loses its connection
        _this.client.onConnectionLost = function (responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost: " + responseObject.errorMessage);
            }
            _this.disconnect();
        }
        // called when a message arrives
        _this.client.onMessageArrived = function (message) {
            // console.log("onMessageArrived: " + message.payloadString);
            message.arrived_at = (new Date()).format("yyyy-MM-dd hh:mm:ss");
            try {
                message.msgString = message.payloadString;
            } catch (e) {
                message.msgString = "Binary message(" + message.payloadBytes.length + ")";
            }
            _this.vmWS.receiveMsgs.push(message);
        }

        var options = {
            onSuccess: function () {
                console.log("The client connect success.");
                _this.vmWS.connState = true;
            },
            onFailure: function (err) {
                alert("The client connect failure " + err.errorMessage);
                // console.log("==========." + err.errorMessage);
                // console.log("==========." + JSON.stringify(err));
                // console.log("The client connect failure.");
                _this.vmWS.connState = false;
            }
        };
        var userName = _this.vmWS.cInfo.userName;
        var password = _this.vmWS.cInfo.password;
        var keepAlive = _this.vmWS.cInfo.keepAlive;
        var cleanSession = _this.vmWS.cInfo.cleanSession;
        var useSSL = _this.vmWS.cInfo.useSSL;
        if (userName) {
            options.userName = userName;
        }
        if (password) {
            options.password = password;
        }
        if (keepAlive) {
            options.keepAliveInterval = Number(keepAlive);
        }
        options.cleanSession = cleanSession;
        options.useSSL = useSSL;
        _this.client.connect(options);
    };
    Websocket.prototype.disconnect = function () {
        var _this = this;
        if (_this.client && _this.client.isConnected()) {
            _this.client.disconnect();
            _this.client = null;
        }
        console.log("The client disconnect success.");
        _this.vmWS.connState = false;
    };
    Websocket.prototype.subscribe = function () {
        var _this = this;
        if (!_this.client || !_this.client.isConnected()) {
            alert('The client does not connect to the broker');
            return;
        }
        if (!_this.vmWS.subInfo.topic) {
            alert('Please fill in the topic.');
            return;
        }

        this.client.subscribe(_this.vmWS.subInfo.topic, {
            qos: Number(_this.vmWS.subInfo.qos),
            onSuccess: function (msg) {
                console.log(JSON.stringify(msg));
                _this.vmWS.subInfo.time = (new Date()).format("yyyy-MM-dd hh:mm:ss");
                _this.vmWS.subscriptions.push(_this.vmWS.subInfo);
                _this.vmWS.subInfo = {qos: _this.vmWS.subInfo.qos};
            },
            onFailure: function (err) {
                if (err.errorCode[0] == 128) {
                    alert('The topic cannot SUBSCRIBE for ACL Deny');
                    console.log(JSON.stringify(err));
                }
            }
        });
    };
    Websocket.prototype.unsubscribe = function () {
        var _this = this;
        if (!_this.client || !_this.client.isConnected()) {
            alert('The client does not connect to the broker');
            return;
        }
        if (!_this.vmWS.subInfo.topic) {
            alert('Please fill in the topic.');
            return;
        }
        this.client.unsubscribe(_this.vmWS.subInfo.topic, {
            onSuccess: function (msg) {
                console.log(JSON.stringify(msg));
                _this.vmWS.subInfo = {qos: _this.vmWS.subInfo.qos};
            },
            onFailure: function (err) {
                console.log(JSON.stringify(err));
            }
        });
    };
    Websocket.prototype.sendMessage = function () {
        var _this = this;
        var text = _this.vmWS.sendInfo.text;
        if (!_this.client || !_this.client.isConnected()) {
            alert('The client does not connect to the broker');
            return;
        }
        if (!_this.vmWS.sendInfo.topic) {
            alert('Please fill in the message topic.');
            return;
        }
        if (!text) {
            alert('Please fill in the message content.');
            return;
        }
        var message = new Paho.MQTT.Message(text);
        message.destinationName = _this.vmWS.sendInfo.topic;
        message.qos = Number(_this.vmWS.sendInfo.qos);
        message.retained = _this.vmWS.sendInfo.retained;
        _this.client.send(message);
        _this.vmWS.sendInfo.time = (new Date()).format("yyyy-MM-dd hh:mm:ss");
        _this.vmWS.sendMsgs.push(this.vmWS.sendInfo);
        _this.vmWS.sendInfo = {
            topic: _this.vmWS.sendInfo.topic,
            qos: _this.vmWS.sendInfo.qos,
            retained: _this.vmWS.sendInfo.retained
        };
    };

    // Users---------------------------------------------

    // HttpApi-------------------------------------------

    // Functions----------------------------------------

    var hideAllMods = function () {
        for (var key in modules) {
            var m = modules[key];
            m.hide();
        }
    };
    var loading = function (mod, fun, $html) {
        sog.loadingBar.show({
            pct: 100,
            delay: 0.5,
            finish: function (pct) {
                // $html.empty().append(
                // '<div class="page-loading-overlay">\
                // <div class="loader-2"></div></div>');
                $html.load(mod, function () {
                    fun();
                    sog.mainFooter.toBottom();
                });
            }
        });
    };
    var showCurrUser = function () {
        dashboard.webapi.user_curr(function (ret, err) {
            if (ret) {
                $('#current_user', sog.mainContent.$html)
                    .text(ret.username);
            }
        });
    };

    var showCurrNode = function () {
        dashboard.webapi.node_curr(function (ret, err) {
            if (ret) {
                $('#current_node', sog.mainContent.$html)
                    .text(ret.node);
            }
        });
    };


    var clearAuth = function () {
        if (modules.overview) {
            window.clearInterval(modules.overview.timertask);
        }
        var f = false;
        try {
            f = document.execCommand('ClearAuthenticationCache');
        } catch (e) {
        }
        if (f) {
            window.location.href = '/';
            return;
        }
        dashboard.webapi.logout(function (ret, err) {
            window.location.href = '/';
        });
        window.setTimeout(function () {
            window.location.href = '/';
        }, 800);
    };
    var openModule = function (modName, keyword) {
        hideAllMods();
        activeMenu(modName);

        switch (modName) {
            case 'overview':
                if (!modules.overview) {
                    modules.overview = new Overview();
                }
                modules.overview.show();
                break;
            case 'clients':
                if (!modules.clients) {
                    modules.clients = new Clients();
                } else {
                    modules.clients.clear();
                    modules.clients.list();
                }
                modules.clients.show();
                break;
            case 'sessions':
                if (!modules.sessions) {
                    modules.sessions = new Sessions();
                } else {
                    modules.sessions.clear();
                    modules.sessions.list();
                }
                modules.sessions.show();
                break;
            case 'topics':
                if (!modules.topics) {
                    modules.topics = new Topics();
                } else {
                    modules.topics.clear();
                    modules.topics.list();
                }
                modules.topics.show();
                break;
            case 'routes':
                if (!modules.routes) {
                    modules.routes = new Routes();
                } else {
                    modules.routes.clear();
                    modules.routes.list();
                }
                modules.routes.show();
                break;
            case 'subscriptions':
                if (!modules.subscriptions) {
                    modules.subscriptions = new Subscriptions(keyword);
                } else {
                    modules.subscriptions.clear(keyword);
                    modules.subscriptions.list();
                }
                modules.subscriptions.show();
                break;
            case 'alarms':
                if (!modules.alarms) {
                    modules.alarms = new Alarms();
                } else {
                    modules.alarms.list();
                }
                modules.alarms.show();
                break;
            case 'plugins':
                if (!modules.plugins) {
                    modules.plugins = new Plugins();
                } else {
                    modules.plugins.list();
                }
                modules.plugins.show();
                break;
            case 'websocket':
                if (!modules.websocket) {
                    modules.websocket = new Websocket();
                }
                modules.websocket.show();
                break;
            case 'users':
                if (!modules.users) {
                    modules.users = new Users();
                } else {
                    modules.users.list();
                }
                modules.users.show();
                break;
            case 'http_api':
                if (!modules.httpApi) {
                    modules.httpApi = new HttpApi();
                }
                modules.httpApi.show();
                break;
            default:
                break;
        }
    };
    var registerEvent = function () {
        var $main = sog.mainContent.$html;
        var $menu = sog.sidebarMenu.$html;

        $('#logout', $main).on('click', function (ev) {
            ev.preventDefault();
            clearAuth();
        });

        $('#main-menu>li', $menu).each(function () {
            $(this).click(function () {
                openModule($(this).attr('module'));
            });
        });
    };
    var activeMenu = function (modName) {
        if (modName == 'websocket') {
            if (!window.WebSocket) {
                var msg = "WebSocket not supported by this browser.";
                alert(msg);
                throw new Error(msg);
            }
        }
        $('#main-menu>li').each(function () {
            var $m = $(this);
            $m.removeClass('active');
            var mod = $m.attr('module');
            if (mod == modName) {
                $m.addClass('active');
            }
        });
    };

    dashboard.init = function (url) {
        var _this = this;
        //location.hostname  = 'uuxia.cn';
        _this.webapi = WebAPI.init({
            callback: function () {
                sog.mainFooter.toBottom();
            }
        });

        //showCurrUser();
        //showCurrNode();
        // Register menu event.
        registerEvent();
        // Show main center content.
        var strs = url.split('#');
        if (strs.length == 1) {
            openModule('clients');
            return;
        }
        openModule(strs[1].substring(1));
    };

})((function () {
    if (!window.dashboard) {
        window.dashboard = {}
    }
    return window.dashboard;
})(), jQuery);
