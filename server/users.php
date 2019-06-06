<?php

include_once("sql.php");
// 获取文件流
$filestr = file_get_contents("php://input");

//$request = $filestr;
//转为array类型
$request = json_decode($filestr,true);

//开启session
session_start();
date_default_timezone_set('PRC');
//var_dump($request);

//   status:sent_token
if(isset($request['status']) && $request['status']=="sent_token" && isset($request['token'])){
	//print_r($_SESSION[$request['token']]);
	if(!empty($_SESSION[$request['token']])){
		exit(json_encode(array(
			"status_code"=>"200",
			"data"=>$_SESSION[$request['token']]
		)));
	}else{
		exit(json_encode(array("status_code"=>"5000","msg"=>"获取用户信息失败")));
	}
}

//username password 登录[status:login]
if(isset($request['status']) && $request['status'] == "login"){
	$name = isset($request['username']) ? $request['username'] : "";
	$name = trim($name);
	$password = isset($request['password']) ? $request['password'] : "";
	$sql = new sql();
	$data = $sql->where("uname = '{$name}' or Sno = '{$name}'")->select("users");
	// 判断用户
	if($data->num_rows){
		$data = mysqli_fetch_assoc($data);
		// 判断密码
		//if( md5(sha1($password).'aini') == $data['password']){
		if($password == $data['password']){
			$token = md5(mt_rand().mt_rand());
			$sql = new sql();
			// 保存token
			$result = $sql->where("id = {$data['id']}")->update("users",array("token"=>$token));
			if($result){
				$info = array(
					'uname' => $data['uname'],
					'id'    => $data['id'],
					'Sno'   => $data['Sno'],
					'status'=> $data['u_status'],
				);

				$_SESSION[$token] = $info;
				$return['status_code'] = '200';
				$return['token'] = $token;
				$return['msg'] = "登录成功";
				//$_SESSION['data']['id'] = $data['id'];
				//$_SESSION['data']['uname'] = $data['uname'];
				//$_SESSION['data']['Sno'] = $data['Sno'];
				//$_SESSION['data']['status'] = $data['u_status'];
				//$_SESSION['token'] = $token;/////////加
			}
		}else{
			$return['msg'] = "密码错误";
			$return['status_code'] = '1002';
			
		}
	}else{
		$return['msg'] = "用户失踪了";
		$return['status_code'] = '1001';
	}
	exit(json_encode($return));
}
//var_dump($_SESSION);

//判断token
if(isset($_SESSION[$request['token']]) || $request['token'] == '1234'){
	
}else{
	exit(json_encode(array("status_code"=>"gg了,你的token没有写")));
}

//判断token
//if(isset($_SESSION['token']) || $request['token'] == "1234"){
//	if($request['token'] == "1234"){
//
//	}elseif($request['token'] == $_SESSION['token']){
//
//	}else{
//		exit(json_encode(array("status_code"=>"gg了,你的token没有写")));
//	}
//}else{
//	exit(json_encode(array("status_code"=>"gg了,你的token没有写")));
//}

//登出 uid status:outlogin
if(isset($request['status']) && $request['status'] == "outlogin"){
	$id = isset($request['uid']) ? $request['uid'] : "";
	if($id){
		$sql = new  sql();
		if($sql->where("id = {$id}")->update("users",array("token"=>null))){
			$return['status_code'] = '200';
			unset($_SESSION[$request['token']]);/////////加
			$return['msg'] = "成功登出";
		}
	}else{
		$return['status_code'] = '200';
                unset($_SESSION[$request['token']]);
	}
	exit(json_encode($return));
}


//获取用户信息 status:user current_page
if(isset($request['status']) && $request['status'] == "user"){

	//当前页
	$current_page = isset($request['current_page']) ? $request['current_page'] : "";

	//当前页总数
	$current_count = 150;
	$sql = new sql();
	$count = $sql->count("users");

	$count_page = ceil($count / $current_count);

	$footer = $current_count * ($current_page - 1);
	$end = ($footer + $current_count) <= $count ? $footer + $current_count : $count;
	//查询数据
	$sql = new sql();
	$data = $sql->limit($footer,$end)->select("users");
	if($data->num_rows){
		while($temp = mysqli_fetch_assoc($data)){
			$result[] = $temp;
		}
	}else{
		exit;
	}	
	exit(json_encode(array('count_page'=>$count_page,'current_page'=>$current_page,'data'=>$result)));
}

//修改用户状态 status:u_status  uid user_status:A/B
if(isset($request['status']) && $request['status'] == "u_status"){

	$id = (isset($request['uid']) && is_numeric($request['uid'])) ? $request['uid'] : "";
	$user_status = isset($request['user_status']) ? $request['user_status'] : "";
	if($id){
		$sql = new sql();
		if($user_status){
			if($user_status == 'A'){
				if($sql->where("id = {$id}")->update("users",array("u_status"=>"1"))){
					$return['status_code'] = "200";
					$return['msg'] = "已激活用户";
				}else{
					$return['status_code'] = "1004";
					$return['msg'] = "激活用户失败";
				}
			}elseif($user_status == 'B'){
				if($sql->where("id = {$id}")->update("users",array("u_status"=>"4"))){
					$return['status_code'] = "200";
					$return['msg'] = "已禁用用户";
				}else{
					$return['status_code'] = "1004";
					$return['msg'] = "禁用用户失败";
				}
			}else{
				exit;
			}
		}else{
			exit;
		}
		exit(json_encode($return));

	}else{
		exit;
	}
}

//修改用户信息 status:update_user uid uname Sno sex
if(isset($request['status']) && $request['status'] == "update_user"){
	$uid = isset($request['uid']) ? $request['uid'] : "";
	$uname = isset($request['uname']) ? $request['uname'] : "";
	$Sno = isset($request['Sno']) ? $request['Sno'] : "";
	$sex = isset($request['sex']) ? $request['sex'] : "";
	if($uid){
		if($uname && $Sno && $sex){
			$data = array("uname"=>$uname,"Sno"=>$Sno,"sex"=>$sex);
		}elseif($uname && $Sno){
			$data = array("uname"=>$uname,"Sno"=>$Sno);
		}elseif($Sno && $sex){
			$data = array("Sno"=>$Sno,"sex"=>$sex);
		}elseif($uname && $sex){
			$data = array("uname"=>$uname,"sex"=>$sex);
		}elseif($uname){
			$data = array("uname"=>$uname);
		}elseif($Sno){
			$data = array("Sno"=>$Sno);
		}elseif($sex){
			$data = array("sex"=>$sex);
		}else{
			exit;
		}
		$sql = new sql();
		if($sql->where("id = {$uid}")->update("users",$data)){
			$return['status'] = "200";
			$return['msg'] = "修改成功";
		}else{
			$return['status'] = "1007";
			$return['msg'] = "修改失败";
		}
		exit(json_encode($return));
	}else{
		exit;
	}
		
}



//搜索用户 status:search_user search
if(isset($request['status']) && $request['status'] == 'search_user'){
	$search = isset($request['search']) ? $request['search'] : "";
	if($search){
		$sql = new sql();
		$result = $sql->where("uname like '%{$search}%' or Sno like '%{$search}%' or sex like '%{$search}%'")->select("users");
		if($result->num_rows){
			while($temp = mysqli_fetch_assoc($result)){
				$data[] = $temp;	
			}
			$return['status_code'] = "200";
			$return['data'] = $data;
		}else{
			$return['status_code'] = "1006";
			$return['msg'] = "无搜索结果";
		}
	}else{
		$return['status_code'] = "1005";
		$return['msg'] = "无搜索内容";
	}
	exit(json_encode($return));
}


