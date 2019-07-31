$(document).ready(function(){

  $("#search").keydown(function(key) {
      if (key.keyCode == 13){

        var input = $('#search').val();
        var type = $('#select_option').val();

        console.log(input);
        console.log(type);

      if(type == ''){
        alert("Type을 골라주세요");
        return false;
      }

      if(input == ''){
        alert("검색할 내용을 입력해주세요");
        return false;
      }

      console.log(type+input);

      $.ajax({
        method      : 'GET',
        url         : 'http://localhost:3000/roaming_api/v1/card_subs',
        traditional : true,
        dataType    : 'html',
        data        : {data_checked: type+input},
        success     : function(data) {

            console.log(data);

            if(!data){alert("검색결과가 없습니다.")} //넘어온 데이터가 비어있을 경우 알람띄우게 함
            else{ $("#cards").html(data);}
            //$('#search').val(''); //검색 후 검색창 초기화

        },
        error       : function(request, status, error) {
            //alert(error);
        }
      });
    }
  });

  $("#search-icon").click(function() {
        var input = $('#search').val();
        var type = $('#select_option').val();

        console.log(input);
        console.log(type);

      if(type == ''){
        alert("Type을 골라주세요");
        return false;
      }

      if(input == ''){
        alert("검색할 내용을 입력해주세요");
        return false;
      }

      console.log(type+input);

      $.ajax({
        method      : 'GET',
        url         : 'http://localhost:3000/roaming_api/v1/card_subs',
        traditional : true,
        dataType    : 'html',
        data        : {data_checked: type+input},
        success     : function(data) {

            console.log(data);

            if(!data){alert("검색결과가 없습니다.")} //넘어온 데이터가 비어있을 경우 알람띄우게 함
            else{ $("#cards").html(data);}
            // $('#search').val(''); //검색 후 검색창 초기화

        },
        error       : function(request, status, error) {
            //alert(error);
        }
      });
  });

});
