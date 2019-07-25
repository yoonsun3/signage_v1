function layer_open3(){

    var temp;
    var bg;

    temp = $('#layer6');
    bg = temp.prev().hasClass('bg');	//dimmed 레이어를 감지하기 위한 boolean 변수

    if(bg){
      $('#MCC_MNC_searchForm').fadeIn();	//'bg' 클래스가 존재하면 레이어가 나타나고 배경은 dimmed 된다.
    }
    else{
      temp.fadeIn();
    }

    // 화면의 중앙에 레이어를 띄운다.
    if (temp.outerHeight() < $(document).height() )
      temp.css('margin-top', '-'+temp.outerHeight()/2+'px');
    else
      temp.css('top', '0px');

    if (temp.outerWidth() < $(document).width() )
      temp.css('margin-left', '-'+temp.outerWidth()/2+'px');
    else
      temp.css('left', '0px');


    temp.find('#MCC_MNC_selectBtn').click(function(e){
      var num_checked = $("input[name=search_CheckBox]:checked").length;

      //console.log(num_checked);

      if(num_checked==0){
        alert("체크해주세요");

        return false;
      }

      else if(num_checked>1){
        alert("하나만 체크해주세요");
        $("input[name=search_CheckBox]:checked").each(function(i) {
            $(this).prop('checked', false);
        });
        return false;
      }

      else{
        var checkbox = $("input[name=search_CheckBox]:checked");

        // 체크된 체크박스 값을 가져온다
        checkbox.each(function(i) {

          // checkbox.parent() : checkbox의 부모는 <td>이다.
          // checkbox.parent().parent() : <td>의 부모이므로 <tr>이다.
          var tr = checkbox.parent().parent().eq(i);
          var td = tr.children();

          $("#issue_Country_name").val(td.eq(1).text());
          $("#issue_Operator_name").val(td.eq(2).text());
          $("#issue_MCC").val(td.eq(3).text());
          $("#issue_MNC").val(td.eq(4).text());

        });

      }

      if(bg){
        $('#MCC_MNC_searchForm').fadeOut(); //'bg' 클래스가 존재하면 레이어를 사라지게 한다.
      }
      else{
        temp.fadeOut();
      }
      e.preventDefault();

      $("input[name=search_CheckBox]:checked").each(function(i) {
          $(this).prop('checked', false);
      });
    });

    temp.find('#MCC_MNC_cancelBtn').click(function(e){
        if(bg){
          $('#MCC_MNC_searchForm').fadeOut(); //'bg' 클래스가 존재하면 레이어를 사라지게 한다.
        }
        else{
          temp.fadeOut();
        }

        $("input[name=search_CheckBox]:checked").each(function(i) {
            $(this).prop('checked', false);
        });

        e.preventDefault();
    });
  }
