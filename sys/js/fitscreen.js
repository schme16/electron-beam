
var script = $('script').last()
	viewport = $('[name="viewport"]')[0] || $('<meta id="Viewport" name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable='+ (script.attr('data-zoomable') || 'no')+'">').prependTo(document.head)[0];
if( /Android|webOS|iPhone|IEMobile|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
	var ww = ( $(window).width() < window.screen.width ) ? $(window).width() : window.screen.width, //get proper width
		mw = parseFloat(script.attr('data-width')) || 500, // min width of site
		ratio =  ww / mw; //calculate ratio
	if ( ww < mw) { //smaller than minimum size
		viewport.content = ('initial-scale=' + ratio + ', maximum-scale=' + ratio + ', minimum-scale=' + ratio + ', user-scalable='+ (script.attr('data-zoomable') || 'no')+', width=' + ww);
	}
	else { //regular size
		viewport.content = ('initial-scale=1.0, maximum-scale=1, minimum-scale=1.0, user-scalable='+ (script.attr('data-zoomable') || 'no')+', width=' + ww);
	}
}
