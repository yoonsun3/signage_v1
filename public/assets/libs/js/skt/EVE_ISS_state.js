$(document).ready(function(){
  $('#event-tab').click(function(){

      $.ajax({
        method      : 'GET',
        url         : '/roaming_api/v1/event',
        traditional : true,
        dataType    : 'html',
        data        : {event_data: '00'},
        success     : function(data) {

            $("#eveSearch").html(data);


        },
        error       : function(request, status, error) {
            //alert(error);
        }
      });
  });

  $('#issue-tab').click(function(){

      $.ajax({
        method      : 'GET',
        url         : '/roaming_api/v1/issue',
        traditional : true,
        dataType    : 'html',
        data        : {issue_data: '00'},
        success     : function(data) {

            $("#issSearch").html(data);


        },
        error       : function(request, status, error) {
            //alert(error);
        }
      });
  });


});
