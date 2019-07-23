$(document).ready(function(){
	
	function ajaxDdonny(){
		$.ajax({
			url: "/roaming_api/v1/card_subs?data_checked=00",
			method: "GET"
		})
		.done(function(data){
			var result = data;
			for(var i = 0; i < result.length; i++){
				console.log(result[i]);
				$("#roaming-card-"+i).find(".card-txt-country-name").html(result[i].country_name);
				$("#roaming-card-"+i).find(".card-txt-operator-name").html(result[i].operator_name);
				$("#roaming-card-"+i).find(".card-txt-lte-count").html(result[i].subs_count_LTE_string);
				$("#roaming-card-"+i).find(".card-txt-3g-count").html(result[i].subs_count_3G_string);
				$("#roaming-card-"+i).find(".card-txt-local-time").html(result[i].date);
			}
		});
	}

	function executePeriodicalFunc(func, delay){
		func();
		setInterval(func,delay);
	}

	//executePeriodicalFunc(ajaxDdonny, 1000);

});