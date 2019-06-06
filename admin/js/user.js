

//用户获取
$(document).ready(function() {
      var token = getUrlPra('token');
      $.ajax({
        url: '../../server/admin.php',
        type: 'POST',
        dataType: 'text',
        data: {token: token},
      })

      .always(function(data) {
        if(data != 'success'){
          var html = "<center><h1>308 Forbidden</h1></center><hr><center>Wangyuan/2017.308</center>"
          $('body').html(html);
          $('body h1').css({
                display: 'block',
                fontSize: '2em',
                WebkitMarginBefore: '0.67em',
                WebkitMarginAfter: '0.67em',
                WebkitMarginStart: '0px',
                WebkitMarginEnd: '0px',
                fontWeight: 'bold'
          });
          $('body').css('font-family', '');
          return;
        }
      })

      





        // $.post('http://hws.yuanmoc.com/server/users.php', '{ "status":"user","current_page":1}',
        //     function(data,status) {
        //         alert(data);
        //     });

        $.ajax({
          url: '../../server/users.php',
          type: 'post',
          dataType: 'json',
          data: '{"token":1234,"status":"user","current_page":1}',
        })

        .done(function(data) {

          console.log("success");
          var username = data.data;


          $.each(username,function(i,u) {


            $("table#table1").append('<tr id="w'+u.id+'"><td><span>'+u.id+'</span></td><td><span id="upna'+u.id+'">'+u.uname+'</span></td><td><span id="upnum'+u.id+'">'+u.Sno+'</span></td><td><span>'+u.password+'</span></td><td><span><span id="upsex'+u.id+'">'+u.sex+'</span></span></td><td><span><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal2" data-whatever="@fat" id="'+u.id+'" >Edit</button></td><td><button class="btn btn-default" type="submit" id="'+u.id+'"  value ="enabled">Enabled</button></span></td></tr>');

          });

          ADDbangding();//按钮函数

        })
        .fail(function() {
          console.log("error");
        })
        .always(function() {
          console.log("complete");
        });


        //编辑禁用
        
        function ADDbangding(){
          $('button').on('click',function() {

            var uid = $(this).attr('id'); 
            var usercaozuo = $(this).attr('value');
            $('#exampleModalLabel').html(uid);
            


            if (usercaozuo=="userbegin") {

              var userid = $('#exampleModalLabel').text();

              var name = $('#newname').val();
              var sno=$('#newstunumber').val();
              var nsex=$('#newsex').val();


              //更改格式
              var endedit =new Object();
              endedit.token="1234";
              endedit.status="update_user";
              endedit.uid=$('#exampleModalLabel').text();
              endedit.uname=$('#newname').val();
              endedit.Sno=$('#newstunumber').val();
              endedit.sex=$('#newsex').val();
              var okedit = JSON.stringify(endedit);

              

              $.ajax({
                url: 'http://hws.yowfung.cn/server/users.php',
                type: 'post',
                dataType: 'json',
                contentType : "application/json;charset=utf-8",
                data:okedit,
              })
              .done(function() {
                console.log("success");
                alert("更改成功");
              })
              .fail(function() {
                console.log("error");
              })
              .always(function() {
                console.log("complete");
              });

              $("input[id='newname']").val("");

              $("input[id='newstunumber']").val("");

              $("input[id='newsex']").val("");

              $('#upsex'+userid+'').html(nsex);
              $('#upnum'+userid+'').html(sno);
              $('#upna'+userid+'').html(nsex);




            }
            

            if (usercaozuo=="enabled") {

              var enabled = $(this).attr('id');
              //更改格式
              var endenable =new Object();
              endenable.token="1234";
              endenable.status="u_status";
              endenable.user_status="B";
              endenable.uid=enabled;

              var okenable = JSON.stringify(endenable);


              $.ajax({
                url: 'http://hws.yowfung.cn/server/users.php',
                type: 'post',
                dataType: 'json',
                contentType : "application/json;charset=utf-8",
                data:okenable,
              })
              .done(function() {
                console.log("success");
                alert("已封号");
              })
              .fail(function() {
                console.log("error");
              })
              .always(function() {
                console.log("complete");
              });




            }


          });
        }

/*            $('#w'+uid+'').after('<tr id="updatauser1"><td><input type="text" id="nameid" placeholder="姓名"></td><td><input type="text" placeholder="学号" id="snoid"></td><td><input type="text" placeholder="性别" id="sexid"></td><td><button class="btn btn-default" type="submit" value="sure">确定</button><button class="btn btn-default" type="submit" value="cancel">取消</button></td></tr>');
*/
            //updatauser();字按钮（suer and cancel）


        //function updatauser(){

         //$('button').on('click',function() { 

           //var zid = "z"+$(this).attr('id');
          // var svalue = $(this).attr('value');获取按钮的值

           //获取更改的id

/*           var snoid = "upnum"+$(this).attr('id');
           var nsexid = "upsex"+$(this).attr('id');
           var nameid = "upna"+$(this).attr('id');
           */

          //获取更改的值  
/*          var sno = $('#'+snoid+'').val();
          var nsex = $('#'+nsexid+'').val();
          var name = $('#'+nameid+'').val();*/

         // if (svalue=="sure") {

            //$('#updatauser1').hide();

            //获取值
            //var sno = $('#nameid').val();
           //var nsex=$('#sexid').val();
            //var name=$('#nameid').val();


            //alert(sno);

/*            $.ajax({
              url: 'http://hws.yuanmoc.com/server/users.php',
              type: 'post',
              dataType: 'json',
              data:'{"token":"1234","status":"update_user","uname":"name","Sno" :"16115072044", "sex":"女","uid":2}',
            })
            .done(function() {
              console.log("success");

              alert("更改成功");
            })  
            .fail(function() {
              console.log("error");
            })
            .always(function() {
              console.log("complete");
            });
            


          }
          else{


            $('#updatauser1').hide();

          }*/

        // });








       //}


     });



//获取URL参数
function getUrlPra(key){
    var reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)");      //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);        //匹配目标参数
    if (r != null) return decodeURIComponent(r[2]); return null;  //返回参数值
}
