$(document).ready(function(){
  $('#event_add_Btn').click(function(){

    var json = new Object();

    json.MCC = $('#event_MCC').val();
    json.start_year = $('#eventStYear').val();
    json.end_year = $('#eventEnYear').val();
    json.start_month = $('#eventStMon').val();
    json.end_month = $('#eventEnMon').val();
    json.start_day = $('#eventStDay').val();
    json.end_day = $('#eventEnDay').val();
    json.contents = $('#eventAdd').val();

    if($('#event_MNC').val()) //MNC 값이 있다면 없으면 생략~
      json.MNC = $('#event_MNC').val();

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

            $('#event_MCC').val('');
            $('#event_MNC').val('');
            $('#event_Country_name').val('');
            $('#event_Operator_name').val('');
            $('#eventStYear').val('');
            $('#eventEnYear').val('');
            $('#eventStMon').val('');
            $('#eventEnMon').val('');
            $('#eventStDay').val('');
            $('#eventEnDay').val('');
            $('#eventAdd').val(''); //추가 후 입력창 초기화

            //이벤트 목록 업데이트
            $.ajax({
              method      : 'GET',
              url         : 'http://localhost:3000/roaming_api/v1/event',
              traditional : true,
              dataType    : 'html',
              data        : {event_data: '00'},
              success     : function(data) {

                  console.log(data);
                  $("#eveSearch").html(data);


              },
              error       : function(request, status, error) {
                  //alert(error);
              }
            });

            $.ajax({
        			url: "/roaming_api/v1/card_subs?data_checked=07",
        			method: "GET",
              dataType: 'html',
              success: function(data) {
                  $("#card").html(data);
              },
              error       : function(request, status, error) {
                  //alert(error);
              }
        		});

          }
          else{alert("추가하지 못했습니다");}

      },
      error       : function(request, status, error) {
          //alert(error);
      }
    });
  });
});
