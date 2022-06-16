var ip;
var port;

function load() {
    //var json = {"code":2000,"data":""}
    //document.getElementById("text").value = JSON.stringify(json)
    connect();
}

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}


function reconn(){
    sleep(5000)
    connect()
}

function connect() {
    // var host = "ws://207.246.96.42:8125"
    var timestamp = new Date().getTime()
 //   var host = "wss://" + ip + ":" + port + "/websocket/html_"+timestamp;
    var host = "wss://" + ip + "/websocket/html_"+timestamp;
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
            reconn()
        };

        socket.onclose = function (msg) {
            console.log('onclose received a message', msg);
            status("连接关闭");
            reconn()
        };
    } catch (ex) {
        console.log('catch received a message', msg);
    }
}

function send() {
    var msg = getId("sendText").value
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

function daKing(){
    var json = '{"code":1000}'
    socket.send(json);
}

function sendCmd(){
    //{"code":2000,"data":""}
    var  data = document.getElementById("text").value
    var json = '{"code":2000,"data":"' + data + '"}'
    socket.send(data);
}

function getText() {
    return document.getElementById("txtContent").value
}

function status(status) {
    getId("status").innerHTML = status;
}

function showLog(msg) {
    var div = document.getElementById('msg_end');
    // div.value += "\r\n" + msg;

    var line = '<tr style="color : black"><td style="white-space: nowrap;">' + msg + '</td></tr>';
    //var line = '<tr style="color : black"><div class="line">' + msg + '</div></tr>';
    $("#txtContent").append(line);

    //div.scrollTop = div.scrollHeight;
    div.scrollIntoView();

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
