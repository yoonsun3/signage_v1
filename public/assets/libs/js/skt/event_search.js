$(document).ready(function(){
  $('#event_search_Btn').click(function(){

    var json_tmp = new Object();
    var json = new Object();

    json_tmp.start_year = $('#eventStYear2').val();
    json_tmp.end_year = $('#eventEnYear2').val();
    json_tmp.start_month = $('#eventStMon2').val();
    json_tmp.end_month = $('#eventEnMon2').val();
    json_tmp.start_day = $('#eventStDay2').val();
    json_tmp.end_day = $('#eventEnDay2').val();
    json_tmp.contents = $('#eventSearch').val();

    for(var key in json_tmp){
      if(json_tmp[key] == ""){
        continue;
      }
      json[key] = json_tmp[key];
    }

    console.log(json);

    $.ajax({
      method      : 'GET',
      url         : 'http://localhost:3000/roaming_api/v1/event',
      traditional : true,
      dataType    : 'html',
      data        : {event_data : '01'+JSON.stringify(json)},
      success     : function(data) {

          console.log(data);

          $("#eveSearch").html(data);

          $('#eventStYear').val('');
          $('#eventEnYear').val('');
          $('#eventStMon').val('');
          $('#eventEnMon').val('');
          $('#eventStDay').val('');
          $('#eventEnDay').val('');
          $('#eventSearch').val(''); //조회 후 입력창 초기화

      },
      error       : function(request, status, error) {
          //alert(error);
      }
    });
  });
});
