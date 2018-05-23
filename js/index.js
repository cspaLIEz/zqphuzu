$(function () {

	var url = "http://localhost:8001/";
	var token = "";

	removeStart("ulBox");

	$.ajax({
		url: url + "api/auth/get_token",
		type: "post",
		data: {
			apikey: '23182D7D145543DC925468979D98587F'
		},
		success: function (res) {
			token = res.access_token;
			setCookie("token",token,"s" + res.expires_in)
		}
	});

	$(document).on("click","p.inputUrl span",function () {
		$(this).prev().addClass("active").next().remove();
		$(".getUrl .sureChanges").addClass("active")
	});

	//兑换列表
	$(document).ajaxPost(url + "api/orders/instant",{},function (res) {
		if(res.success && res.data){
			var that = $(".container .swiper");
			that.find(".allNum").text(res.data.total);
			var li = "";
			for(var i = 0;i<res.data.items.length;i++){
				li += renderTemplate($("#swiper").html(),res.data.items[i])
			}
			that.find(".ulBox ul").html(li)
		}
});

	//记录兑换信息,弹窗间传递
	var code,phone,orderId,game,li,id;

	//cdk兑换
	$(".skinLayer").click(function (e) {
		e.preventDefault();
		code = $(".code").val();
		phone = $(".phone").val();
		if(code == "" || phone == ""){
			return showError("请完成输入信息")
		}
		if(!/^[1][3456789][0-9]{9}$/.test(phone)){
			return showError("请输入正确的手机号")
		}
		if(!/^[0-9]{6}$/.test(code)){
			return showError("请输入正确的验证码")
		}
		$(this).ajaxPost(url + "api/orders/query",{cdkey: code, phoneNumber: phone},function (res) {
			if(res.success && res.data){
				orderId = res.data.id;
				game = res.data.game;
				li = "";
				for(var i = 0;i<res.data.items.length;i++){
					li += '<li><img src='+ res.data.items[i].imageUrl+ '/><span>'+ res.data.items[i].name +'</span></li>';
				}
				var html = $("#getUrl").html().replace("<li></li>",li);
				layer.open({
					type: 1,
					title: false,
					area: ["708px","629px"],
					content: html
				});
				$(".ulbox ul").niceScroll()
			} else {
				showError(res.message || "请求数据验证失败")
			}
		})
	});

	//确认兑换,轮询
	$(document).on("click",".sureChanges",function () {
		if(!$(this).hasClass("active")) return;
		$(this).ajaxPost(url + "api/tradeoffers/withdraw",{game: game,cdkey: code,phoneNumber: phone,orderId: orderId,tradeUrl: $(".inputUrl input").val()},function (res) {
			if(!res.success) return showError(res.message || "请求失败");

			//steam交易id
			id = res.data.responses[0].id;

			layer.closeAll();
			var Html = $("#trade").html().replace("<li></li>",li);
			layer.open({
				type: 1,
				title: false,
				area: ["708px","629px"],
				content: Html
			});
			$(".ulbox ul").niceScroll();
			setTimeout(function x() {
				$(this).ajaxPost(url + "api/TradeOffers/polling",{"ids": [id]},function (res) {
					if(!res.success || !res.data ) return showError(res.message || "报价发送失败,请重试")

					var state = res.data[0].state;
					var elapsed = res.data[0].elapsed;
					var message = res.data[0].message;
					if(state >= 0 && state <= 5 && state != 4){
						$(".getMessage p").removeClass().addClass("state-" + state).find("span").html(message).next().text(elapsed + "s");
						setTimeout(x,1000)
					} else if (state >= 5 && state <= 12 || state == 4){
						$(".getMessage p").removeClass().addClass("state-" + state).find("span").html(message).next().text(elapsed + "s");
						$(document).on("click",".btn_close",function (e) {
							e.preventDefault();
							layer.closeAll();
						})
					}
				})
			},0);
		});

	});
	$(".swiper li").click(function(){
		$(".guide").hide().eq($(this).attr("data-index")).show()
		$(".N_active").removeClass("N_active")
		$(this).addClass("N_active")

	})
	$(".Novice_top").click(function(){
		$(".Novice_ul").slideUp()
		$(".Novice_LC").removeClass("NLC_active")
		$(this).next(".Novice_ul").slideDown().parent(".Novice_LC").addClass("NLC_active")
	})

});
