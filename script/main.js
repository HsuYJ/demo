(function() {

	var ScopeName = 'Main';
	var mdom = Md.Dom;
	var mtext = Md.TextDom;
	var mstate = Md.State;

	function installCSS() {

		var css = Md.Css(ScopeName)
		.addSelector({
			'body': {
				overflow: 'hidden'
			},

			'.holder': {
				width: '100vw',
				height: '100vh',

				'> *': {
					position: 'absolute',
					left: 0,
					top: 0,
					width: '100%',
					height: '100%',
					transform: 'translate3d(0, -100%, 0)',

					'&$.display': {
						transform: 'translate3d(0, 0, 0)'
					}
				}
			}
		})
		.mount();
	}

	// Doms
	var Holder;

	function generateDom() {

		Holder = mdom().startScope(ScopeName).addClass('holder')
		.mount(document.body);
	}

	function Main() {

		installCSS();
		generateDom();

		Rl
		.setImagePath('./image/')
		.setAudioPath('./audio/')
		.loadImages(
			['paddle', 'paddle.png'],
			['paddle_l', 'paddle_l.png'],
			['paddle_c', 'paddle_c.png'],
			['paddle_r', 'paddle_r.png'],
			['rect_1x2_black_5', 'rect_1x2_black_5.png'],
			['smoke0', 'smoke0.png'],
			['smoke1', 'smoke1.png'],
			['bomb', 'bomb.svg'],
			['spring', 'spring.svg'],
			['wormhole', 'wormhole.png'],
			['explosion0', 'explosion0.png'],
			['explosion1', 'explosion1.png'],
			['shine', 'shine.png'],
			['shine_w', 'shine_w.png'],
			['shine_r', 'shine_r.png'],
			['shine_g', 'shine_g.png'],
			['shine_b', 'shine_b.png'],
			['snakeBody0', 'snakeBody0.png'],
			['snakeBody1', 'snakeBody1.png'],
			['dustSmoke', 'dustSmoke.png'],
			['eye0', 'eye0.svg'],
			['eye1', 'eye1.svg'],
			['eye2', 'eye2.svg'],
			['eye3', 'eye3.svg'],
			['face0', 'face0.svg'],
			['face1', 'face1.svg'],
			['face0_hit', 'face0_hit.svg'],
			['face0_destroy', 'face0_destroy.svg'],
			['bg_star0', 'bg_star0.png'],
			['bg_star1', 'bg_star1.png'],
			['bg_star2', 'bg_star2.png'],
			['bg_star3', 'bg_star3.png'],
			['bg_test', 'bg_test.png'],
			['alien_test', 'alien_test.svg'],
			['worm', 'worm.png'],
			['wormTail', 'wormTail.png'],
			['snakeHead', 'snakeHead.png'],
			['fire', 'fire.png'],
			['fire_', 'fire_.png'],
			['fire0', 'fire0.png'],
			['fire1', 'fire1.png'],
			['fireParticle', 'fireParticle.png'],
			['smokeParticle', 'smokeParticle.png'],
			// number
			['num_s0', 'num_0s.png'],
			['num_s1', 'num_1s.png'],
			['num_s2', 'num_2s.png'],
			['num_s3', 'num_3s.png'],
			['num_s4', 'num_4s.png'],
			['num_s5', 'num_5s.png'],
			['num_s6', 'num_6s.png'],
			['num_s7', 'num_7s.png'],
			['num_s8', 'num_8s.png'],
			['num_s9', 'num_9s.png'],
			['num_l0', 'num_0l.png'],
			['num_l1', 'num_1l.png'],
			['num_l2', 'num_2l.png'],
			['num_l3', 'num_3l.png'],
			['num_l4', 'num_4l.png'],
			['num_l5', 'num_5l.png'],
			['num_l6', 'num_6l.png'],
			['num_l7', 'num_7l.png'],
			['num_l8', 'num_8l.png'],
			['num_l9', 'num_9l.png'],
			// indicator
			['indicator_victory', 'indicator_victory.svg']
		)
		.loadAudios(
			['systemFailed', 'system_failed.wav'],
			['paddleExtend', 'paddle_extend.wav'],
			['paddleExtendEnd', 'paddle_extendEnd.wav'],
			['paddleBounce', 'paddle_bounce.wav'],
			['brickHit', 'brick_hit.wav'],
			['brickCatch', 'brick_catch.wav'],
			['mineHit', 'mine_hit.wav'],
			['jellyHit', 'jelly_hit.wav'],
			['shotgun_fireReload', 'shotgun_fireReload.wav'],
			['machineGun_fire', 'machineGun_fire.wav'],
			['laser_fire', 'laser_fire.wav'],
			['mine_explosion', 'mine_explosion.wav'],
			['collect', 'collect.wav']
		)
		.whenProgress(function(PROGRESS) {

			console.log(
				'Last loaded: [' + PROGRESS.type + ']' + PROGRESS.name + '\n' +
				'Resource loading: ' + PROGRESS.loadedNumber + '/' + PROGRESS.totalNumber + '\n' +
				'Time elapsed: ' + PROGRESS.elapsed
			);
		})
		.whenReady(function(RESOURCE) {

			var images = RESOURCE.images;
			var audios = RESOURCE.audios;

			for (var audioName in audios) {
				audios[audioName].volume = 0.3;
			}

			// rendering blinking image
			for (var imgName in images) {
				var img = images[imgName];
				var canvas = document.createElement('canvas');
				var ctx = canvas.getContext('2d');

				canvas.width = img.width;
				canvas.height = img.height;
				ctx.fillStyle = '#FFFFFF';
				ctx.fillRect(0, 0, img.width, img.height);
				ctx.globalCompositeOperation = 'destination-in';
				ctx.drawImage(img, 0, 0);
				//images[imgName + '_blink'] = canvas;
				images[imgName].blinkImage = canvas;
			}

			ShareState
			.init(8, 'bnb')
			.set('mainHolder', Holder, 'bnb')
			.set('images', images, 'bnb')
			.set('audios', audios, 'bnb')
			.get(null, null, 'bnb');
		});
	}

	window.addEventListener('load', Main);

})();