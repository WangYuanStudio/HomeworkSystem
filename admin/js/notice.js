$(document).ready(function() {

  $('button#button4').on('click',function() {


    var noticeid = $(this).attr("id");
    var noticeval=$(this).attr('value');
    
    //获取内容
    var title = $('#notice_title').val();  //标题
    var content = $('#notice_content').val(); //内容
    var cishu = $('#notice_cishu').val();//第几次
    var time = $('#notice').val();//获得结束时间


//更改格式
  var endnotice =new Object();
  endnotice.token="1234";
  endnotice.status="p_notice";
  endnotice.title=$('#notice_title').val(); 
  endnotice.content=$('#notice_content').val();
  endnotice.hw_num=$('#notice_cishu').val();
  endnotice.end_time=$('#iendtime').val();

  var oknotice = JSON.stringify(endnotice);




    if (noticeval == "notice") {
     
  alert(oknotice);

      $.ajax({
        url: 'http://hws.yowfung.cn/server/homework.php',
        type: 'post',
        dataType: 'json',
        contentType : "application/json;charset=utf-8",
        data:oknotice,
      })
      .done(function() {

        console.log("success");

        alert("发布成功");



      })
      .fail(function() {
        console.log("error");
      })
      .always(function() {
        console.log("complete");
      });
      


    }


  });



});
