// 选择适合自己场景得方法

// 1.传json对象

// var object= {id: 123, name: 'name1', age: 10};
// var jsonObj = '<a οnclick="dotest(' + JSON.stringify(object).replace(/"/g, '&quot;') + ');">json对象传递</a>';


// 2.传json字符串

// var object= {id: 123, name: 'name1', age: 10};
// var jsonStr = '<a οnclick="dotest(\'' + JSON.stringify(object).replace(/"/g, '&quot;') + '\');">json字符串传递</a>';


// 3.传object对象

// var objectstr =JSON.stringify(object);
// 这里要特别注意：方法格式必须为 οnclick='dotest2("+objectstr+")（单双引号保持一致）
// var html=  "<button οnclick='dotest2("+zxdxx+")'>测试</button>"  

// 点击下拉菜单意外区域隐藏
// window.onclick = function(event) {
//     if (!event.target.matches('.ccv')) {
//       var dropdowns = document.getElementsByClassName("dropdown-content")[0];
//       dropdowns.style.display='none'
//     }
// }

function addScript(url){
    document.write("<script language=javascript src="+url+"></script>");
}
addScript('../js/cookie.js');
var host = localStorage.getItem("apihost");
$(document).ready(function() {
    console.log("###ready#页面已加载！"+host);
    if (isLogin()) {
        console.log("###ready# 已经登陆");
        getDeviceList()
    }else{
        console.log("###ready# 未登录，请登陆");
        window.location.href = '../index.html'
    }
});

function load() {
    console.log("###load#getDeviceList");

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

function deleteDevice(deviceid) {
    var value = {"deviceid": deviceid}
    console.log('deleteDevice',value);
	jQuery.ajax({
        //提交的网址
        type: 'POST',
        url: host + "/v1/api/device/delete",
        data: value,
        contentType: "application/x-www-form-urlencoded",
        dataType: 'json',
        success: function(results) {
            console.log("####login " + JSON.stringify(results));
            toast('删除状态' + JSON.stringify(results));
        }
    });
}

// if (osName.equalsIgnoreCase("xiaomi")){
//     json = "{\"code\":2002,\"data\":{\"binurl\":\"http://uuxia.cn/file/mi9/libabss.so\"}}";
// }else if (osName.equalsIgnoreCase("raspberrypi")){
//     json = "{\"code\":2002,\"data\":{\"binurl\":\"http://uuxia.cn/file/raspberry/abss/libabss.so\"}}";
// }

function sendcmd(deviceid,osType,cmd) {
    var json = {"code": 2000,"data": cmd}
    if('upgrade_app' == cmd){
        json = {"code": 2002, "data": {"binurl": "http://uuxia.cn/file/abss/" + osType +"/libabss.so"}}
    }
    var value = { "json": JSON.stringify(json),"deviceid": deviceid };
    console.log('sendcmd',value);
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
        }
    });
}

function sendtoall(json) {
    var value = { "json": json };
    console.log('sendtoall',value);
	jQuery.ajax({
        //提交的网址
        type: 'POST',
        url: host + "/v1/api/device/sendtoall",
        data: value,
        contentType: "application/x-www-form-urlencoded",
        dataType: 'json',
        success: function(results) {
            console.log("####login " + JSON.stringify(results));
            toast(JSON.stringify(results));
        }
    });
}

function display_div(message) {
    if (message) {
        if (message.code == 0) {
            for (j = 0; message.data[j] != null; j++) {
                var item = message.data[j];
                a = '<div>';

                a += '<div class="col-sm-4">';
                a += '<div class="contact-box">';
                a += '<div class="col-sm-4" >';
                a += '<div class="text-center" data-item=' + item.deviceId + '>';
                a += '<img class="img-responsive1" width="200px" height="200px" src="' + item.deviceIcon + '">';
                a += '<div class="m-t-xs font-bold"><font color=' + (item.onlineStatus == 0 ?"gray":"#11ff00") +'>';
                a += item.osname;
                a += '</font></div></div></div>';

                a += '<div class="col-sm-8">';

                a += '<div class="dropdown">';
                a += ' <h3><strong onclick="showMenu(this)" class="ccv" >'+ (item.deviceName ? item.deviceName.substr(0, 26) : "") +'</strong></h3>';

                a += '<div class="dropdown-content">';
                a += '<li onclick="onMenuItemClick(this,\'' + item.deviceId + '\',\'' + item.osType + '\',\'' + 'reboot' + '\')">重启</li>';
                a += '<li onclick="onMenuItemClick(this,\'' + item.deviceId + '\',\'' + item.osType + '\',\'' + 'upgrade_app' + '\')">升级</li>';
                a += '<li onclick="onMenuItemClick(this,\'' + item.deviceId + '\',\'' + item.osType + '\',\'' + 'exit_app' + '\')">退出</li>';
                a += '<li onclick="onMenuDelete(this,\'' + item.deviceId + '\',\'' + 'exit_app' + '\')">删除设备</li>';
                a += '<li onclick="onMenuCmdClick(this,' + "'" + item.deviceId + "'" + ')">执行命令</li>';
                a += '<li onclick="onMenuDetailItemClick(this,' + JSON.stringify(item).replace(/"/g, '&quot;') + ')">查看设备信息</li>';
                a += '</div>';
                a += '</div>';

                a += '<address>'
                a += '<strong>设备温度：</strong><font color=' + (item.onlineStatus == 0 ?"gray":"red") +'>' + (item.totalStr ? item.totalStr.substr(0, 10) : "") +'</font><br>';
                a += '<strong>设备编号：</strong>' + item.deviceId   +'<br>';
                a += '<strong>私有地址：</strong>' + item.privateIp  +'<br>';
                a += '<strong>公网地址：</strong>' + item.publicIp   +'<br>';
                a += '<strong>更新时间：</strong>' + item.updateTime +'<br>';
                a += '<strong>编译日期：</strong><font color=\'blue\'>' + item.buildTime +'</font><br>';
                a += item.buildid +'<br>';
                a += '</address>'
                a += '</div>'
                a += '<div class="clearfix"></div>'
                a += '</a>'
                a += '</div></div></div>'
                //console.log(i)
                $(".row").append(a);
            }
        }
    }
}

function getDeviceList() {
    var url = host + '/v1/api/device/all'
    doget(url, (res) => {
        console.log('list', res)
        display_div(JSON.parse(res))
    }, (res) => {
        console.log('list.err', res)
    })
}

function onItemClick(msg) {
    console.log('onItemClick',msg)
    toast(msg, 3000)
}

function onTest(msg) {
    console.log('onTest',msg)
    toast(msg, 3000)
    var dcon = msg.parentElement.parentElement.getElementsByClassName('dropdown-content')[0];
    dcon.style.display='block';
}

/* 点击按钮，下拉菜单在 显示/隐藏 之间切换 */
function showMenu(thiz) {
    var dcon = thiz.parentElement.parentElement.getElementsByClassName('dropdown-content')[0];
    dcon.style.display='block';
}

function hideMenu(thiz){
    var dcon = thiz.parentElement;
    dcon.style.display='none'
}

function onMenuDelete(thiz,msg,cmd) {
    console.log('onMenuItemClick',thiz,msg,cmd)
    hideMenu(thiz);
    toast('索引:'+thiz + ',msg:' + msg + ',cmd:' + cmd, 3000)
    var ret = confirm("确定要删除设备吗？");
    if(ret){
        deleteDevice(msg);
    }
}

function onMenuItemClick(thiz,msg,osType,cmd) {
    console.log('onMenuItemClick',thiz,msg,cmd,osType)
    hideMenu(thiz);
    sendcmd(msg, osType,cmd);
    toast('索引:'+thiz + ',msg:' + msg + ',cmd:' + cmd, 3000)
}

function onMenuDetailItemClick(thiz,msg) {
    hideMenu(thiz);
    console.log('detail',thiz,msg)
    toast(JSON.stringify(msg), 10000)
}

function onMenuCmdClick(thiz,deviceid) {
    hideMenu(thiz);
    var str = prompt('请输入命令('+ deviceid +')','{"code":2000,"data":"ifconfig"}');
    if (str) {
        //alert(str);
        sendtoall(str);
    }
}