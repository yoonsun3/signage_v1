$(document).ready(function(){
  $('#MCC_MNC_selectBtn_event').click(function(){
    var checkbox = $("input[name=search_CheckBox_event]:checked");
    var num_checked = checkbox.length;

    if(num_checked==0){
      alert("체크해주세요");
      return;
    }

    else if(num_checked>1){
      alert("하나만 체크해주세요");
      checkbox.prop('checked', false);
      return;
    }

    else{
      // 체크된 체크박스 값을 가져온다
        var tr = checkbox.parent().parent().eq(0);
        var td = tr.children();

        $("#event_Country_name").val(td.eq(1).text());
        $("#event_Operator_name").val(td.eq(2).text());
        $("#event_MCC").val(td.eq(3).text());
        $("#event_MNC").val(td.eq(4).text());
        checkbox.prop('checked', false);

        $('#MCC_MNC_searchForm_event').fadeOut();
    }
  });

  $('#MCC_MNC_selectBtn_issue').click(function(){
    var checkbox = $("input[name=search_CheckBox_issue]:checked");
    var num_checked = checkbox.length;

    if(num_checked==0){
      alert("체크해주세요");
      return;
    }

    else if(num_checked>1){
      alert("하나만 체크해주세요");
      checkbox.prop('checked', false);
      return;
    }

    else{
      // 체크된 체크박스 값을 가져온다
        var tr = checkbox.parent().parent().eq(0);
        var td = tr.children();

        $("#issue_Country_name").val(td.eq(1).text());
        $("#issue_Operator_name").val(td.eq(2).text());
        $("#issue_MCC").val(td.eq(3).text());
        $("#issue_MNC").val(td.eq(4).text());
        checkbox.prop('checked', false);

        $('#MCC_MNC_searchForm_event').fadeOut();
        e.preventDefault();
    }
  });

});
