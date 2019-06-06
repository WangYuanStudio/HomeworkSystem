//定义全局对象
var user = new Object();
user.token = getUrlPra('token');

//页面加载后
$(document).ready(function() {
	//验证登录状态并获取用户信息
	if(!user.token)
		Logout();				//URL中没有token传参时
	else
		GetUserInfo();

	//点击导航栏“作业公告”：显示作业公告页面
	$('#notice').click(function(event) {
		SetPage(1);
	});

	//点击导航栏“我的作业”：显示我的作业页面
	$('#me').click(function(event) {
		SetPage(2);
	});

	//选择“退出登录”菜单
	$('#logout').click(function(event) {
		Logout();
	});

	//点击查看公告详细内容
	$("#task_content").on('click',function(){
		alert('【作业详细内容】\n' + $('#task_content').html() + '\n\n【截止上交时间】\n' + $('#task_end_time').text().substr(5, $('#task_end_time').text().length));
	});

	//点击“上传文件”按钮
	$('#input-file').click(function(event) {
		//弹出作业文件格式提示
		alert('请选择小于20M的压缩文件，仅支持zip/rar/7z格式！');
	});

	//触发“上传文件”事件
	$(".a-upload").on("change","input[type='file']",function(){
		//获取文件对象
		var fileObj = document.getElementById('input-file').files[0];

		//如果选择了文件，则执行上传
		if (fileObj)
			UploadFile(fileObj);
	});
});

//获取URL参数
function getUrlPra(key){
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");  		//构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);    		//匹配目标参数
    if (r != null) return decodeURIComponent(r[2]); return null;	//返回参数值
}

//设置显示的页面
function SetPage(index){
	//初始化
	$('#notice').css({color: '#CCC', borderBottom: 'none'});
	$('#me').css({color: '#CCC', borderBottom: 'none'});
	$('#main_notice').html();
	$('.main').css('display', 'none');

	//显示对应页面
	if(index == 2){
		//显示“我的作业”页面
		$('#me').css({color: '#ADF', borderBottom: '3px solid #ADF'});
		$('#main_me').css('display', 'block');
	}
	else{
		//显示“公告列表”页面
		$('#notice').css({color: '#ADF', borderBottom: '3px solid #ADF'});
		$('#main_notice').css('display', 'block');
	}
}

//禁用上传文件按钮
function DisabledUpload(disable){
	if(disable){
		$('#input-file').attr('disabled', true);
		$('.a-upload').attr('disabled', true);
		$('#input-file').css({
			backgroundColor: '#888',
			cursor: 'not-allowed'
		});
		$('.a-upload').css({
			backgroundColor: '#888',
			cursor: 'not-allowed'
		});
	}
	else{
		$('#input-file').attr('disabled', false);
		$('.a-upload').attr('disabled', false);
		$('#input-file').css({
			backgroundColor: '#1AB947',
			cursor: 'pointer'
		});
		$('.a-upload').css({
			backgroundColor: '#1AB947',
			cursor: 'pointer'
		});
	}
}

//判断是否请求成功
function RequestSuccess(code, logout){
	var success = code == '200' ? true : false;
	if(!success && logout){
		alert('请求出错, 请重新登录！');
		Logout();
	}

	return success;
}

//退出登录
function Logout(){
	if(user.token){
		//向服务器请求登出
		var SendInfo = {
			token: 	user.token,
			status:	'outlogin',
			uid: 	user.uid
		};

		$.ajax({
			type : "POST",
        	url : "./server/users.php ",
        	contentType : "application/json;charset=utf-8",
        	data: JSON.stringify(SendInfo),
        	dataType : "json",
        })
	}

	//跳转到登录页面
	location.href = 'login.html';
}

//获取用户信息
function GetUserInfo(){
	//向服务器请求用户信息
	var SendInfo = {
		status: 'sent_token',
		token: 	user.token
	};

	$.ajax({
		url: './server/users.php',
		type: 'post',
		dataType: 'application/json;charset=utf-8',
		data: JSON.stringify(SendInfo),
	})
	.always(function(data) {
        data = JSON.parse(data.responseText);

		//是否请求成功
		if(RequestSuccess(data.status_code, true)){
			//更新用户对象信息
			data = data.data;
			user.uname 	 = data.uname;
			user.uid 	 = data.id;
			user.sno 	 = data.Sno;
			user.disable = data.status == '1' ? false : true;

			//在导航栏中显示用户名
			$('#name b').html(data.uname);

			//byxuhang
			$('#name b').attr("value",user.uid);

			//加载作业公告列表
			GetNoticeList();

			//加载本次作业
			GetNewestNotice();

			//加载用户作业列表
			GetHomeworkList();

			//初始化页面显示
			SetPage(1);
		}
	});
}

//加载最新作业信息
function GetNewestNotice(action){
	var SendInfo = {
		status: 'get_new_notice',
		token: 	user.token
	};

	$.ajax({
		url: './server/homework.php',
		type: 'post',
		dataType: 'application/json;charset=utf-8',
		data: JSON.stringify(SendInfo),
	})
	.always(function(data) {
		data = $.parseJSON(data.responseText);
		//是否请求成功
		if(RequestSuccess(data.status_code, true)){
			//判断作业是否已截止，或该用户是否有权限上交作业
			if(user.disable){
				DisabledUpload(true);
				$('.a-upload span').html('无权限');
			}
			else if(data.notice_end_status != 1){
				DisabledUpload(true);
				$('.a-upload span').html('已截止');
			}
			else
				DisabledUpload(false);

			data = data.data;
			$('#task_title').html(data.title);
			$('#task_title').val(data.hw_num);									//记录公告ID
			$('#task_end_time').html("截止上交：" + data.end_time.substr(0, 16));
			$('#task_content').html(RemoveHTMLTag(data.content));	
		}
	});
}

//加载作业公告列表
function GetNoticeList(){
	//更新作业公告列表
	var SendInfo = {
		token: 		user.token,
		status:		'g_notice',
		notice_id: 	''
	};

	$.ajax({
		type : "POST",
    	url : "./server/homework.php",
    	contentType : "application/json;charset=utf-8",
    	data: JSON.stringify(SendInfo),
    	dataType : "json",
    })
    .always(function(data){
		//是否请求成功
		if(RequestSuccess(data.status_code, true)){
			//没有任何公告时不作处理
			if(data.msg == '暂无公告')
				return;

			var list = data.data;									//列表对象
			//“作业公告”页面遍历加载公告项
			$('#main_notice').html('');								//清空列表
			$.each(list, function(index, val) {
				var html = '<div class="box_notice"><div class="notice_left"></div>';
				html += '<div class="notice_right"><div class="notice_title"><h3>' + val.title;
				html += '</h3><span>' + val.end_time.substr(0, 16) + '</span></div><div class="notice_content"><p>' + val.content;
				html += '</p></div></div></div>';
				$('#main_notice').append(html);
			});

			//修改公告列表内容中超链接的打开方式
			$('.notice_right a').attr('target', '_blank');
		}
    });
}

//获取用户作业列表
function GetHomeworkList(){
	//获取用户作业历史记录
	var SendInfo = {
		token: 	user.token,
		status:	'dangao',
		id: 	user.uid
	};

	$.ajax({
		type : "POST",
    	url : "./server/homework.php ",
    	contentType : "application/json;charset=utf-8",
    	data: JSON.stringify(SendInfo),
    	dataType : "json",
    })
    .always(function(data){
    	if(RequestSuccess(data.status_code, true)){
    		var list = data.data;									//列表对象
    		$('table tbody').html('');								//清空列表

    		//遍历历史作业列表
    		if(list.length == 0){
    			//如果没有作业记录
    			var html = '<tr><td colspan="5">你还没有上传过任何作业:)</td></tr>';
    			$('table tbody').html(html);
    		}else{
				$.each(list, function(index, val) {
					var comment = val.hw_comment;
					var status = '已上交';
					if(comment != null){
						comment = TransHTMLTag(comment);
						status = '已评改';
					}

	    			 var html = '<tr><td class="table_title"><a title="点击下载" href="' + val.hw_url;
	    			 html += '">' + val.title + '</a></td><td class="table_status">' + status + '</td>';
	    			 html += '<td class="table_time">' + val.time + '</td><td class="table_level">';
	    			 html += val.class + '</td><td class="table_comment">' + comment + '</td></tr>';
	    			 $('table tbody').append(html);
	    		});
    		}
    	}
    });
}

//上传文件
function UploadFile(fileObj){
	//检查作业是否已截止
	var SendInfo = {
		status: 'get_new_notice',
		token: 	user.token
	};

	$.ajax({
		url: './server/homework.php',
		type: 'post',
		dataType: 'application/json;charset=utf-8',
		data: JSON.stringify(SendInfo),
	})
	.always(function(data) {
		data = $.parseJSON(data.responseText);
		//是否请求成功
		if(RequestSuccess(data.status_code, true)){
			if(data.notice_end_status != 1){
				DisabledUpload(true);
				$('.a-upload span').html('已截止');
				alert('抱歉, 作业上交时间已截止, 你不能提交作业！');
				return false;
			}
			else{
				//定义文件名：用户名_作业标题_时间戳
				var fileName = $.trim($("#name b").text()) + '_' + $.trim($('#task_title').text()) + '_' + Date.parse(new Date());

				//禁用按钮
				DisabledUpload(true);
				$(".a-upload span").text("正在上传...");

				//更改文件名并设置文件路径
				var replaceStr = fileObj.name.substring(0, fileObj.name.lastIndexOf('.'));
				var fileName = fileObj.name.replace(replaceStr, fileName);
				var path = '/wy_hws/' + fileName;

			    //类型判断
			    var type = fileObj.name.substr(fileObj.name.lastIndexOf('.'));
			    if (type != '.zip' && type != '.rar' && type != '.7z')
			        return UploadError('上传失败, 仅允许上传zip/rar/7z格式的压缩文件！');
						 
				//大小判断
			    if (fileObj.size > 20*1024*1024)
			    	return UploadError('上传失败, 文件大小限制20M以内！');

				//将文件上传至COS
				UploadToCOS(fileObj, path);
			}
		}
	});
}

//上传文件至COS
function UploadToCOS(fileObj, filePath){
	//获取SecreKey
	var SendInfo = {
    	token: 	user.token,
    	status: 'sign',
    	path: 	filePath
    };

    $.ajax({
        type: 'POST',
        async: false,
        url: "./server/upload_cos.php",
        dataType: 'json', 
        cache: false,
        data: JSON.stringify(SendInfo), 
    })
    .done(function(data1) {
    	var sign = data1.data.sign;

    	//上传文件
		var formData = new FormData();
	    formData.append('op', 'upload');
	    formData.append('fileContent', fileObj);
	    formData.append('insertOnly', 0);
	  
	    $.ajax({
	        type: 'POST',
	        url:"//gz.file.myqcloud.com/files/v2/1253473509/hws" + encodeURIComponent(filePath) + '?sign=' + encodeURIComponent(sign),
	        data: formData,
	        crossDomain: true,
	        processData: false,
	        contentType: false,
	        cache: false,
	      	headers: { Authorization: sign },
	    })
	    .done(function(data2) {
	        //更新作业提交记录
	        UpdateHomeworkStatus(filePath);
		})
		.fail(function(){
			UploadError('上传失败, 请重试！\n如果多次尝试失败, 请联系师兄！');
		});
	})
	.fail(function(){
		UploadError('上传失败, 请重试！\n如果多次尝试失败, 请联系师兄！');
	});
}

//更新作业提交记录
function UpdateHomeworkStatus(filePath){
	var SendInfo = {
		token: 		user.token,
		status: 	'cos_upload',
		uid: 		user.uid,
		hw_num: 	$('#task_title').val(),
		hw_url: 	'http://hws-1253473509.cosgz.myqcloud.com' + filePath
	};

    $.ajax({
        type: 'POST',
        url: "./server/upload_cos.php",
        dataType: 'json',
        data: JSON.stringify(SendInfo),
        cache: false
    })
    .done(function(data) {
    	UploadError('上传成功, 你可以多次上传作业, 但只有最后一次是有效的！', false);
    	//重新加载历史作业列表
    	GetHomeworkList();
   	 })
    .fail(function(){
    	UploadError('上传失败, 请重试！\n如果多次尝试失败, 请联系师兄！');
    });
}

//上传失败处理
function UploadError(errMsg){
	var errStatus = arguments[1] != null ? arguments[1] : true;
	alert(errMsg);
    DisabledUpload(false);
	$(".a-upload span").text("上传作业");
	return !errStatus;
}

//过滤HTML标签
function RemoveHTMLTag(str){
    str = str.replace(/<\/?[^>]*>/g,''); 							//去除HTML tag
    str = str.replace(/[ | ]*\n/g,'\n'); 							//去除行尾空白
    //str = str.replace(/\n[\s| | ]*\r/g,'\n'); 					//去除多余空行
    str = str.replace(/ /ig,'');									//去掉空格
    return str;
}

//HTML字符实体转义
function TransHTMLTag(str){
	str = str.replace(/&/g, '&amp;');
	str = str.replace(/ /g, '&nbsp;');
	str = str.replace(/</g, '&lt;');
	str = str.replace(/>/g, '&gt;');
	// str = str.replace(/"/g, '&quot;');
	// str = str.replace(/'/g, '&apos;');
	// str = str.replace(/￠/g, '&cent;');
	// str = str.replace(/£/g, '&pound;');
	// str = str.replace(/¥/g, '&yen;');
	// str = str.replace(/￠/g, '&euro;');
	// str = str.replace(/§/g, '&sect;');
	// str = str.replace(/©/g, '&copy;');
	// str = str.replace(/®/g, '&reg;');
	// str = str.replace(/™/g, '&trade;');
	// str = str.replace(/×/g, '&times;');
	// str = str.replace(/÷/g, '&divide;');

	return str;
}