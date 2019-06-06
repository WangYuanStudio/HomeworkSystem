<?php

require_once("cos-php-sdk-v4-master/include.php");
include_once("sql.php");
use QCloud\Cos\Auth;


$filestr =  file_get_contents("php://input");
$filestr = json_decode($filestr,true);

session_start();
date_default_timezone_set('Asia/Shanghai'); 

//var_dump($filestr);
//echo $filestr['token'];
//print_r($_SESSION[$filestr['token']]);

//echo $filestr['token'];
//判断token
if(!isset($_SESSION[$filestr['token']])){
       exit(json_encode(array(
		"status_code"=>"3001",
  		"msg"=>"token GG"
       )));
}

//保存上传作业的信息
// status :  cos_upload uid hw_url hw_num
if(isset($filestr['status']) && $filestr['status'] == "cos_upload"){
	
	$uid    = isset($filestr['uid'])&&is_numeric($filestr['uid']) ? $filestr['uid']    : "";
	$hw_url = isset($filestr['hw_url']) ? $filestr['hw_url'] : "";
	$hw_num = isset($filestr['hw_num'])&&is_numeric($filestr['hw_num']) ? $filestr['hw_num'] : "";
	if($uid && $hw_url && $hw_num){
		$upload_status = null;
		$sql = new sql();
		$data =  $sql->where("id = {$uid}")->select("users");
		if($data->num_rows){
                	$data = mysqli_fetch_assoc($data);
			if($data['w_status'] >= $filestr['hw_num']){
				$upload_status = true;
			}else{
				$uplaod_status = false;
			}
		}
		//echo $data['hw_num']."--".$filestr['hw_num'];
		$sql = new sql();
		$time = date('Y-m-d H:i:s');
		$data = array(
			"uid"=>$uid,
			"hw_url"=>$hw_url,
			"hw_num"=>$hw_num,
			"time"=>$time
		);
		if($upload_status){
	                $result = $sql->where("uid={$uid} and hw_num = {$hw_num} ")->update("homework",$data);
		}else{
                        $result = $sql->insert("homework",$data);
		}
		if($result){
			$sql = new sql();
			$sql->where("id = {$uid}")->update("users",array("w_status"=>"{$hw_num}"));
			exit(json_encode(array(	
			"status_code"=>"200",
                        "msg"=>"上传成功"
			)));
		}
	}else{
		exit(json_encode(array(
			"status_code"=>"3002",
	                "msg"=>"作业信息没有完整"

		)));
	}
}

//生成sign
if(isset($filestr['status']) && $filestr['status'] == "sign"){
	
	$path = isset($filestr['path']) ? $filestr['path'] : "";
	
	$appId = "1253473509";
	$secretId = "AKIDav892jSZkljcKHgI4f5KWbYM0ZxdZetw";
	$secretKey = "znQq9HI7qY8ZGmCUbYJD2g8OSOBmBQ7i";

	$auth = new Auth($appId,$secretId,$secretKey);
	$expiration = time() + 60;
	$bucket = 'hws';
	$sign = $auth->createReusableSignature($expiration,$bucket, $path);
	exit(json_encode(array(
		"status_code"=>"200",
		"data"=>array("sign"=>$sign)
	)));
}

