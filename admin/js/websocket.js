var output = document.getElementById("txtContent");

function addScript(url){
    document.write("<script language=javascript src="+url+"></script>");
}
addScript('../js/cookie.js');

$(document).ready(function() {
    console.log("###ready#页面已加载！");
    if (isLogin()) {
        console.log("###ready# 已经登陆");
    }else{
        console.log("###ready# 未登录，请登陆");
        window.location.href = '../index.html'
    }
});

function load() {
    //var json = {"code":2000,"data":""}
    //document.getElementById("text").value = JSON.stringify(json)

    output = document.getElementById("txtContent");

    var json = '{"code":2000,"data":"date"}'
    document.getElementById("content_id").value = json
    connect(wshost);
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


function reconn(){
    //sleep(5000)
    connect(wshost)
}

function connect(wsurl) {
    // var host = "ws://207.246.96.42:8125"
    var timestamp = new Date().getTime()
 //   var host = "wss://" + ip + ":" + port + "/websocket/html_"+timestamp;
    var host = wsurl + "/html_"+timestamp;
//    var host = "ws://192.168.1.105:8125"
//     alert(host);
    console.log("####websocket info " + host);
    showLog("####websocket info " + host)
    socket = new WebSocket(host);
    try {
        socket.onopen = function (msg) {
            status("连接成功");
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
            status("连接失败");
            showLog("连接失败 ")
        };

        socket.onclose = function (msg) {
            console.log('onclose received a message', msg);
            status("连接关闭");
        };
    } catch (ex) {
        console.log('catch received a message', msg);
    }
}

function sendWebsocket() {
    var value = { "json":  document.getElementById('content_id').value };
	jQuery.ajax({
        //提交的网址
        type: 'POST',
        url: "https://uuxia.cn/v1/api/device/sendtoall",
        data: value,
        contentType: "application/x-www-form-urlencoded",
        dataType: 'json',
        success: function(results) {
            console.log("####login " + JSON.stringify(results));
            showLog(JSON.stringify(results));
        }
    });
}

function send() {
    var msg = getId("content_id").value
    showLog(msg)
    socket.send(msg);
}

function disconnect() {
    try {
        socket.close();
        socket = null;
    } catch (ex) {
    }
}

function refresh() {
    try {
        socket.close();
        socket = null;
    } catch (ex) {
    }
    return "自定义内容";
}

window.onbeforeunload = function () {
    try {
        socket.close();
        socket = null;
    } catch (ex) {
    }
};

function stop() {
    try {
        socket.close();
        socket = null;
    } catch (ex) {
    }
}

function stopTest() {
    var data = 'stoptest';
    socket.send(data);
}

function getId(id) {
    return document.getElementById(id);
}


function getText() {
    //return document.getElementById("txtContent").value
    return $("#txtContent").html();
}

function status(status) {
    getId("status").innerHTML = status;
}

function showLog2(msg) {
    var div = document.getElementById('msg_end');
    // div.value += "\r\n" + msg;
    var line = '<tr style="color : black"><td style="white-space: nowrap;">' + msg + '</td></tr>';
    //var line = '<tr style="color : black"><div class="line">' + msg + '</div></tr>';
    $("#txtContent").append(line);
    //div.scrollTop = div.scrollHeight;
    div.scrollIntoView();
}

function showLog3(msg) {
    var div = document.getElementById('txtContent');
    div.value += "\r\n\r\n" + msg;
    div.scrollTop = div.scrollHeight;
}

function showLog(msg) {
    var div = document.getElementById('txtContent');
    var line = msg + '<br><br>';
    $("#txtContent").append(line);
    div.scrollTop = div.scrollHeight;
    div.scrollIntoView();
}

function showLog1(msg) {
    // var json = JSON.parse(msg);
    // if (json.type == 0) {
    //     var div = output;// document.getElementById('txtContent');
    //     div.value += "\r\n" + json.data;
    //     div.scrollTop = div.scrollHeight;
    // } else if (json.type == 1) {
    //     refreshLogButtn(json.data);
    // }

    var div = output;// document.getElementById('txtContent');
    div.value += "\r\n" + msg;
    div.scrollTop = div.scrollHeight;
}

function clearLog() {
    document.getElementById("txtContent").value = "";
    $("#txtContent").empty();
}


function onkey(event) {
    if (event.keyCode == 13) {
        send();
    }
}
