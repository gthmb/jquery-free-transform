(function($){
	
	// consts
	var rad = Math.PI/180;

	// public methods
	var methods = {
		init : function(options) {
			return this.each(function() {
				var sel = $(this);
				if(sel.data('freetrans')){
					_setOptions(sel, options);
				} else {
					_init(sel, options);
				}
			});
		},
		
		destroy : function() {
			return this.each(function() {
				_destroy($(this));
			});
		},
		
		getBounds : function() {
			if(this.length > 1) {
				$.error('Method jQuery.freetrans.getBounds can only be called on single selectors!');
			}
			return _getBounds(this);
		},
		
		controls: function(show) {
			return this.each(function() {
				_toggleControls($(this), show);
			});
		}
	};
	
	$.fn.freetrans = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.freetrans' );
		}
		return false;
	};
	
	// private methods
	function _init(sel, options){
		
		// wrap an ft-container around the selector
		sel.wrap('<div class="ft-container"></div>');
		sel.css({top: 0, left: 0});
		
		var container = sel.parent();
		
		// generate all the controls markup
		var markup = '';
		markup += 		'<div class="ft-controls">';
		markup += 			'<div class="ft-rotator"></div>';
		markup += 			'<div class="ft-bounds"></div>';
		markup += 			'<div class="ft-scaler ft-scaler-top ft-scaler-left ft-scaler-tl"></div>';
		markup += 			'<div class="ft-scaler ft-scaler-top ft-scaler-right ft-scaler-tr"></div>';
		markup += 			'<div class="ft-scaler ft-scaler-bottom ft-scaler-right ft-scaler-br"></div>';
		markup += 			'<div class="ft-scaler ft-scaler-bottom ft-scaler-left ft-scaler-bl"></div>';
		markup += 			'<div class="ft-scaler ft-scaler-top ft-scaler-center ft-scaler-tc"></div>';
		markup += 			'<div class="ft-scaler ft-scaler-bottom ft-scaler-center ft-scaler-bc"></div>';
		markup += 			'<div class="ft-scaler ft-scaler-mid ft-scaler-left ft-scaler-ml"></div>';
		markup += 			'<div class="ft-scaler ft-scaler-mid ft-scaler-right ft-scaler-mr"></div>';
		markup += 		'</div>';
		
		// append controls to container
		container.append(markup);
		
		var off = sel.offset();
		
		var settings = $.extend( {
			x: off.left,
			y: off.top,
			scalex: 1,
			scaley: 1, 
			angle: 0,
			'rot-origin': '50% 100%',
			divs: {}
		}, options);
		
		// store div references (locally in function and in settings)
		var controls = settings.divs.controls = container.find('.ft-controls');
		var rotator = settings.divs.rotator = container.find('.ft-rotator');
		var bounds = settings.divs.bounds = container.find('.ft-bounds');
		var tl = settings.divs.tl = container.find('.ft-scaler-tl');
		var tr = settings.divs.tr = container.find('.ft-scaler-tr');
		var br = settings.divs.br = container.find('.ft-scaler-br');
		var bl = settings.divs.bl = container.find('.ft-scaler-bl');
		var tc = settings.divs.tc = container.find('.ft-scaler-tc');
		var bc = settings.divs.bc = container.find('.ft-scaler-bc');
		var ml = settings.divs.ml = container.find('.ft-scaler-ml');
		var mr = settings.divs.mr = container.find('.ft-scaler-mr');
		settings.divs.container = container;
		
		sel.data('freetrans', settings);
		
		_draw(sel);
		
		// translate (aka move)
		container.bind('mousedown.freetrans', function(evt) {
			var data = sel.data('freetrans');
			var p = Point(evt.pageX, evt.pageY);
			var drag = function(evt) {
				data.x += evt.pageX - p.x;
				data.y += evt.pageY - p.y;
				p = Point(evt.pageX, evt.pageY);
				_draw(sel);
			};
			
			var up = function(evt) {
				$(document).unbind('mousemove.freetrans', drag);
				$(document).unbind('mouseup.freetrans', up);
			};
			
			$(document).bind('mousemove.freetrans', drag);
			$(document).bind('mouseup.freetrans', up);
		});
		
		// rotate
		rotator.bind('mousedown.freetrans', function(evt) {
			evt.stopPropagation();
			
			var data = sel.data('freetrans'),
			cen = _getBounds(data.divs.controls).center,
			pressang = Math.atan2(evt.pageY - cen.y, evt.pageX - cen.x) * 180 / Math.PI;
			rot = data.angle;

			var drag = function(evt) {
				var ang = Math.atan2(evt.pageY - cen.y, evt.pageX - cen.x) * 180 / Math.PI,
				d = rot + ang - pressang;
				if(evt.shiftKey) d = (d/15>>0) * 15;
				data.angle = d;
				_draw(sel);
			};
			
			var up = function(evt) {
				$(document).unbind('mousemove.freetrans', drag);
				$(document).unbind('mouseup.freetrans', up);
			};
			
			$(document).bind('mousemove.freetrans', drag);
			$(document).bind('mouseup.freetrans', up);
		});
		
		// scale
		container.find('.ft-scaler').bind('mousedown.freetrans', function(evt) {
			evt.stopPropagation();
			
			/**
			 * NOTE: refang is the angle between the top-left and top-right scalers.
			 * its for normalizing the rotation of the bounds to the x axis. Depending
			 * on the scale mode (eg dragging top-right or bottom-left) we might have
			 * to reverse the angle.
			 */
			
			var anchor, scaleMe, doPosition, mp, doy, dox,
			data = sel.data('freetrans'),
			handle = $(evt.target),
			wid = controls.width(), 
			hgt = controls.height(),
			ratio = wid/hgt,
			owid = wid * 1 / data.scalex,
			ohgt = hgt * 1 / data.scaley,
			tl_off = tl.offset(),
			tr_off = tr.offset(),
			br_off = br.offset(),
			bl_off = bl.offset(),
			tc_off = tc.offset(),
			bc_off = bc.offset(),
			ml_off = ml.offset(),
			mr_off = mr.offset(),
			refang = Math.atan2(tr_off.top - tl_off.top, tr_off.left - tl_off.left),
			sin = Math.sin(refang), 
			cos = Math.cos(refang);
			
			doPosition = function(origOff, newOff) {
				data.x += origOff.left - newOff.left;
				data.y += origOff.top - newOff.top;
				_draw(sel);
			};
			
			if (handle.is(br) || handle.is(mr)) {
				anchor = tl_off;
				doy = handle.is(br);
				scaleMe = function(mp) {
					mp.x -= anchor.left;
					mp.y -= anchor.top;
					mp = _rotatePoint(mp, sin, cos);
					data.scalex = (mp.x / owid);
					if (doy) data.scaley = mp.y / ohgt;
				};
				
				positionMe = function() {
					doPosition(anchor, container.find('.ft-scaler-tl').offset());
				};
				
			} else if (handle.is(tl) || handle.is(ml)) {
				anchor = br_off;
				doy = handle.is(tl);
				scaleMe = function(mp) {
					mp.x = anchor.left - mp.x;
					mp.y = anchor.top - mp.y;
					mp = _rotatePoint(mp, sin, cos);
					data.scalex = mp.x / owid;
					if (doy) data.scaley = mp.y / ohgt;
				};
				
				positionMe = function() {
					doPosition(anchor, container.find('.ft-scaler-br').offset());
				};
			} else if (handle.is(tr) || handle.is(tc)) {
				anchor = bl_off;
				dox = handle.is(tr);
				
				// reverse the angle....
				sin = Math.sin(-refang);
				cos = Math.cos(-refang);
				
				scaleMe = function(mp) {
					mp.x -= anchor.left;
					mp.y = anchor.top - mp.y;
					mp = _rotatePoint(mp, sin, cos);
					if (dox) data.scalex = mp.x / owid;
					data.scaley = mp.y / ohgt;
				};
				
				positionMe = function() {
					doPosition(anchor, container.find('.ft-scaler-bl').offset());
				};
				
			} else if (handle.is(bl) || handle.is(bc)) {
				anchor = tr_off;
				
				dox = handle.is(bl);
				
				// reverse the angle....
				sin = Math.sin(-refang);
				cos = Math.cos(-refang);
				
				scaleMe = function(mp) {
					mp.x = anchor.left - mp.x;
					mp.y -= anchor.top;
					mp = _rotatePoint(mp, sin, cos);
					if (dox) data.scalex = mp.x / owid;
					data.scaley = mp.y / ohgt;
				};
				
				positionMe = function() {
					doPosition(anchor, container.find('.ft-scaler-tr').offset());
				};
			}
			
			var drag = function(evt) {
				
				if (scaleMe) {
					scaleMe(Point(evt.pageX, evt.pageY));
					
					if(evt.shiftKey) {
						if(!handle.hasClass('ft-scaler-center')) {
							data.scaley = ((owid*data.scalex)*(1/ratio))/ohgt;
							
							if(handle.is(ml)) {
							 	positionMe = function() {
									doPosition(mr_off, container.find('.ft-scaler-mr').offset());
								};
							} else if (handle.is(mr)) {
								positionMe = function() {
									doPosition(ml_off, container.find('.ft-scaler-ml').offset());
								};
							}

						} else {
							data.scalex = ((ohgt*data.scaley)*ratio)/owid;
							if(handle.is(tc)) {
								positionMe = function() {
									doPosition(bc_off, container.find('.ft-scaler-bc').offset());
								};
							} else {
								positionMe = function() {
									doPosition(tc_off, container.find('.ft-scaler-tc').offset());
								};
							}
						}
						
					}
					
					_draw(sel);
					
					if (positionMe) positionMe();
				};
			};
			
			var up = function(evt) {
				_draw(sel);
				$(document).unbind('mousemove.freetrans', drag);
				$(document).unbind('mouseup.freetrans', up);
			};
			
			$(document).bind('mousemove.freetrans', drag);
			$(document).bind('mouseup.freetrans', up);
		});
	}
	
	function _destroy(sel) {
		var data = sel.data('freetrans');
		$(document).unbind('.freetrans');
		for(var el in data.divs) data.divs[el].unbind('.freetrans');
		data.divs.container.replaceWith(sel);
		sel.removeData('freetrans');
	}
	
	function _getBounds(sel) {
		var bnds = {};

		sel.find('.ft-scaler').each(function(indx) {
			var handle = $(this),
			off = handle.offset(),
			hwid = handle.width() / 2,
			hhgt = handle.height() / 2;
			
			if (indx == 0) {
				bnds.xmin = off.left + hwid;
				bnds.xmax = off.left + hwid;
				bnds.ymin = off.top + hhgt;
				bnds.ymax = off.top + hhgt;
			} else {
				bnds.xmin = Math.min(bnds.xmin, off.left + hwid);
				bnds.xmax = Math.max(bnds.xmax, off.left + hwid);
				bnds.ymin = Math.min(bnds.ymin, off.top + hhgt);
				bnds.ymax = Math.max(bnds.ymax, off.top + hhgt);
			}
			
			bnds.width = bnds.xmax - bnds.xmin;
			bnds.height = bnds.ymax - bnds.ymin;
			bnds.center = Point(bnds.xmin + (bnds.width / 2), bnds.ymin + (bnds.height / 2));
		});
		
		return bnds;
	}
	
	function _toggleControls(sel, show) {
		sel.data('freetrans').divs.controls.css({
			visibility: (show) ? 'visible' : 'hidden'
		});
	}
	
	function _setOptions(sel, opts) {
		var data = sel.data('freetrans'),
		divs = data.divs;
		
		data = $.extend(data, opts);
		data.divs = divs;
		
		_draw(sel);
	}
	
	function _rotatePoint(pt, sin, cos) {
		return Point(pt.x * cos + pt.y * sin, pt.y * cos - pt.x * sin);
	}
	
	function _getRotationPoint(sel) {
		var data = sel.data('freetrans'), 
		ror = data['rot-origin'], 
		pt = Point(0,0);
		
		if(!ror) return pt;
		
		var arr = ror.split(' '), l = arr.length;
		
		if(!l) return pt;
		
		var val = parseInt(arr[0]), 
		per = arr[0].indexOf('%') > -1,
		ctrls = data.divs.controls,
		dim = ctrls.width();

		pt.x = ((per) ? val/100*dim : val) - dim/2;

		if(l==1)  pt.y = pt.x;
		else {
			val = arr[1];
			per = val.indexOf('%') > -1;
			val = parseInt(val);	
			dim = ctrls.height();
			pt.y = ((per) ? val/100*dim : val) - dim/2;		
		}

		return pt;
	}

	function _matrixToCSS(m) {
		return "matrix(" + m.a + "," + m.b + "," + m.c + "," + m.d + "," + m.tx + "," + m.ty + ")";
	}
	
	function _draw(sel) {
		var data = sel.data('freetrans');
		
		if(!data) return;
		
		var divs = data.divs,
		ctrls = divs.controls,
		rot = divs.rotator,
		radian = data.angle * rad,
		x = data.x,
		y = data.y,
		sx = data.scalex,
		sy = data.scaley,
		ror = data['rot-origin'];
		mat = Matrix().rotate(radian, _getRotationPoint(sel)).scale(sx, sy),
		tstr = _matrixToCSS(Matrix().rotate(radian));

		ctrls.css({
			top: y + sel.height() * (1 - sy),
			left: x + sel.width() * (1 - sx),
			width: sel.width() * sx,
			height: sel.height() * sy,
			"transform": tstr,
			"-webkit-transform": tstr,
			"-moz-transform": tstr,
			"-o-transform": tstr,
			"-ms-transform": tstr,
			"transform-origin": ror,
			"-webkit-transform-origin": ror,
			"-moz-transform-origin": ror,
			"-o-transform-origin": ror,
			"-ms-transform-origin": ror
		});
		
		tstr = _matrixToCSS(Matrix().rotate(-radian));
		
		rot.css({
			top: -20,
			left: ctrls.width() + 4,
			"transform": tstr,
			"-webkit-transform": tstr,
			"-moz-transform": tstr,
			"-o-transform": tstr,
			"-ms-transform": tstr
		});
		
		tstr = _matrixToCSS(mat);
		
		// rotate and position
		sel.css({
			position: 'absolute',
			top: y + sel.height() * (1 - sy) / 2,
			left: x + sel.width() * (1 - sx) / 2,
			"transform": tstr,
			"-webkit-transform": tstr,
			"-moz-transform": tstr,
			"-o-transform": tstr,
			"-ms-transform": tstr
		});
	}
})(jQuery);