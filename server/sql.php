<?php
/**
time: 2017-10-7
v:1.0
author:yuanmoc
**/
include_once("sqlConf.php");

class sql{

	//sql语句
	private $sql;

	//mysql实例
	private $con="";

	/**
	 * 连接数据库
	 */
	public function __construct(){
		global $conf;
		$this->con = @new mysqli($conf['host'],$conf['name'],$conf['pwd'],$conf['database'],$conf['port']);
		if($this->con->connect_errno){
			exit("连接错误");
		}
		$this->con->query("set names utf8");
	}

	/**
	 * query
	 * @param  string $sql sql语句
	 * @return [type]      [description]
	 */
	protected function query($sql=""){
		return $this->con->query($sql);
	}

	/**
	 * insert ------
	 * @param  array  $data insert values
	 * @return [type]       [description]
	 */
	protected function explain_insert($data=array()){
		$sql = "(";
		$key = array_keys($data);
		$value = array_values($data);
		for($i = 0; $i < count($data); $i++){
			$sql.=$key[$i];
			if($i < count($data) - 1){
				$sql.=",";
			}
		}
		$sql.=")values(";
		for($i = 0; $i < count($data); $i++){
			$sql.="'{$value[$i]}'";
			if($i < count($data) - 1){
				$sql.=",";
			}
		}
		$sql.=")";
		return $sql;

	}

	protected function explain_update($data = array()){
		$sql = "";
		$key = array_keys($data);
		$value = array_values($data);
		for($i = 0; $i < count($data); $i++){
			$sql.="{$key[$i]} = '{$value[$i]}'";
			if($i < count($data) - 1){
				$sql.=",";
			}
		}
		return $sql;
	}

	/**
	 * where
	 * @param  string $where 条件
	 * @return [type]        [description]
	 */
	public function where($where=""){
		$this->sql.=" where {$where}";
		return $this;
	}

	/**
	 * order
	 * @param  string $order 条件
	 * @return [type]        [description]
	 */
	public function order($order=""){
		$this->sql.=" order by {$order}";
		return $this;
	}

	/**
	 * limit
	 * @param  string $n 始
	 * @param  string $m 终
	 * @return [type]    [description]
	 */
	public function limit($n="",$m=""){
		if($m){
			$this->sql.=" limit {$n},{$m}";
		}else{
			$this->sql.=" limit {$n}";
		}
		return $this;
	}

	/**
	 * insert
	 * @param  [type] $table 表
	 * @param  array  $data  插入数据
	 * @return [type]        [description]
	 */
	public function insert($table,$data=array()){
		$sql = "insert into {$table} ";
		$sql.=$this->explain_insert($data);
		// echo $sql;
		return $this->query($sql);
	}

	/**
	 * select
	 * @param  string $table 表
	 * @return [type]        [description]
	 */
	public function select($table){
		$sql = "select * from {$table} ";
		$sql.=$this->sql;
		//echo $sql;
		return $this->query($sql);
	}

	/**
	 * count
	 * @param  [type] $table 表名
	 * @return [type]        [description]
	 */
	public function count($table){
		$data = $this->select($table);
		return $data->num_rows;
	}

	/**
	 * delete
	 * @param  [type] $table 表名
	 * @return [type]        [description]
	 */
	public function delete($table){
		$sql = "delete from {$table} ";
		$sql.=$this->sql;
		return $this->query($sql);
	}

	/**
	 * update
	 * @param  [type] $table 表名
	 * @param  array  $data  [description]
	 * @return [type]        [description]
	 */
	public function update($table,$data = array()){
		$sql = "update {$table} set ";
		$sql.=$this->explain_update($data);
		$sql.=$this->sql;
		// echo $sql;
		return $this->query($sql);
	}

}

// $sql = new sql();
// $data = array(
// 	'uname'=>'陈滚瓜',
// 	'Sno'=>'16115072040'
// );
// $return = $sql->where("id = 1")->update("users",$data);
// $return = $sql->where("id = 1")->order("id desc")->count("users");
// $return = $sql->where("id = 2")->delete("users");
// var_dump($return);
// $data=array(
// 	'uname'=>'陈滚瓜',
// 	'Sno'=>'16115072040',
// 	'password'=>'555',
// 	'w_status'=>'1',
// 	'u_status'=>'1',
// 	'token'=>'333'
// );
// $sql->insert('users',$data);
