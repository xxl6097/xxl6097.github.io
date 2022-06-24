
function addScript(url){
    document.write("<script language=javascript src="+url+"></script>");
}
addScript('../js/cookie.js');
var host = localStorage.getItem("apihost");
$(document).ready(function() {
    console.log("###ready#页面已加载！"+host);
    // var deviceid = $.query.get("deviceid");
    // if (isLogin()) {
    //     if(deviceid === undefined || deviceid === ''){
    //         window.location.href = 'index.html'
    //     }else{
    //         document.title = '设备详情[' + deviceid + ']'
    //     }
    // }else{
    //     console.log("###ready# 未登录，请登陆");
    //     window.location.href = '../index.html'
    // }
});