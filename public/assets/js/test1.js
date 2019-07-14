$(document).ready(function(){
  $('#selectBtn').click(function(){
    //var data = [];
    var json = new Object();

    var string = "";
    var jsonArr= [];
    //var totalJson = new Object();
    var checkbox = $("input[name=CheckBox]:checked");

    // 체크된 체크박스 값을 가져온다
    checkbox.each(function(i) {

      // checkbox.parent() : checkbox의 부모는 <td>이다.
      // checkbox.parent().parent() : <td>의 부모이므로 <tr>이다.
      var tr = checkbox.parent().parent().eq(i);
      var td = tr.children();

      //data.push(tr.text());

      string = td.eq(2).text() + '-' + td.eq(3).text();
      json[i] = string.substring(0,string.length-1);


      //jsonArr.push(json);

      //tdArr.push(no);
      //arr.push(tdArr);
    });
    var data_checked = JSON.stringify(json);
    //totalJson[0] = jsonArr;
    //JSON.stringify(totalJson);
    //.serializeArray() : 선택한 form의 데이터를 ajax로 전송할 수 있도록  배열로 직렬화 한다.

    $.ajax({
      method      : 'GET',
      url         : 'http://localhost:3000/roaming_api/v1/card_subs',
      traditional : true,
      dataType    : 'html',
      data        : {data_checked:data_checked},
      success     : function(data) {

          console.log(data);
          $("#cards").html(data);

      },
      error       : function(request, status, error) {
          //alert(error);
      }

    });
  });
});
/*
    $.ajax({
          url: '/roaming_api/v1/card_subs',
          dataType: 'json',
          type: 'GET',
          data: {arr:tdArr}
  });*/
