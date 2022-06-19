//import './cookie.js'
//const cookutil = require('./cookie.js');
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
    console.log("###load#home");
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