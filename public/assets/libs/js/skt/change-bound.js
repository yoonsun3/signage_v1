$(document).ready(function(){
    var state=0;
    $('#btn-ob').click(function(){
  		state=0;
  		$(this).addClass('btn-secondary');
  		$(this).removeClass('btn-outline-secondary');
  		$('#btn-ib').addClass('btn-outline-secondary');
  		$('#btn-ib').removeClass('btn-secondary');
          $.ajax({
        url: "/roaming_api/v1/card_subs?data_checked=10",
        dataType    : 'html',
        method: "GET"
  		})
  		.done(function(data){
        $("#cards").html(data);/*
  			var result = data;
  			for(var i = 0; i < result.length; i++){
  				console.log(result[i]);
  				$("#roaming-card-"+i).find(".card-txt-country-name").html(result[i].country_name);
  				$("#roaming-card-"+i).find(".card-txt-operator-name").html(result[i].operator_name);
  				$("#roaming-card-"+i).find(".card-txt-lte-count").html(result[i].subs_count_LTE_string);
  				$("#roaming-card-"+i).find(".card-txt-3g-count").html(result[i].subs_count_3G_string);
  				$("#roaming-card-"+i).find(".card-txt-local-time").html(result[i].date);

        }//*/
  		});
    });

    $('#btn-ib').click(function(){
  		var state=1;
  		$(this).addClass('btn-secondary');
  		$(this).removeClass('btn-outline-secondary');
  		$('#btn-ob').addClass('btn-outline-secondary');
  		$('#btn-ob').removeClass('btn-secondary');
          $.ajax({
  			url: "/roaming_api/v1/card_subs?data_checked=11",
        dataType    : 'html',
        method: "GET"
  		})

  		.done(function(data){
        $("#cards").html(data);/*
  			var result = data;
  			for(var i = 0; i < result.length; i++){
  				console.log(result[i]);
  				$("#roaming-card-"+i).find(".card-txt-country-name").html(result[i].country_name);
  				$("#roaming-card-"+i).find(".card-txt-operator-name").html(result[i].operator_name);
  				$("#roaming-card-"+i).find(".card-txt-lte-count").html(result[i].subs_count_LTE_string);
  				$("#roaming-card-"+i).find(".card-txt-3g-count").html(result[i].subs_count_3G_string);
  				$("#roaming-card-"+i).find(".card-txt-local-time").html(result[i].date);
  			}
        //*/
  		});
    });
});
