$(document).ready(function(){
  $('#issue_search_Btn').click(function(){

    var json_tmp = new Object();
    var json = new Object();

    json_tmp.country_name = $('#issue_Country_name2').val();
    json_tmp.operator_name = $('#issue_Operator_name2').val();
    json_tmp.year = $('#issueYear2').val();
    json_tmp.month = $('#issueMon2').val();
    json_tmp.day = $('#issueDay2').val();
    json_tmp.contents = $('#issueSearch').val();

    for(var key in json_tmp){
      if(json_tmp[key] == ""){
        continue;
      }
      json[key] = json_tmp[key];
    }

    console.log(json);

    $.ajax({
      method      : 'GET',
      url         : 'http://localhost:3000/roaming_api/v1/issue',
      traditional : true,
      dataType    : 'html',
      data        : {issue_data : '01'+JSON.stringify(json)},
      success     : function(data) {

          console.log(data);

          $("#issSearch").html(data);

          $('#issue_Country_name2').val('');
          $('#issue_Operator_name2').val('');
          $('#issueYear2').val('');
          $('#issueMon2').val('');
          $('#issueDay2').val('');
          $('#issueSearch').val('');//조회 후 입력창 초기화

      },
      error       : function(request, status, error) {
          //alert(error);
      }
    });
  });
});
