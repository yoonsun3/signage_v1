$(document).ready(function(){
  $("#excelDown").click(function () {
    var uri =  $("#excelInfo").excelexportjs({
                  containerid: "excelInfo",
                  datatype: 'table',
                  returnUri: true
                });
    $(this).attr('download', 'totalInfo.xls').attr('href', uri).attr('target', '_blank');
  });


  $("#allCheck").click(function(){
    if($("#allCheck").prop("checked")) {  //만약 전체 선택 체크박스가 체크된상태일경우
      $("input[name=CheckBox]").prop("checked",true); //해당화면에 전체 checkbox들을 체크해준다
    }
    else { // 전체선택 체크박스가 해제된 경우
      $("input[name=CheckBox]").prop("checked",false); //해당화면에 모든 checkbox들의 체크를해제시킨다.
    }
  });


  $('#selectBtn').click(function(){
    //var data = [];
    //체크 개수 세서 0개 체크했으면 체크해달라고 alert 띄우기
    var num_checked = $("input[name=CheckBox]:checked").length;

    if(num_checked==0){
      alert("체크해주세요");

      return false;
    }

    else{
      var checkbox = $("input[name=CheckBox]:checked");
      var jsonArr= [];

      // 체크된 체크박스 값을 가져온다
      checkbox.each(function(i) {

        // checkbox.parent() : checkbox의 부모는 <td>이다.
        // checkbox.parent().parent() : <td>의 부모이므로 <tr>이다.
        var tr = checkbox.parent().parent().eq(i);
        var td = tr.children();

        var json = new Object();

        json.MCC = td.eq(9).text();
        json.MNC = td.eq(10).text();

        jsonArr.push(json); //json 값 담은 array
      });


      $.ajax({
        method      : 'GET',
        url         : '/roaming_api/v1/card_subs',
        traditional : true,
        dataType    : 'html',
        data        : {data_checked: '01'+JSON.stringify(jsonArr)} //JSON.stringify(jsonArr)은 서버에 데이터 보내기 위해 데이터를 string으로 바꿔주는 것
      })
      .done(function(data){
          $("#cards").html(data);
      });
    }
  });
});
