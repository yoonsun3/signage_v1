$(document).ready(function(){
  $('#event_add_Btn').click(function(){

    var json = new Object();

    json.start_year = $('#eventStYear').val();
    json.end_year = $('#eventEnYear').val();
    json.start_month = $('#eventStMon').val();
    json.end_month = $('#eventEnMon').val();
    json.start_day = $('#eventStDay').val();
    json.end_day = $('#eventEnDay').val();
    json.contents = $('#eventAdd').val();

    for(var key in json){
      if(json[key] == ""){
        alert(key + " 값을 입력해주세요");
        return false;
      }
    }

    console.log(json);

    $.ajax({
      method      : 'POST',
      url         : 'http://localhost:3000/roaming_api/v1/event',
      traditional : true,
      dataType    : 'json',
      data        : {event_data : '02' + JSON.stringify(json)},
      success     : function(data) {

          console.log(data);

          if(data["성공여부"] == 1){
            alert("추가되었습니다");

            $('#eventStYear').val('');
            $('#eventEnYear').val('');
            $('#eventStMon').val('');
            $('#eventEnMon').val('');
            $('#eventStDay').val('');
            $('#eventEnDay').val('');
            $('#eventAdd').val(''); //추가 후 입력창 초기화
          }

          else{alert("추가하지 못했습니다");}

      },
      error       : function(request, status, error) {
          //alert(error);
      }
    });
  });
});
