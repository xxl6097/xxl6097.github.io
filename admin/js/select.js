function addScript(url) {
    document.write("<script language=javascript src=" + url + "></script>");
}
addScript('../js/cookie.js');
var host = localStorage.getItem("apihost");
$(document).ready(function () {
    console.log("###ready#页面已加载！" + host);
    if (isLogin()) {
        console.log("###ready# 已经登陆");
        getDeviceList()
    } else {
        console.log("###ready# 未登录，请登陆");
        window.location.href = '../index.html'
    }
});

// 1.判断select选项中 是否存在Value="paraValue"的Item        
function jsSelectIsExitItem(objSelect, objItemValue) {
    var isExit = false;
    for (var i = 0; i < objSelect.options.length; i++) {
        if (objSelect.options[i].value == objItemValue) {
            isExit = true;
            break;
        }
    }
    return isExit;
}

// 2.向select选项中 加入一个Item        
function jsAddItemToSelect(objSelect, objItemText, objItemValue) {
    //判断是否存在        
    if (jsSelectIsExitItem(objSelect, objItemValue)) {
        //alert("该Item的Value值已经存在");        
    } else {
        var varItem = new Option(objItemText, objItemValue);
        objSelect.options.add(varItem);
        //alert("成功加入");     
    }
}

// 3.从select选项中 删除一个Item        
function jsRemoveItemFromSelect(objSelect, objItemValue) {
    //判断是否存在        
    if (jsSelectIsExitItem(objSelect, objItemValue)) {
        for (var i = 0; i < objSelect.options.length; i++) {
            if (objSelect.options[i].value == objItemValue) {
                objSelect.options.remove(i);
                break;
            }
        }
        alert("成功删除");
    } else {
        alert("该select中 不存在该项");
    }
}


// 4.删除select中选中的项    
function jsRemoveSelectedItemFromSelect(objSelect) {
    var length = objSelect.options.length - 1;
    for (var i = length; i >= 0; i--) {
        if (objSelect[i].selected == true) {
            objSelect.options[i] = null;
        }
    }
}

// 5.修改select选项中 value="paraValue"的text为"paraText"        
function jsUpdateItemToSelect(objSelect, objItemText, objItemValue) {
    //判断是否存在        
    if (jsSelectIsExitItem(objSelect, objItemValue)) {
        for (var i = 0; i < objSelect.options.length; i++) {
            if (objSelect.options[i].value == objItemValue) {
                objSelect.options[i].text = objItemText;
                break;
            }
        }
        alert("成功修改");
    } else {
        alert("该select中 不存在该项");
    }
}

// 6.设置select中text="paraText"的第一个Item为选中        
function jsSelectItemByValue(objSelect, objItemText) {
    //判断是否存在        
    var isExit = false;
    for (var i = 0; i < objSelect.options.length; i++) {
        if (objSelect.options[i].text == objItemText) {
            objSelect.options[i].selected = true;
            isExit = true;
            break;
        }
    }
    //Show出结果        
    if (isExit) {
        alert("成功选中");
    } else {
        alert("该select中 不存在该项");
    }
}

// 7.设置select中value="paraValue"的Item为选中    
////document.all.objSelect.value = objItemValue;    

// 8.得到select的当前选中项的value    
//var currSelectValue = document.all.objSelect.value;    

// 9.得到select的当前选中项的text    
//var currSelectText = document.all.objSelect.options[document.all.objSelect.selectedIndex].text;    

// 10.得到select的当前选中项的Index    
//var currSelectIndex = document.all.objSelect.selectedIndex;    

// 11.清空select的项    
//document.all.objSelect.options.length = 0; 
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
function loadSelect() {
    let select = document.getElementById('menuid');
    // for (let index = 0; index < 10; index++) {
    //     var varItem = new Option('选择 ' + index,'i-' + index);      
    //     select.options.add(varItem);   
    // }
    //select.options.selected = true;

    getDeviceList();
}

function onSelectItemClick() {
    var select = document.getElementById('menuid');
    var oadTitle = select.options[select.selectedIndex].value;
    document.getElementById("devid").innerText = oadTitle;
}

function getDeviceList() {
    var url = host + '/v1/api/device/all'
    doget(url, (res) => {
        console.log('list', res)
        display_select(JSON.parse(res))
    }, (res) => {
        console.log('list.err', res)
    })
}

function display_select(message) {
    if (message) {
        if (message.code == 0) {
            let select = document.getElementById('menuid');
            select.length = 0;//.innerHTML =
            for (j = 0; message.data[j] != null; j++) {
                var item = message.data[j];
                var varItem = new Option(item.deviceName, item.deviceId);
                select.options.add(varItem);
            }
            var value = select.options[0].value;
            document.getElementById("devid").innerText = value;
        }
    }
}