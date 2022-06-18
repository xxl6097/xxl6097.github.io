window.isLogin = false;

$(document).ready(function() {
    console.log("###ready#页面已加载！");
});


function load() {
    console.log("###load#页面已加载！");
    if (window.isLogin) {
        //getConfig();
        console.log("###请登录");
    } else {
        //window.location.href = '../index.html'
        console.log("###已经登陆");
    }
}

function doget(path, suc, err) {
    jQuery.ajax({
        //提交的网址
        type: "GET",
        url: path,
        contentType: "application/x-www-form-urlencoded",
        dataType: 'text',
        success: suc,
        error: err
    });
}


function login() {
	Toast("login", 3000);
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    console.log("####login username:" + username + " password:" + password);
    var value = { "username": username, "password": password };
    //var value = JSON.stringify(json);
    jQuery.ajax({
        //提交的网址
        type: 'POST',
        url: "https://uuxia.cn/v1/api/admin/login",
        data: value,
        contentType: "application/x-www-form-urlencoded",
        dataType: 'json',
        success: function(results) {
            console.log("####login " + JSON.stringify(results));
            console.log("####code " + results.code);
            if (results.code == 0) {
                window.isLogin = true;
                window.location.href = 'admin/index.html'
            } else {
                window.isLogin = false;
            }
            Toast(results.msg+'login', 3000);
        }
    });
}


function gotoLogs(){
    window.location.href = '../log/index.html'
}

function gotoDevices(){
    window.location.href = '../device/index.html'
}

function gotoTasks(){
    window.location.href = '../task/index.html'
}

//自定义弹框
function Toast1(msg, duration) {
    duration = isNaN(duration) ? 3000 : duration;
    var m = document.createElement('div');
    m.innerHTML = msg;
    m.style.cssText = "width: 60%;min-width: 150px;opacity: 0.7;height: 30px;color: rgb(255, 255, 255);line-height: 30px;text-align: center;border-radius: 5px;position: fixed;top: 40%;left: 20%;z-index: 999999;background: rgb(0, 0, 0);font-size: 12px;";
    document.body.appendChild(m);
    setTimeout(function() {
        var d = 0.5;
        m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
        m.style.opacity = '0';
        setTimeout(function() { document.body.removeChild(m) }, d * 1000);
    }, duration);
}



//形参分别是: 提示内容,时间,背景色,字体颜色
function toast(text, time, bgcolor, color) {
    var toastNode = document.createElement('div');
    toastNode.innerHTML = '<p id="toast"></p>';
    toastNode.id = 'toastWaka'; // 设置id，一个页面有且仅有一个Toast
    toastNode.setAttribute('class', 'toast_box');   // 设置类名
    toastNode.style.display = 'none';   // 设置隐藏
    document.body.appendChild(toastNode);

    var styleStr = '@keyframes show { 0% { opacity: 0; } 100% { opacity: 1; } }\
                    @keyframes hide { 0% { opacity: 1;  } 100% { opacity: 0; } }\
                    .toast_box {\
                        max-width: 90%;\
                        position: absolute;\
                        bottom: 5%;\
                        left: 50%;\
                        justify-content: center; \
                        z-index: 10;\
                        transform: translate(-50%, -50%);\
                        display: none;\
                    }\
                    .toast_box p {\
                        max-width: 100%;\
                        word-break: break-all;\
                        box-sizing: border-box;\
                        padding: 10px 20px;\
                        width: max-content;\
                        /* 提示框的背景色 */\
                        background: #707070;\
                        color: #fff;\
                        font-size: 16px;\
                        text-align: left;\
                        border-radius: 10px;\
                        opacity: 0.8;\
                    }';

    var style = document.createElement('style')
    style.innerHTML = styleStr;
    document.querySelector("head").appendChild(style)

    let toast = document.getElementById('toast');
    let toast_box = document.getElementsByClassName('toast_box')[0];
    toast.innerHTML = text;
    toast.style.background = bgcolor;
    toast.style.color = color;
    toast_box.style.animation = 'show 1.5s'
    toast_box.style.display = 'inline-block';
    setTimeout(function () {
        toast_box.style.animation = 'hide 1.5s'
        setTimeout(function () {
            toast_box.style.display = 'none';
        }, 1400)
    }, time)
}

//调用
function Toast(text, time) {
    toast(text, time, "#00CC00", "#FFFFFF");
}
