/**
* jquery-freetrans.js v1.1
*
* Copyright (c) 2013 Jonathan Greene (gthmb)
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*
*/

(function($){

        // consts
        var rad = Math.PI/180;
        var vendorPrefix = (function() {
                var prefix,
                        prefixes = {
                                webkit: 'Webkit',
                                gecko: 'Moz',
                                trident: 'ms',
                                presto: 'O'
                        };
                $.each(prefixes, function(k, v) {
                        if (new RegExp(k + '/', 'i').test(navigator.userAgent)) {
                                prefix = v;
                                return false;
                        }
                });
                return prefix;
        }());

        // public methods
        var methods = {
                init : function(options) {
                        return this.each(function() {
                                var sel = $(this), d = sel.data('freetrans');
                                if(d){
                                        _setOptions(d, options);
                                        _draw(sel, d);
                                } else {
                                        _init(sel, options);
                                        _draw(sel, sel.data('freetrans'));
                                }
                        });
                },

                destroy : function() {
                        return this.each(function() {
                                _destroy($(this));
                        });
                },
                getOptions :  function() {
                        if(this.length > 1) {
                                $.error('Method jQuery.freetrans.getOptions can only be called on single selectors!');
                        }

                        return _getOptions($(this));
                },

                getBounds : function() {
                        if(this.length > 1) {
                                $.error('Method jQuery.freetrans.getBounds can only be called on single selectors!');
                        }

                        return _getBounds(this.data('freetrans')._p.divs.controls);
                },
                controls: function(show) {
                        return this.each(function() {
                                var sel = $(this), d = sel.data('freetrans');
                                if(!d) _init(sel);
                                _toggleControls(sel, show);
                        });
                },
                scale: function(show) {
                    return this.each(function() {
                        var sel = $(this), d = sel.data('freetrans');
                        if(!d) _init(sel);
                        _toggleScale(sel, show);
                    });

                },
                rotator: function(show) {
                    return this.each(function() {
                        var sel = $(this), d = sel.data('freetrans');
                        if(!d) _init(sel);
                        _toggleRotator(sel, show);
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

                var off = sel.offset();

                sel
                        .addClass('ft-widget')
                        .css({top: 0, left: 0, position: 'static'});

                // wrap an ft-container around the selector
                sel.wrap('<div class="ft-container"></div>');

                var container = sel.parent();

                // generate all the controls markup
                var markup = '';
                markup +=                 '<div class="ft-controls">';
                markup +=                         '<div class="ft-rotator"></div>';
                markup +=                         '<div class="ft-scaler ft-scaler-top ft-scaler-left ft-scaler-tl"></div>';
                markup +=                         '<div class="ft-scaler ft-scaler-top ft-scaler-right ft-scaler-tr"></div>';
                markup +=                         '<div class="ft-scaler ft-scaler-bottom ft-scaler-right ft-scaler-br"></div>';
                markup +=                         '<div class="ft-scaler ft-scaler-bottom ft-scaler-left ft-scaler-bl"></div>';
                markup +=                         '<div class="ft-scaler ft-scaler-top ft-scaler-center ft-scaler-tc"></div>';
                markup +=                         '<div class="ft-scaler ft-scaler-bottom ft-scaler-center ft-scaler-bc"></div>';
                markup +=                         '<div class="ft-scaler ft-scaler-mid ft-scaler-left ft-scaler-ml"></div>';
                markup +=                         '<div class="ft-scaler ft-scaler-mid ft-scaler-right ft-scaler-mr"></div>';
                markup +=                         '<div class="ft-scaler ft-scaler-mid ft-scaler-center ft-scaler-mc"></div>';
                markup +=                 '</div>';

                var settings = {
                        x: off.left,
                        y: off.top,
                        scalex: 1,
                        scaley: 1,
                        angle: 0,
                        maintainAspectRatio: false,
                        scaleLimit: 0.1,
                        'rot-origin': '50% 50%',
                        _p: {
                                divs: {},
                                prev: {},
                                wid: sel.width(),
                                hgt: sel.height(),
                                rad: (options && options.angle) ? options.angle * rad : 0,
                                controls: true,
                                scale: true,
                                rotator: true,
                                dom: sel[0]
                        }
                };

                // append controls to container
                container.append(markup);

                // store div references (locally in function and in settings)
                var controls = settings._p.divs.controls = container.find('.ft-controls');
                var rotator = settings._p.divs.rotator = container.find('.ft-rotator');
                var scale = settings._p.divs.scale = container.find('.ft-scaler');
                var tl = settings._p.divs.tl = container.find('.ft-scaler-tl');
                var tr = settings._p.divs.tr = container.find('.ft-scaler-tr');
                var br = settings._p.divs.br = container.find('.ft-scaler-br');
                var bl = settings._p.divs.bl = container.find('.ft-scaler-bl');
                var tc = settings._p.divs.tc = container.find('.ft-scaler-tc');
                var bc = settings._p.divs.bc = container.find('.ft-scaler-bc');
                var ml = settings._p.divs.ml = container.find('.ft-scaler-ml');
                var mr = settings._p.divs.mr = container.find('.ft-scaler-mr');
                var mc = settings._p.divs.mc = container.find('.ft-scaler-mc');
                settings._p.divs.container = container;
                settings._p.cwid = controls.width();
                settings._p.chgt = controls.height();

                sel.data('freetrans', settings);

                if(options) {
                        _setOptions(sel.data('freetrans'), options);
                }

                // translate (aka move)
                container.bind('mousedown.freetrans', _ifLeft(_noSelect(function(evt) {
                        var data = sel.data('freetrans');
                        var p = Point(evt.pageX, evt.pageY);
                        var drag = _noSelect(function(evt) {
                                data.x += evt.pageX - p.x;
                                data.y += evt.pageY - p.y;
                                p = Point(evt.pageX, evt.pageY);
                                _draw(sel, data);
                        });

                        var up = function(evt) {
                                $(document).unbind('mousemove.freetrans', drag);
                                $(document).unbind('mouseup.freetrans', up);
                        };

                        $(document).bind('mousemove.freetrans', drag);
                        $(document).bind('mouseup.freetrans', up);
                })));

                // rotate
                rotator.bind('mousedown.freetrans', _ifLeft(_noSelect(function(evt) {
                        evt.stopPropagation();

                        var data = sel.data('freetrans'),
                        cen = _getBounds(data._p.divs.controls).center,
                        pressang = Math.atan2(evt.pageY - cen.y, evt.pageX - cen.x) * 180 / Math.PI;
                        rot = Number(data.angle);

                        var drag = _noSelect(function(evt) {
                                var ang = Math.atan2(evt.pageY - cen.y, evt.pageX - cen.x) * 180 / Math.PI,
                                d = rot + ang - pressang;

                                if(evt.shiftKey) d = (d/15>>0) * 15;

                                data.angle = d;
                                data._p.rad = d*rad;

                                _draw(sel, data);
                        });

                        var up = function(evt) {
                                $(document).unbind('mousemove.freetrans', drag);
                                $(document).unbind('mouseup.freetrans', up);
                        };

                        $(document).bind('mousemove.freetrans', drag);
                        $(document).bind('mouseup.freetrans', up);
                })));

                // scale
                container.find('.ft-scaler').bind('mousedown.freetrans', _ifLeft(_noSelect(function(evt) {
                        evt.stopPropagation();

                        /**
                         * NOTE: refang is the angle between the top-left and top-right scalers.
                         * its for normalizing the rotation of the bounds to the x axis. Depending
                         * on the scale mode (eg dragging top-right or bottom-left) we might have
                         * to reverse the angle.
                         */

                        var scaleLimit = settings.scaleLimit;

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
                        c_off  = mc.offset(),
                        refang = Math.atan2(tr_off.top - tl_off.top, tr_off.left - tl_off.left),
                        sin = Math.sin(refang),
                        cos = Math.cos(refang);

                        doPosition = function(origOff, newOff) {
                                data.x += origOff.left - newOff.left;
                                data.y += origOff.top - newOff.top;
                                _draw(sel, data);
                        };

                        if (handle.is(br) || handle.is(mr)) {
                                anchor = tl_off;
                                doy = handle.is(br);
                                scaleMe = function(mp) {
                                        mp.x -= anchor.left;
                                        mp.y -= anchor.top;
                                        mp = _rotatePoint(mp, sin, cos);

                                        data.scalex = (mp.x / owid) > scaleLimit ? (mp.x / owid) : scaleLimit;
                                        if (doy) data.scaley = (mp.y / ohgt) > scaleLimit ? (mp.y / ohgt) : scaleLimit;
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

                                        data.scalex = (mp.x / owid) > scaleLimit ? (mp.x / owid) : scaleLimit;
                                        if (doy) data.scaley = (mp.y / ohgt) > scaleLimit ? (mp.y / ohgt) : scaleLimit;
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
                                        if (dox) data.scalex = (mp.x / owid) > scaleLimit ? (mp.x / owid) : scaleLimit;
                                        data.scaley = (mp.y / ohgt) > scaleLimit ? (mp.y / ohgt) : scaleLimit;
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
                                        if (dox) data.scalex = (mp.x / owid) > scaleLimit ? (mp.x / owid) : scaleLimit;
                                        data.scaley = (mp.y / ohgt) > scaleLimit ? (mp.y / ohgt) : scaleLimit;
                                };

                                positionMe = function() {
                                        doPosition(anchor, container.find('.ft-scaler-tr').offset());
                                };
                        }

                        var drag = _noSelect(function(evt) {

                                if(evt.altKey) {
                                        anchor = c_off;

                                        if (handle.is(br) || handle.is(mr)) {
                                                scaleMe = function(mp) {
                                                        mp.x = (mp.x - anchor.left)*2;
                                                        mp.y = (mp.y - anchor.top)*2;
                                                        mp = _rotatePoint(mp, sin, cos);

                                                        data.scalex = (mp.x / owid) > scaleLimit ? (mp.x / owid) : scaleLimit;
                                                        if (doy) data.scaley = (mp.y / ohgt) > scaleLimit ? (mp.y / ohgt) : scaleLimit;
                                                };
                                        } else if (handle.is(tl) || handle.is(ml)) {
                                                scaleMe = function(mp) {
                                                        mp.x = (anchor.left - mp.x)*2;
                                                        mp.y = (anchor.top - mp.y)*2;
                                                        mp = _rotatePoint(mp, sin, cos);

                                                        data.scalex = (mp.x / owid) > scaleLimit ? (mp.x / owid) : scaleLimit;
                                                        if (doy) data.scaley = (mp.y / ohgt) > scaleLimit ? (mp.y / ohgt) : scaleLimit;
                                                };

                                        } else if (handle.is(tr) || handle.is(tc)) {
                                                scaleMe = function(mp) {
                                                        mp.x = (mp.x - anchor.left)*2;
                                                        mp.y = (anchor.top - mp.y)*2;
                                                        mp = _rotatePoint(mp, sin, cos);

                                                        if (dox) data.scalex = (mp.x / owid) > scaleLimit ? (mp.x / owid) : scaleLimit;
                                                        data.scaley = (mp.y / ohgt) > scaleLimit ? (mp.y / ohgt) : scaleLimit;
                                                };

                                        } else if (handle.is(bl) || handle.is(bc)) {
                                                scaleMe = function(mp) {
                                                        mp.x = (anchor.left - mp.x)*2;
                                                        mp.y = (mp.y - anchor.top)*2;
                                                        mp = _rotatePoint(mp, sin, cos);
                                                        if (dox) data.scalex = (mp.x / owid) > scaleLimit ? (mp.x / owid) : scaleLimit;
                                                        data.scaley = (mp.y / ohgt) > scaleLimit ? (mp.y / ohgt) : scaleLimit;
                                                };
                                        }

                                        positionMe = function() {
                                            doPosition(anchor, container.find('.ft-scaler-mc').offset());
                                        };
                                }

                                if (scaleMe) {
                                        scaleMe(Point(evt.pageX, evt.pageY));

                                        if(evt.shiftKey || settings.maintainAspectRatio) {
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

                                        data._p.cwid = data._p.wid * data.scalex;
                                        data._p.chgt = data._p.hgt * data.scaley;
                                        _draw(sel, data);

                                        if (positionMe) positionMe();
                                };
                        });

                        var up = function(evt) {
                                _draw(sel, data);
                                $(document).unbind('mousemove.freetrans', drag);
                                $(document).unbind('mouseup.freetrans', up);
                        };

                        $(document).bind('mousemove.freetrans', drag);
                        $(document).bind('mouseup.freetrans', up);
                })));

                sel.css({position: 'absolute'});
        }

        function _ifLeft(callback) {
                return function(evt) {
                        if (evt.which === 1) {
                                return callback(evt);
                        }
                };
        };

        // Disable selection for drag handlers.
        function _noSelect(callback) {
                return function(evt) {
                        evt.preventDefault();
                        evt.stopImmediatePropagation();
                        return callback(evt);
                }
        }

        function _destroy(sel) {
                var data = sel.data('freetrans');
                $(document).unbind('.freetrans');
                for(var el in data._p.divs) data._p.divs[el].unbind('.freetrans');
                data._p.divs.container.replaceWith(sel);
                sel.removeData('freetrans');
        }

        function _getOptions(sel) {
            var data = sel.data('freetrans');
            var opts = {
                angle: data.angle,
                maintainAspectRatio: data.maintainAspectRatio,
                'rot-origin': data['rot-origin'],
                scaleLimit: data.scaleLimit,
                scalex: data.scalex,
                scaley: data.scaley,
                x: data.x,
                y: data.y
            };
            return opts;
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

        function _createStyleSetter(prop) {
                var prefixed;
                if (vendorPrefix) {
                        prefixed = vendorPrefix + prop.substr(0, 1).toUpperCase() + prop.substr(1);
                        return function (el, value) { el.style[prefixed] = el.style[prop] = value; };
                }
                return function (el, value) { el.style[prop] = value; };
        }
        var _setTransform = _createStyleSetter('transform');
        var _setTransformOrigin = _createStyleSetter('transformOrigin');
        var _setTransformStyle = _createStyleSetter('transformStyle');

        function _toggleControls(sel, show) {
                var d = sel.data('freetrans');

                var curr_vis = d._p.controls;
                if(typeof show == 'undefined'){
                    show = !curr_vis;
                }else if(show == d._p.controls){
                    return;
                }

                d._p.divs.controls.css({
                        visibility: (show) ? 'visible' : 'hidden'
                });

                d._p.controls = show;

                if(show) _draw(sel, d)
        }

        function _toggleScale(sel, show) {
                var d = sel.data('freetrans');

                var curr_vis = d._p.scale;
                if(typeof show == 'undefined'){
                    show = !curr_vis;
                }else if(show == d._p.scale){
                    return;
                }

                d._p.divs.scale.css({
                    visibility: (show) ? 'visible' : 'hidden'
                });

                d._p.scale = show;

                if(show) _draw(sel, d)
        }

        function _toggleRotator(sel, show) {
                var d = sel.data('freetrans');

                var curr_vis = d._p.rotator;
                if(typeof show == 'undefined'){
                    show = !curr_vis;
                }else if(show == d._p.rotator){
                    return;
                }

                d._p.divs.rotator.css({
                    visibility: (show) ? 'visible' : 'hidden'
                });

                d._p.rotator = show;

                if(show) _draw(sel, d)
        }

        function _setOptions(data, opts) {
                delete opts._p;

                data = $.extend(data, opts);

                if(opts.matrix){
                    var nums = opts.matrix.match(/\.?\d+/g);

                    var props = _getPropsFromMatrix(Matrix(nums[0], nums[1], nums[2],
                        nums[3], nums[4], nums[5]));

                    data._p.rad = props.rad;
                    data._p.cwid = data._p.wid * props.sx;
                    data._p.chgt = data._p.hgt * props.sy;

                    data.x = props.tx;
                    data.y = props.ty;
                    data.scalex = props.sx;
                    data.scaley = props.sy;
                    data.angle = props.rad/rad;
                } else {
                    if(opts.hasOwnProperty('angle') && !isNaN(opts.angle)) data._p.rad = data.angle*rad;
                    if(opts.hasOwnProperty('scalex') && !isNaN(opts.scalex)) data._p.cwid = data._p.wid * opts.scalex;
                    if(opts.hasOwnProperty('scaley') && !isNaN(opts.scaley)) data._p.chgt = data._p.hgt * opts.scaley;
                }
        }

        function _rotatePoint(pt, sin, cos) {
                return Point(pt.x * cos + pt.y * sin, pt.y * cos - pt.x * sin);
        }

        function _getRotationPoint(sel) {
                var data = sel.data('freetrans'),
                ror = data['rot-origin'],
                pt = Point(0,0);

                if(!ror || ror == "50% 50%") return pt;

                var arr = ror.split(' '), l = arr.length;

                if(!l) return pt;

                var val = parseInt(arr[0]),
                per = arr[0].indexOf('%') > -1,
                ctrls = data._p.divs.controls,
                dim = data._p.cwid;

                pt.x = ((per) ? val/100*dim : val) - dim/2;

                if(l==1)  pt.y = pt.x;
                else {
                        val = arr[1];
                        per = val.indexOf('%') > -1;
                        val = parseInt(val);
                        dim = data._p.chgt;
                        pt.y = ((per) ? val/100*dim : val) - dim/2;
                }

                return pt;
        }

        function _matrixToCSS(m) {
                if(String(m.a).length > 8) m.a = Number(m.a).toFixed(8);
                if(String(m.b).length > 8) m.b = Number(m.b).toFixed(8);
                if(String(m.c).length > 8) m.c = Number(m.c).toFixed(8);
                if(String(m.d).length > 8) m.d = Number(m.d).toFixed(8);
                if(String(m.tx).length > 8) m.tx = Number(m.tx).toFixed(8);
                if(String(m.ty).length > 8) m.ty = Number(m.ty).toFixed(8);

                return "matrix(" + m.a + "," + m.b + "," + m.c + "," + m.d + "," + m.tx + "," + m.ty + ")";
        }

        function _getPropsFromMatrix(m) {
            var obj = {
                tx: Number(m.tx),
                ty: Number(m.ty),
                rad: Math.atan2(Number(m.b), Number(m.a)),
                sx: Math.sqrt(m.a*m.a+m.b*m.b),
                sy: Math.sqrt(m.c*m.c+m.d*m.d)
            };

            // if(m.a < 0) obj.sx = obj.sx*-1;
            // if(m.d < 0) obj.sy = obj.sy*-1;

            return obj;
        }

        function _draw(sel, data) {
                if(!data)
                        return;

                var tstr, el;

                // if showing controls... manipulate them
                if(data._p.controls) {
                        el = data._p.divs.controls[0];

                        el.style.top = data.y + data._p.hgt * (1 - data.scaley) + 'px';
                        el.style.left = data.x + data._p.wid * (1 - data.scalex) + 'px';
                        el.style.width = data._p.cwid + 'px';
                        el.style.height = data._p.chgt + 'px';

                        if(data._p.prev.angle != data.angle || data._p.prev.controls != data._p.controls) {
                                tstr = _matrixToCSS(Matrix().rotate(data._p.rad));
                                _setTransform(el, tstr);
                                _setTransformOrigin(el, data['rot-origin']);

                                tstr = _matrixToCSS(Matrix().rotate(-data._p.rad));
                                _setTransform(data._p.divs.rotator[0], tstr);
                                _setTransformOrigin(data._p.divs.rotator[0], data['rot-origin']);

                                data._p.prev.controls = data._p.controls;
                        }

                        el = data._p.divs.rotator[0];

                        el.style.top = -20 + 'px';
                        el.style.left = data._p.cwid + 4 + 'px';
                        _setTransform(el, tstr);
                        _setTransformOrigin(el, data['rot-origin']);
                }

                el = data._p.dom;

                var t = (data.y + data._p.hgt * (1 - data.scaley) / 2) >> 0
                l = (data.x + data._p.wid * (1 - data.scalex) / 2) >> 0;

                // need to move y?
                if(t != data._p.prev.top) el.style.top = t + 'px';

                // need to move x?
                if(l != data._p.prev.left) el.style.left = l + 'px';

                // store current pos
                data._p.prev.top = t;
                data._p.prev.left = l;

                // we need a transform
                if(data.angle != data._p.prev.angle || data.scalex != 1 || data.scaley != 1) {
                        var mat = Matrix();
                        if(data.angle){
                                mat = mat.rotate(data._p.rad, _getRotationPoint(sel));
                                data._p.prev.angle = data.angle;
                        }
                        if(data.scalex != 1 || data.scaley != 1) mat = mat.scale(data.scalex, data.scaley);

                        tstr = _matrixToCSS(mat)
                } else {
                        tstr = "matrix(1,0,0,1,0,0);";
                }

                if (data._p.prev.mat != tstr) {
                        _setTransform(el, tstr);
                        data._p.prev.mat = tstr;
                }
        }
})(jQuery);
