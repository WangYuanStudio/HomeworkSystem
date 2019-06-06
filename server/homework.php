<?php

include_once("sql.php");

//获取文件流
$filestr = file_get_contents("php://input");

//转换为array类型
$filestr = json_decode($filestr,true);

session_start();
date_default_timezone_set('PRC');
//var_dump($_SESSION[$filestr['token']]);

//判断token

if(isset($_SESSION[$filestr['token']]) || $filestr['token'] == '1234'){

}else{
        exit(json_encode(array("status_code"=>"gg了,你的token没有写")));
}

//判断token
//if(isset($_SESSION['token']) || $filestr['token'] == "1234"){
//	if($filestr['token'] == "1234"){
//
//	}elseif($filestr['token'] == $_SESSION['token']){
//
//	}else{
//		exit(json_encode(array("status_code"=>"gg了,你的token没有写")));
//	}
//}else{
//	exit(json_encode(array("status_code"=>"gg了,你的token没有写")));
//}


//发布作业  status:p_notice  title content hw_num end_time
if(isset($filestr['status']) && $filestr['status'] == 'p_notice'){
	//验证内容和主题
	if(isset($filestr['title']) && isset($filestr['content'])){


		if($filestr['title'] && $filestr['content'] && $filestr['hw_num'] && $filestr['end_time']){

			if(strtotime($filestr['end_time'])){
				//保存
				$sql = new sql();
				$data = array(
					'title' => $filestr['title'],
					'content' => $filestr['content'],
					'time'=>date('Y-m-d H:i:s'),
					'hw_num'=>$filestr['hw_num'],
					'end_time'=>$filestr['end_time'],
					'status'=>'1'
				);
				if($sql->insert("notice",$data)){
					$return['status_code'] = "200";
					$return['msg'] = "发布成功";
				}else{
					$return['status_code'] = "200";
					$return['msg'] = "发布失败";
				}
			}else{
				$return['status_code'] = "200";
				$return['msg'] = "时间格式错误";
			}
			
			exit(json_encode($return));
		}else{
			exit;
		}
	}else{
		exit;
	}
}


//获取公告 status:g_notice  notice_id公告id
if(isset($filestr['status']) && $filestr['status'] == 'g_notice'){

	//判断notice_id状态
	$id = isset($filestr['notice_id']) ? $filestr['notice_id'] : "";

	//返回数据
	$result = array();
	$sql = new sql();
	if($id){
		$data = $sql->where("id = {$id}")->select("notice");
	}else{
		$data = $sql->order("hw_num desc")->select("notice");
	}
	
	if($data->num_rows){
		while($temp = mysqli_fetch_assoc($data)){
			$result[] = $temp;
		};
		$return['status_code'] = "200";
		$return['data'] = $result;
		
	}else{
		$return['status_code'] = "200";
		$return['msg'] = "暂无公告";
	}
	exit(json_encode($return));
}

//获取用户作业信息 id  uid  hw_num status:homework
if(isset($filestr['status']) && $filestr['status'] == 'homework'){
	$id = isset($filestr['id']) ?  $filestr['id'] : "";
	$uid = isset($filestr['uid']) ?  $filestr['uid'] : "";
	$hw_num = isset($filestr['hw_num']) ?  $filestr['hw_num'] : "";
	$sql = new sql();
	if($id){
		$data = $sql->where("id = {$id}")->select("homework");
	}else{
		if($uid && $hw_num){
			$data = $sql->where("uid = {$uid} and hw_num = {$hw_num}")->select("homework");
		}elseif($hw_num){
			$data = $sql->where("hw_num = {$hw_num}")->select("homework");
		}elseif($uid){
			$data = $sql->where("uid = {$uid}")->select("homework");
		}else{
			$data = $sql->order("id desc")->select("homework");
		}
	}
	if($data->num_rows){
		while($temp = mysqli_fetch_assoc($data)){
			$result[] = $temp;
		};
		$return['status_code'] = "200";
		$return['data'] = $result;
		
	}else{
		$return['status_code'] = "200";
		$return['msg'] = "暂无";
	}
	exit(json_encode($return));
}

//评价  id class comment  status:comment
if(isset($filestr['status']) && $filestr['status'] == 'comment'){
	$id = isset($filestr['id']) ? $filestr['id'] : "";
	$comment = isset($filestr['comment']) ? $filestr['comment'] : "";
	$class = isset($filestr['class']) ? $filestr['class'] : "";
	if($comment && $id && $class){
		$sql = new sql();
		$temp = $sql->where("id = {$id}")->update("homework",array("class"=>$class,"hw_comment"=>$comment,"comment_time"=>date('y-m-d h:i:s')));
		if($temp){
			var_dump($temp);
			$return['status_code'] = "200";
			$return['msg'] = "评价成功";	
		}
	}else{
		$return['status_code'] = "2006";
		$return['msg'] = "无评价内容";
	}
	exit(json_encode($return));
}

//dangao    id  status:dangao
if(isset($filestr['status']) && $filestr['status'] == 'dangao'){

	$id = isset($filestr['id']) ? $filestr['id'] : "";
	if($id){
		$sql = new sql();
		$data = $sql->where("homework.uid = {$id} and notice.hw_num = homework.hw_num order by homework.id desc")->select("notice,homework"); 
		if($data->num_rows){
			while($temp = mysqli_fetch_assoc($data)){
				$result[] = $temp;
			}
			$return['status_code'] = "200";
			$return['data'] = $result;
		}else{
			$return['status_code'] = "200";
			$return['msg'] = "暂无";
			$return['data'] = array(); 
		}
	}else{
		exit;
	}
	exit(json_encode($return));
}

//huifen  status:get_new_notice
if(isset($filestr['status']) && $filestr['status'] == "get_new_notice"){
	$sql = new sql();
	$data = $sql->order("id desc")->limit("1")->select("notice");
	//$data = mysqli_fetch_assoc($data);
	if($data->num_rows){
		$data = mysqli_fetch_assoc($data);
		//echo time()."<br>";
		//echo strtotime($data['end_time']);
		$notice_end_status = time()>strtotime($data['end_time'])? 4 : 1;
		exit(json_encode(array(
			"data"=>$data,
			"status_code"=>"200",
			"notice_end_status"=>$notice_end_status
		)));
	}else{
		exit(json_encode(array(
             "msg"=>"暂无公告",
             "status_code"=>"200",
	     "data"=>array()
        )));
	}
} 
