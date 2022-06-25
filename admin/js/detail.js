var deviceObj;
var isconnect = false;
function addScript(url){
    document.write("<script language=javascript src="+url+"></script>");
}
addScript('../js/cookie.js');
var host = localStorage.getItem("apihost");
$(document).ready(function() {
    console.log("###ready#页面已加载！"+host);
    //var deviceid = $.query.get("deviceid");
    var json = '{"code":2000,"data":"ifconfig"}'
    document.getElementById("cmd_id").value = json
    if (isLogin()) {
        connect(wshost);
        var device = sessionStorage.getItem('device');//获取键为allJson的字符串
        deviceObj = JSON.parse(device);//将字符串抓换成对象
        if(deviceObj === null){
            window.location.href = 'index.html'
        }else{
            document.title = '设备详情[' + deviceObj.deviceId + ']'
            // for (let index = 0; index < 100; index++) {
            //     showLog('尊敬的幼儿园园长朋友' + index)
            // }
            displayDetail(deviceObj);
        }
    }else{
        console.log("###ready# 未登录，请登陆");
        window.location.href = '../index.html'
    }
});

function postws(value){
    jQuery.ajax({
        //提交的网址
        type: 'POST',
        url: host + "/v1/api/device/ws",
        data: value,
        contentType: "application/x-www-form-urlencoded",
        dataType: 'json',
        success: function(results) {
            console.log("####login " + JSON.stringify(results));
            toast(JSON.stringify(results));
            showLog(JSON.stringify(results));
        }
    });
}

function getText() {
    return $("#txtContent").html();
}

function onReboot(){
    var json = {"code": 2000,"data": "reboot"}
    var value = { "json": JSON.stringify(json),"deviceid": deviceObj.deviceId };
    console.log('onReboot',value);
    showLog(JSON.stringify(value));
    postws(value);
}

function onUpgrade(){
    var json = {"code": 2002, "data": {"binurl": "http://uuxia.cn/file/abss/" + deviceObj.osType +"/libabss.so"}}
    var value = { "json": JSON.stringify(json),"deviceid": deviceid };
    console.log('onReboot',value);
    showLog(JSON.stringify(value));
    postws(value);
}

function onExit(){
    var json = {"code": 2000,"data": "exit_app"}
    var value = { "json": JSON.stringify(json),"deviceid": deviceObj.deviceId };
    console.log('onExit',value);
    showLog(JSON.stringify(value));
    postws(value);
}


function onExecute(){
    var value = { "json": document.getElementById('cmd_id').value, "deviceid": deviceObj.deviceId };
    console.log('onExecute',value);
	jQuery.ajax({
        //提交的网址
        type: 'POST',
        url: host + "/v1/api/device/ws",
        data: value,
        contentType: "application/x-www-form-urlencoded",
        dataType: 'json',
        success: function(results) {
            console.log("####sendToOne " + JSON.stringify(results));
            toast(JSON.stringify(results));
            showLog(JSON.stringify(results));
        }
    });
}


function showLog(msg) {
    var div = document.getElementById('txtContent');
    var line = msg + '<br><br>';
    $("#txtContent").append(line);
    div.scrollTop = div.scrollHeight;
    div.scrollIntoView();
}

function displayDetail(obj){
    //<li><a > 收件箱 <span class="label label-warning pull-right">A450467CD3C8aaaaaaaaaaa</span> </a></li>
    var lis = '<li><a>连接状态：<span class="label label-success pull-right" id="status_id"></span> </a></li>';
    lis += '<li><a>设备温度：<span class="label label-danger pull-right">' + (obj.totalStr ? obj.totalStr.substr(0, 10) : "") +'</span> </a></li>';
    lis += '<li><a>设备编号：<span class="label label-default pull-right">' + obj.deviceId +'</span> </a></li>';
    lis += '<li><a>私有地址：<span class="label label-default pull-right">' + obj.privateIp +'</span> </a></li>';
    lis += '<li><a>公网地址：<span class="label label-default pull-right">' + obj.publicIp +'</span> </a></li>';
    lis += '<li><a>更新时间：<span class="label label-default pull-right">' + obj.updateTime +'</span> </a></li>';
    lis += '<li><a>编译日期：<span class="label label-success pull-right">' + obj.buildTime +'</span> </a></li>';
    //ul.append(lis);
    $(".folder-list").append(lis);

}


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
function onDisconnect() {
    showLog("####disconnect");
    try {
        socket.close();
        socket = null;
    } catch (ex) {
        showLog("####disconnect info " + ex);
    }
}
function clearLog() {
    document.getElementById("txtContent").value = "";
    $("#txtContent").empty();
}
function onRecoonect() {
    //sleep(5000)
    connect(wshost)
}
function showStatus(msg) {
    var status_laybel = document.getElementById('status_id');
    if(isconnect){
        status_laybel.classList.remove('label-danger');
        status_laybel.classList.add('label-success');
    }else{
        status_laybel.classList.remove('label-success');
        status_laybel.classList.add('label-danger');
    }
    status_laybel.innerHTML = msg;
}
function sublog(userId) {
    var value = { "deviceid": userId }
    console.log('sublog', value);
    jQuery.ajax({
        //提交的网址
        type: 'POST',
        url: host + "/v1/api/device/addclientreader",
        data: value,
        contentType: "application/x-www-form-urlencoded",
        dataType: 'json',
        success: function (results) {
            console.log("####login " + JSON.stringify(results));
            toast('日志订阅：' + JSON.stringify(results));
        }
    });
}

function connect(wsurl) {
    var timestamp = new Date().getTime()
    deviceid = "html_" + timestamp;
    var host = wsurl + '/' + deviceid;
    console.log("####websocket info " + host);
    showLog("####websocket info " + host);
    socket = new WebSocket(host);
    try {
        socket.onopen = function (msg) {
            isconnect = true;
            showStatus("连接成功");
            sublog(deviceid);
        };
        socket.onmessage = function (msg) {
            if (typeof msg.data == "string") {
                showLog(msg.data);
            } else {
                alert("非文本消息onmessage" + msg);
            }
        };

        socket.onerror = function (msg) {
            console.log('onerror received a message', msg);
            showStatus("连接失败");
            showLog("连接失败 ")
        };

        socket.onclose = function (msg) {
            isconnect = false;
            console.log('onclose received a message', msg);
            showStatus("连接关闭");
        };
    } catch (ex) {
        console.log('catch received a message', msg);
    }
}