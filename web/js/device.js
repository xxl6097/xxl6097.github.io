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



function load() {
    console.log("###load#getDeviceList");
    getDeviceList()
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

function sendws(deviceid,cmd) {
    var value = { "deviceid": deviceid, "json": {"code": 2000, "data": cmd} };
    console.log('sendws',value);
	jQuery.ajax({
        //提交的网址
        type: 'POST',
        url: "https://uuxia.cn/v1/api/device/ws",
        data: value,
        contentType: "application/form-data",
        dataType: 'json',
        success: function(results) {
            console.log("####login " + JSON.stringify(results));
            toast(JSON.stringify(results));
        }
    });
}

function sendws(json) {
    var value = { "json": json };
    console.log('sendws',value);
	jQuery.ajax({
        //提交的网址
        type: 'POST',
        url: "https://uuxia.cn/v1/api/device/sendtoall",
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
                a += '<img class="img-responsive" width="200px" height="200px" src="' + item.deviceIcon + '">';
                a += '<div class="m-t-xs font-bold"><font color=' + (item.onlineStatus == 0 ?"gray":"#11ff00") +'>';
                a += item.osType;
                a += '</font></div></div></div>';

                a += '<div class="col-sm-8">';
                a += '<div class="titile"></div>';

                a += '<div class="dropdown">';
                a += ' <h3><strong>'+ (item.deviceName ? item.deviceName.substr(0, 26) : "") +'</strong></h3>';
                a += '<div class="dropdown-content">';
                a += '<li onclick="onMenuItemClick(\'' + item.deviceId + '\',\'' + 'reboot' + '\')">重启</li>';
                a += '<li onclick="onMenuItemClick(\'' + item.deviceId + '\',\'' + 'upgrade_app' + '\')">升级</li>';
                a += '<li onclick="onMenuItemClick(\'' + item.deviceId + '\',\'' + 'exit_app' + '\')">退出</li>';
                a += '<li onclick="onMenuCmdClick(' + "'" + item.deviceId + "'" + ')">执行命令</li>';
                a += '<li onclick="onMenuDetailItemClick(' + JSON.stringify(item).replace(/"/g, '&quot;') + ')">查看设备信息</li>';
                a += '</div></div>'

                a += '<address>'
                a += '<strong>设备温度：</strong><font color="red">' + (item.totalStr ? item.totalStr.substr(0, 10) : "") +'</font><br>';
                a += '<strong>设备编号：</strong>' + item.deviceId   +'<br>';
                a += '<strong>私有地址：</strong>' + item.privateIp  +'<br>';
                a += '<strong>公网地址：</strong>' + item.publicIp   +'<br>';
                a += '<strong>更新时间：</strong>' + item.updateTime +'<br>';
                a += item.buildid +'<br>';
                a += '</address>'
                a += '</div>'
                a += '<div class="clearfix"></div>'
                a += '</a>'
                a += '</div></div></div>'
                //console.log(i)
                $(".row").append(a);
            }

            // $(".text-center").each(function () {
            //     $(this).click(function () {
            //         var item = $(this).attr('data-item');
            //         //var obj = JSON.stringify(item);
            //         var json = { code: "steps_edit", deviceId: item }
            //         //先屏蔽掉点击事件
            //         post(json)
            //         console.log('uuxia', json)
            //     })
            // })
        }
    }
}

function getDeviceList() {
    var host = 'https://uuxia.cn/v1/api/device/all'
    doget(host, (res) => {
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

function onMenuItemClick(msg,cmd) {
    console.log('onMenuItemClick',msg,cmd)
    sendws(msg, cmd);
    //toast(msg + '--' + cmd, 3000)
}

function onMenuDetailItemClick(msg) {
    console.log('detail',msg)
    toast(JSON.stringify(msg), 10000)
}

function onMenuCmdClick(deviceid) {
    var str = prompt('请输入命令('+ deviceid +')','{"code":2000,"data":"ifconfig"}');
    if (str) {
        //alert(str);
        sendws(str);
    }
}