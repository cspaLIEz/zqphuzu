function newSkinLayer(title, html, area) {
	layer.open({
		type: 1,
		title: title,
		content: html,
		area: area,
		resize: false,
		skin: "new_skin_layer"
	})
}

function renderTemplate(template, data) {
	for (var prop in data) {
		if(typeof data[prop] == 'Object'){
			
		}
		var regex = new RegExp('%' + prop + '%', 'ig');
		var val = data[prop];
		template = template.replace(regex, val);
	}
	template = template.replace(/%[_a-zA-Z0-9]+%/g, '');
	return template;
}

function renderPager(pageIndex, pageCount, size, $pagerContainer, visiblePages) {
	if (!$pagerContainer) $pagerContainer = $('.pagination');
	if (pageCount <= 0) {
		return $pagerContainer.html('');
	}
	if (isNaN(visiblePages) || visiblePages < 1) visiblePages = 5;
	if (pageCount == 1) {
		return $pagerContainer.html("");
		// $pagerContainer.html('<span>共 1 页, ' + size + ' 项</span>');
	} else {
		var pageNum = pageIndex + 1;
		var html = '<a class="page_first' + (pageIndex == 0 ? ' disabled' : '') + '" data-page="1"> |&lt; </a>';
		html += '<a class="page_pre' + (pageIndex == 0 ? ' disabled' : '') + '" data-page="' + Math.max(1, pageNum - 1) + '"> &lt; </a>';
		html += '<div class="ysnum">';
		var span = visiblePages - 1;
		var pageStart = Math.max(1, pageNum - span / 2);
		var pageEnd = Math.min(pageCount, pageStart + span);
		for (var i = pageStart; i <= pageEnd; i++) {
			html += '<a class="' + (pageNum == i ? 'active' : '') + '" data-page="' + i + '">' + i + '</a>';
		}
		html += '</div>';
		html += '<a class="page_next' + (pageNum == pageCount ? ' disabled' : '') + '"  data-page="' + Math.min(pageCount, pageNum + 1) + '"> &gt; </a>';
		html += '<a class="page_last' + (pageNum == pageCount ? ' disabled' : '') + '"  data-page="' + pageCount + '"> &gt;| </a>';
		html += '</div>';
		$pagerContainer.html(html);
	}
}

function showMessage(msg, time, end) {
	if (typeof time === "function") {
		end = time;
		time = 2000;
	}

	layer.closeAll();

	layer.msg(msg, {id: 99, time: isNaN(time) || time < 0 ? 1000 : time, end: end, shift: 0});
	return false;
}

function showMessageReload(msg, time) {
	return showMessage(msg, time, function () {
		location.reload();
	});
}

function showError(msg, time, end) {
	if (typeof time === "function") {
		end = time;
		time = 2000;
	}
	layer.msg(msg, {id: 99, time: isNaN(time) || time < 0 ? 2000 : time, end: end, shift: 0});
	return false;
}

$.fn.ajaxPost = function (url, data, callback, errorCallback) {
	var $trigger = $(this);

	$trigger.addClass('btn_disabled');

	try {
		return $.ajax({
			url: url, type: "POST", data: data, dataType: "json",
			headers: {
				Authorization: 'Bearer ' + getCookie("token")
			},
			success: callback,
			error: errorCallback || null,
			complete: function (xhr, textStatus) {
				if (xhr.status == 429) {
					return showError(xhr.responseText);
				} else if (xhr.status == 404) {
					return showError('请刷新页面后重试！');
				}
			}
		})
	} catch (e) {
		$trigger.removeClass('btn_disabled');
		showMessage('请求时发生错误！');
	}
}

function changeTIme(dom) {
	var date_gap_min = (new Date().getTime() - Number(Date.parse(dom.text())))/60000;
	var date_gap_hour = (new Date().getTime() - Number(Date.parse(dom.text())))/3600000;
	var date_gap_day = (new Date().getTime() - Number(Date.parse(dom.text())))/86400000;
	if(date_gap_min<=1){
		dom.text("刚刚")
	} else if (1<=date_gap_day) {
		dom.text(Math.floor(date_gap_day)+ "天前")
	} else if (1<=date_gap_min && date_gap_min <60) {
		dom.text(Math.floor(date_gap_min)+ "分钟前")
	} else if (1<=date_gap_hour && date_gap_hour<24) {
		dom.text(Math.floor(date_gap_hour)+ "小时前")
	}
	$(this).show()
}

function removeStart($btn) {
	$("." + $btn).addClass("active");
	setTimeout(function x() {
		$("." + $btn).animate({paddingTop: "121px"},3000,"linear",function () {
			$(this).find("li").last().prependTo($(this).find("ul"));
			$(this).css("paddingTop","0px")
		});
		setTimeout(x,3000)
	},0)
}

function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg))
		return unescape(arr[2]);
	else
		return null;
}

function setCookie(name, value, time) {
	var strsec = getsec(time);
	var exp = new Date();
	exp.setTime(exp.getTime() + strsec * 1);
	document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
}

function getsec(str) {
	var str1 = str.substring(1, str.length) * 1;
	var str2 = str.substring(0, 1);
	if (str2 == "s") {
		return str1 * 1000;
	}
	else if (str2 == "h") {
		return str1 * 60 * 60 * 1000;
	}
	else if (str2 == "d") {
		return str1 * 24 * 60 * 60 * 1000;
	}
}
