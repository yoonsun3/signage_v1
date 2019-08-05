$(document).ready(function(){
  $('#event_search_Btn').click(function(){

    var json_tmp = new Object();
    var json = new Object();

    json_tmp.country_name = $('#event_Country_name2').val();
    json_tmp.operator_name = $('#event_Operator_name2').val();
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
      url         : '/roaming_api/v1/event',
      traditional : true,
      dataType    : 'html',
      data        : {event_data : '01'+JSON.stringify(json)}
    })
    .done(function(data){
      console.log(data);

      $("#eveSearch").html(data);

      $('#event_Country_name2').val('');
      $('#event_Operator_name2').val('');
      $('#eventStYear2').val('');
      $('#eventEnYear2').val('');
      $('#eventStMon2').val('');
      $('#eventEnMon2').val('');
      $('#eventStDay2').val('');
      $('#eventEnDay2').val('');
      $('#eventSearch').val(''); //조회 후 입력창 초기화
    });
  });
});
