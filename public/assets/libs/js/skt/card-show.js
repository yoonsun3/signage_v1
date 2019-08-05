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
				$("#roaming-card-"+i).find(".card-txt-total-count").html(result[i].subs_count_Total_string+'명');
				if(result[i].event){
					$("#roaming-card-"+i).css('background-color','#b2cce6');//#4a4ab1 .card-txt-operator-name   color #ff407b
				}
				else{
					$("#roaming-card-"+i).css('background-color','#333366');
					//$("#roaming-card-"+i).find(".roaming-card-body").css('background-color','#333366');//#ff9900
				}
			}
			$("#navbarSupportedContent").find(".korea-time").html(result[0].korea_time);
		});
	}

	function executePeriodicalFunc(func, delay){
		func();
		setInterval(func,delay);
	}

	executePeriodicalFunc(ajaxDdonny, 1000);


});
