window.addEventListener('load', function() {

	var nwgui = require('nw.gui');
	var nwwin = nwgui.Window.get();

	nwwin.enterFullscreen();
	document.addEventListener('keyup', function(e) {

		if (e.key === 'Escape') {
			//nwwin.close();
			document.exitPointerLock();
		}
	});
});