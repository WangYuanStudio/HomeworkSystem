$(document).ready(function(){
	//登录按钮被按下
	$('#submit').click(function(event) {
		Login();
	});

	//输入框回车事件
	$('input').keydown(function(event) {
		if(event.keyCode == 13)
			Login();
	});

	$('.form').slideDown(500).fadeIn(3000);
});

//登录请求
function Login(){
	//取表单内容
	var username = $('#username').val();
	var password = $('#password').val();

	//检查表单格式
	if(!$.trim(username)){
		alert('用户名不能为空！');
		$('#username').focus();
		return;
	}
	if(!$.trim(password)){
		alert('密码不能为空！');
		$('#password').focus();
		return;
	}

	//设置按钮为“正在登录”样式
	SetButtonStatus(1);

	//生成请求对象
	var getlogindata = new Object();
	getlogindata.username = username;
	getlogindata.password = password;
	getlogindata.status = 'login';
	var logindata = JSON.stringify(getlogindata);

	//异步提交登录请求
	$.ajax({
		type : "POST",
        url : "./server/users.php",
        contentType : "application/json;charset=utf-8",
        data:logindata,
        dataType : "json",
        success:function(data){
        	SetButtonStatus(0);
        	data = JSON.stringify(data);
        	var data = eval("("+data+")");
        	if(data.status_code == "200")
        		location.href = encodeURI('index.html?token=' + data.token);
        	else if(data.status_code=="1001")
        		alert("用户名不存在！");
        	else if(data.status_code=="1002")
        		alert("登录密码错误！");
		}
    });
}

//设置按钮状态
function SetButtonStatus(Status){
	switch(Status){
		case 0: {
			$('#submit').val('登  录');
			$('#submit').css('background-color', '#4A4');
			$('#submit').attr('disable', false);
		}; break;
		case 1: {
			$('#submit').val('正在登录');
			$('#submit').css('background-color', '#666');
			$('#submit').attr('disable', true);
		}; break;
	}
}