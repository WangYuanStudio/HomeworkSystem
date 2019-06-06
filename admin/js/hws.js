$(document).ready(function() {

  $.ajax({
    url: 'http://hws.yowfung.cn/server/homework.php',
    type: 'post',
    dataType: 'json',
    data: '{"token":1234,"status":"homework"}',
  })

  .done(function(data) {

    console.log("success");
    
    var homework = data.data;
    
    $.each(homework,function(z,h) {
      var uname = h.hw_url.split('/')[h.hw_url.split('/').length - 1];
      uname = uname.split('_')[0];
	
	var comment = h.hw_comment == null ? 'null' : h.hw_comment.replace(/</g, '&lt;');
	comment = comment == null ? 'null' : comment.replace(/>/g, '&gt;');

      $("table#table2").append('<tr><td>'+h.id+'</td><td title="'+h.uid+'">'+uname+'</td><td>'+h.hw_num+'</td><td title="'+h.hw_url+'" style="white-space:nowrap; overflow:hidden;"><a href="'+h.hw_url+'">'+h.hw_url+'</a></td><td id="le'+h.id+'">'+h.class+'</td><td id="con'+h.id+'" style="white-space:nowrap; overflow:hidden;" title="'+comment+'">'+comment+'</td><td>'+h.time+'</td><td><button type="button" id="'+h.id+'" value="comment" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" data-whatever="@mdo">评价</button></td><td><button class="btn btn-default" type="submit" value="delete1" id="'+h.id+'">删除</button></td></tr>')
      

      
    });

    comment();



  })
  .fail(function() {
    console.log("error");
  })
  .always(function() {
    console.log("complete");
  });






  //评价按钮功能
  function comment(){

    $('button').on('click',function() {

      var concomment=$(this).attr('value');//获取按钮的值

/*      if (concomment == "comment") {
       $.ajax({
         url: '/path/to/file',
         type: 'post',
         dataType: 'json',
         data: {param1: 'value1'},
       })
       .done(function() {
         console.log("success");



       })
       .fail(function() {
         console.log("error");
       })
       .always(function() {
         console.log("complete");
       });
       

     }*/
     


    var commentid = $(this).attr('id');//获取按钮的id
    var concomment1=$(this).attr('value');//获取按钮的值

    if (concomment1=="comment") {

      $('#exampleModalLabel2').html(commentid);

      

    }


    if (concomment == "delete1") {

     alert("delete");
     $("input[id='recipient-name']").val("");
     $("textarea[id='message-text']").val("");

   }

   else if (concomment == "begin") {

    var conlevel = $('#recipient-name').val();
    var concontent = $('#message-text').val();
    var hwsid = $('#exampleModalLabel2').text();

    //更改格式
    var endconment =new Object();

    endconment.token="1234";
    endconment.status="comment";
    endconment.id=hwsid;
    endconment.class=conlevel;
    endconment.comment=concontent;

    var okconment = JSON.stringify(endconment);





    $.ajax({
      url: ' http://hws.yowfung.cn/server/homework.php',
      type: 'post',
      dataType: 'json',
      contentType : "application/json;charset=utf-8",

      data:okconment,

    })
    .done(function() {
      console.log("success");
      alert("已评价");
    })
    .fail(function() {
      console.log("error");
    })
    .always(function() {
      console.log("complete");
    });

//清空
$("input[id='recipient-name']").val("");
$("textarea[id='message-text']").val("");
//前端更改
$('#le'+hwsid+'').html(conlevel);
$('#con'+hwsid+'').html(concontent);
$('#con'+hwsid+'').attr("title",concontent);





}







});

  }





});
