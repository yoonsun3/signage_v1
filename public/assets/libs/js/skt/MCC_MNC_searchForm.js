function MCC_MNC_search(){
    var state = $('#event-tab').attr('aria-selected');
    var temp;
    var bg;

    //이벤트 탭일 때
    if(state == 'true'){
      temp = $('#layer6');
      bg = temp.prev().hasClass('bg');	//dimmed 레이어를 감지하기 위한 boolean 변수

      if(bg){
        $('#MCC_MNC_searchForm_event').fadeIn();	//'bg' 클래스가 존재하면 레이어가 나타나고 배경은 dimmed 된다.
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


      $('#MCC_MNC_selectBtn_event').click(function(e){
        e.preventDefault();
      });

      temp.find('#MCC_MNC_cancelBtn_event').click(function(e){
          if(bg){
            $('#MCC_MNC_searchForm_event').fadeOut(); //'bg' 클래스가 존재하면 레이어를 사라지게 한다.
          }
          else{
            temp.fadeOut();
          }
          $("input[name=search_CheckBox_event]:checked").prop('checked', false);
          e.preventDefault();
      });
    }

    //이슈 탭일 때
    else{
      temp = $('#layer7');
      bg = temp.prev().hasClass('bg');	//dimmed 레이어를 감지하기 위한 boolean 변수

      if(bg){
        $('#MCC_MNC_searchForm_issue').fadeIn();	//'bg' 클래스가 존재하면 레이어가 나타나고 배경은 dimmed 된다.
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


      $('#MCC_MNC_selectBtn_issue').click(function(e){
        e.preventDefault();
      });


      temp.find('#MCC_MNC_cancelBtn_issue').click(function(e){
          if(bg){
            $('#MCC_MNC_searchForm_issue').fadeOut(); //'bg' 클래스가 존재하면 레이어를 사라지게 한다.
          }
          else{
            temp.fadeOut();
          }
          $("input[name=search_CheckBox_issue]:checked").prop('checked', false);
          e.preventDefault();
      });
    }
}
