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

function gotoDnsPod(){
    window.location.href = '../dns/index.html'
}

function gotoDevices(){
    window.location.href = '../device/index.html'
}

function gotoTasks(){
    window.location.href = '../task/index.html'
}

function createRecord(){
    var value = { "domain": document.getElementById('domain_id').value,
        "subDomain": document.getElementById('subdomain_id').value,
        "recordType": document.getElementById('recordtype_id').value,
        "recordLine": document.getElementById('recordLine_id').value,
        "value": document.getElementById('value_id').value
    };
    jQuery.ajax({
        //提交的网址
        type: 'POST',
        url: host + "/v1/api/dnspod/createRecord",
        data: value,
        contentType: "application/x-www-form-urlencoded",
        success: function(results) {
            console.log("####login " + JSON.stringify(results));
            toast(JSON.stringify(results));
        }
    });
}