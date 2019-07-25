$(document).ready(function(){

  $('#issue_add_Btn').click(function(){

    var json = new Object();

    json.MCC = $('#issue_MCC').val();
    json.MNC = $('#issue_MNC').val();
    json.year = $('#issueYear').val();
    json.month = $('#issueMon').val();
    json.day = $('#issueDay').val();
    json.contents = $('#issueAdd').val();

    for(var key in json){
      if(json[key] == ""){
        alert(key + " 값을 입력해주세요");
        return false;
      }
    }


    console.log(json);

    $.ajax({
      method      : 'POST',
      url         : 'http://localhost:3000/roaming_api/v1/issue',
      traditional : true,
      dataType    : 'json',
      data        : {issue_data : '02' + JSON.stringify(json)},
      success     : function(data) {

          console.log(data);

          if(data["성공여부"] == 1){
            alert("추가되었습니다");

            $('#issue_MCC').val('');
            $('#issue_MNC').val('');
            $('#issue_Country_name').val('');
            $('#issue_Operator_name').val('');
            $('#issueYear').val('');
            $('#issueMon').val('');
            $('#issueDay').val('');
            $('#issueAdd').val('');//초기화

            $.ajax({
              method      : 'GET',
              url         : 'http://localhost:3000/roaming_api/v1/issue',
              traditional : true,
              dataType    : 'html',
              data        : {issue_data: '00'},
              success     : function(data) {

                  console.log(data);
                  $("#issSearch").html(data);


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
