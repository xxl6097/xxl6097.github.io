var deviceObj;
function addScript(url){
    document.write("<script language=javascript src="+url+"></script>");
}
addScript('../js/cookie.js');
var host = localStorage.getItem("apihost");
$(document).ready(function() {
    console.log("###ready#页面已加载！"+host);
    //var deviceid = $.query.get("deviceid");
    if (isLogin()) {
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


function onFriend() {
    alert('朋友');
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
    var lis = '<li><a>设备温度：<span class="label label-danger pull-right">' + (obj.totalStr ? obj.totalStr.substr(0, 10) : "") +'</span> </a></li>';
    lis += '<li><a>设备编号：<span class="label label-default pull-right">' + obj.deviceId +'</span> </a></li>';
    lis += '<li><a>私有地址：<span class="label label-default pull-right">' + obj.privateIp +'</span> </a></li>';
    lis += '<li><a>公网地址：<span class="label label-default pull-right">' + obj.publicIp +'</span> </a></li>';
    lis += '<li><a>更新时间：<span class="label label-default pull-right">' + obj.updateTime +'</span> </a></li>';
    lis += '<li><a>编译日期：<span class="label label-success pull-right">' + obj.buildTime +'</span> </a></li>';
    //ul.append(lis);
    $(".folder-list").append(lis);

    var btns = '<li onclick="onFriend()"><a>重启</a></li>';
    btns += '<li onclick="onFriend()"><a>升级</a></li>';
    btns += '<li onclick="onFriend()"><a>退出</a></li>';
    btns += '<li onclick="onFriend()"><a>删除</a></li>';
    btns += '<li onclick="onFriend()"><a>执行命令</a></li>';
    $(".tag-list").append(btns);
}