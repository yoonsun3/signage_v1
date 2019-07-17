$(document).ready(function(){
  $('#event_delete_Btn').click(function(){

    var json = new Object();

    json.id = $('#eventID').val();

    if(json['id'] == ""){
      alert("이벤트 번호를 입력해주세요");
      return false;
    }

    console.log(json);

    $.ajax({
      method      : 'POST',
      url         : 'http://localhost:3000/roaming_api/v1/event',
      traditional : true,
      dataType    : 'json',
      data        : {event_data : '04' + JSON.stringify(json)},
      success     : function(data) {

          console.log(data);

          if(data["성공여부"] == 1){
            alert("삭제되었습니다");

            $('#eventID').val(''); //삭제 후 입력창 초기화
          }

          else{alert("삭제하지 못했습니다");}

      },
      error       : function(request, status, error) {
          //alert(error);
      }
    });
  });
});
