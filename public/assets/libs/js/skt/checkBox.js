$(document).ready(function(){
  $('#selectBtn').click(function(){
    //var data = [];

    //체크 개수 세서 0개 체크했으면 체크해달라고 alert 띄우기
    var num_checked = $("input[name=CheckBox]:checked").length;

    //console.log(num_checked);

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

      console.log("check한 사업자 MCC&MNC 확인 : ");
      console.log(jsonArr);

      $.ajax({
        method      : 'GET',
        url         : 'http://localhost:3000/roaming_api/v1/card_subs',
        traditional : true,
        dataType    : 'html',
        data        : {data_checked: '01'+JSON.stringify(jsonArr)}, //JSON.stringify(jsonArr)은 서버에 데이터 보내기 위해 데이터를 string으로 바꿔주는 것
        success     : function(data) {

            console.log(data);
            $("#cards").html(data);

        },
        error       : function(request, status, error) {
            //alert(error);
        }
      });
    }
  });
});
