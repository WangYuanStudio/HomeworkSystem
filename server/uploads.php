<?php

include_once("sql.php");

// $filestr = file_get_contents("php://input");


$filestr = $_POST;

//获取文件
$file = $_FILES;

// var_dump($file);
// var_dump($filestr);

//上传   token  uid   status:upload  hw_num作业充序数  file_key:file 
if(isset($filestr['status']) && $filestr['status'] == 'upload' && $file){
	if(isset($filestr['token'])){
		$hw_num = isset($filestr['hw_num']) ? $filestr['hw_num'] : "temp";//加+
		$uid = isset($filestr['uid'])?$filestr['uid']:"";
		if(!is_numeric($uid)){exit;}
		$sql = new sql();
		$data = $sql->where("id = {$filestr['uid']}")->select("users");
		if($data->num_rows){
			$data = mysqli_fetch_assoc($data);
			if($filestr['token'] == $data['token']){

			   //验证文件状态号
				if($file['file']['error'] == 0){
					//echo $file['file']['size'];
					if($file['file']['size'] > 20971520){
						$return['status_code'] = '1005';
						$return['msg'] = "文件过大";
						exit(json_encode($return));
					}

					//验证文件类型
					$ext = strtolower(end(explode('.', $file['file']['name'])));
					$ext_type = array('zip','rar','7z');
					if(in_array($ext,$ext_type)){

						//判断文件夹目录
						if (!file_exists ("../homework/{$hw_num}")) { //加+
							mkdir("../homework/{$hw_num}", 0777, true);//加+
							chmod("../homework/{$hw_num}", 0777);
						}

						//判断是否已经交过作业
						if($data['w_status'] == $filestr['hw_num']){
							$sql = new sql();
							$result = $sql->where("uid = {$data['id']} and hw_num = {$filestr['hw_num']}")->select("homework");
							if($result->num_rows){
								$result = mysqli_fetch_assoc($result);

								$filename = $result['hw_url'];
								//改变编码为gbk
								$filename = mb_convert_encoding($filename,"gbk", "utf-8");

								if(move_uploaded_file($file['file']['tmp_name'], $filename)){
									$return['status_code'] = '200';
									$return['msg'] = "上传成功";
								}


							}else{
								exit;
							}
					    //还没有交过作业
						}else{


						// $time = date('y年m月d日h点');
						$time = time();
						$filename = $time.' '.$data['uname'].'.'.$ext;

						//utf-8编码的文件路径
						$hw_url = "../homework/{$hw_num}/{$filename}";//加+

						//改变编码为gbk
						//$filename = mb_convert_encoding($filename,"gbk", "utf-8");
						if(move_uploaded_file($file['file']['tmp_name'], "../homework/{$hw_num}/{$filename}")){//加+
							$data = array(
								"uid"=>$filestr['uid'],
								"hw_url"=>$hw_url,
								"hw_num"=>$filestr['hw_num'],
								"time"=>date('y-m-d')
							);

							$sql = new sql();

							if($sql->insert("homework",$data)){
								$sql = new sql();
								$sql->where("id = {$filestr['uid']}")->update("users",array("w_status"=>$filestr['hw_num']));
								$return['status_code'] = '200';
								$return['msg'] = "上传成功";
							}

						}else{
								$return['status_code'] = '1005';
								$return['msg'] = "上传失败";
							}	
					}

					}else{
						$return['status_code'] = '1004';
						$return['msg'] = "文件类型错误";
					}
				}else{
					$return['status_code'] = '1003';
					$return['msg'] = "上传失败";
				}
			}
	    }
	      exit(json_encode($return));
	}
}
