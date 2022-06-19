var host = localStorage.getItem("apihost");
var wshost = localStorage.getItem("wshost");

function saveCookie(cname, cvalue, minute) {
    var d = new Date();
    d.setTime(d.getTime() + (minute * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue){
    saveCookie(cname, cvalue, 5);
}


function isLogin(){
    var cook = getCookie('cook');
    if (cook != "" && cook != null && host != null && host != "") {
        return true;
    }
    return false;
}



//形参分别是: 提示内容,时间,背景色,字体颜色
function Toast(text, time, bgcolor, color) {
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
                        position: fixed;\
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
                        bottom: 5%;\
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
function toast(text, time) {
    Toast(text, time, "#00CC00", "#FFFFFF");
}

function toast(text) {
    Toast(text, 5000, "#00CC00", "#FFFFFF");
}

function warning(text, time) {
    Toast(text, time, "#FF6600", "#FFFFFF");
}

function error(text, time) {
    Toast(text, time, "#CC0000", "#FFFFFF");
}

// exports.getCookie = getCookie;
// exports.setCookie = setCookie;