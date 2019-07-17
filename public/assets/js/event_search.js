$(document).ready(function(){
  $('#event_search_Btn').click(function(){

    var json_tmp = new Object();
    var json = new Object();

    json_tmp.id = $('#eventID').val();
    json_tmp.start_year = $('#eventStYear').val();
    json_tmp.end_year = $('#eventEnYear').val();
    json_tmp.start_month = $('#eventStMon').val();
    json_tmp.end_month = $('#eventEnMon').val();
    json_tmp.start_day = $('#eventStDay').val();
    json_tmp.end_day = $('#eventEnDay').val();
    json_tmp.contents = $('#eventAdd').val();

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
          console.log(data[0]);

          $("#eveSearch").html(data);

          $('#eventID').val('');
          $('#eventStYear').val('');
          $('#eventEnYear').val('');
          $('#eventStMon').val('');
          $('#eventEnMon').val('');
          $('#eventStDay').val('');
          $('#eventEnDay').val('');
          $('#eventAdd').val(''); //조회 후 입력창 초기화


      },
      error       : function(request, status, error) {
          //alert(error);
      }
    });
  });


  $('#event_allsearch_Btn').click(function(){

    $.ajax({
      method      : 'GET',
      url         : 'http://localhost:3000/roaming_api/v1/event',
      traditional : true,
      dataType    : 'html',
      data        : {event_data : '02'},
      success     : function(data) {

          $("#eveSearch").html(data);

      },
      error       : function(request, status, error) {
          //alert(error);
      }
    });
  });
});
