$(document).ready(function(){
  $('#delete_Btn').click(function(){
    var state = $('#event-tab').attr('aria-selected');

    //이벤트 탭 상황
    if(state == 'true'){
      var num_checked = $("input[name=event_CheckBox]:checked").length;

      if(num_checked==0){
        alert("체크해주세요");

        return false;
      }

      var checkbox = $("input[name=event_CheckBox]:checked");
      var jsonArr= [];

      checkbox.each(function(i) {

        // checkbox.parent() : checkbox의 부모는 <td>이다.
        // checkbox.parent().parent() : <td>의 부모이므로 <tr>이다.
        var tr = checkbox.parent().parent().eq(i);
        var td = tr.children();

        var json = new Object();

        json.id = td.eq(3).text();

        jsonArr.push(json); //json 값 담은 array
      });
      console.log("삭제할 이벤트 id 확인 : ");
      console.log(jsonArr);

      $.ajax({
        method      : 'POST',
        url         : 'http://localhost:3000/roaming_api/v1/event',
        traditional : true,
        dataType    : 'json',
        data        : {event_data : '04' + JSON.stringify(jsonArr)},
        success     : function(data) {

            console.log(data);

            if(data["성공여부"] == 1){
              alert("삭제되었습니다");

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
            }

            else{
              alert("삭제하지 못했습니다");

            }

        },
        error       : function(request, status, error) {
            //alert(error);
        }
      });
    }

    //이슈 탭 상황
    else{
      var num_checked = $("input[name=issue_CheckBox]:checked").length;

      if(num_checked==0){
        alert("체크해주세요");

        return false;
      }

      var checkbox = $("input[name=issue_CheckBox]:checked");
      var jsonArr= [];

      checkbox.each(function(i) {

        // checkbox.parent() : checkbox의 부모는 <td>이다.
        // checkbox.parent().parent() : <td>의 부모이므로 <tr>이다.
        var tr = checkbox.parent().parent().eq(i);
        var td = tr.children();

        var json = new Object();

        json.id = td.eq(5).text();

        jsonArr.push(json); //json 값 담은 array
      });
      console.log("삭제할 이벤트 id 확인 : ");
      console.log(jsonArr);

      $.ajax({
        method      : 'POST',
        url         : 'http://localhost:3000/roaming_api/v1/issue',
        traditional : true,
        dataType    : 'json',
        data        : {issue_data : '04' + JSON.stringify(jsonArr)},
        success     : function(data) {

            console.log(data);

            if(data["성공여부"] == 1){
              alert("삭제되었습니다");

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

            else{
              alert("삭제하지 못했습니다");

            }

        },
        error       : function(request, status, error) {
            //alert(error);
        }
      });
    }

  });
});
