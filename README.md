jquery-free-transform
======================

Provides simple controls that allows you to move/rotate/scale a div. Kind of like a simple version of the free transform tool in Flash or Photoshop.

[example page](http://jsfiddle.net/66Bna/293/)

Dependencies:
  - jQuery - tested with 1.11.2
  - [Matrix.js](https://github.com/STRd6/matrix.js "awesome and simple Matrix lib from STRd6") - awesome and simple Matrix lib from STRd6

TODOs:
  - handle control placement for negative scaling

### API

The `$.freetrans()` method is used for all access to the plugin.

##### Initialization
When called without any parameters, the plugin will be initiailized for the selector(s)

	// initialize mydiv with free trans plugin
	$('mydiv').freetrans();

	// initialize all items with class myclass
	$('.myclass').freetrans();


You can also initialize a div with options like so:

	// initialize and set some properties
	$('mydiv').freetrans({
			x: 100,
			y: 150,
			angle: 45
	})

##### Updating options and values

After a div has been initialized, you can pass in an object to update any options you'd like. This snippet does the same thing as the preceeding example, it's just showing how you can update parameters after initization:

	// init
	$('mydiv').freetrans();

	// update
	$('mydiv').freetrans({
			x: 100,
			y: 150,
			angle: 45
	})


The options and properties for a selector are stored in the `$.data('freetrans')` object. The properties that are used to render the selector are:

- `x`:Number (the x position of the selector)
- `y`:Number (the y position of the selector)
- `scalex`:Number (the x scale of the selector)
- `scaley`:Number (the y scale of the selector)
- `angle`:Number (the angle (in degrees) of the rotation)
- `'rot-origin'`:String (the location of rotation point),

The `'rot-origin'` property is a string formatted just like the `'transform-origin'` property in CSS. Like CSS, it defaults to <code>'50% 50%'</code>, which means 50% of the width and 50% of the height, eg, the center point. The first value in the string describes the x location, the second describes the y location. Passing in a single value will apply the same value to both the x and the y location. If you'd prefer to use pixel offsets and not percentages, just leave the '%' off the values. <code>'150 100'</code> will make the rotation origin point {x: 150px, y: 100px}.

	// rotate around the bottom center
	$('mydiv').freetrans({'rot-origin': '50% 100%'});

	// rotate around the top left
	$('mydiv').freetrans({'rot-origin': '0'});

	// rotate around the point 100px to the left and 25% down the selector
	$('mydiv').freetrans({'rot-origin': '100 25%'});


##### Showing/Hiding the controls

You can show and hide the controls by passing `'controls'` to the plugin, optionally followed by a boolean to either show or hide the controls.

	// hide the controls
	$('mydiv').freetrans('controls', false);

	// show the controls
	$('mydiv').freetrans('controls', true);

        // toggle the controls
        $('mydiv').freetrans('controls');



##### Showing/Hiding the Scale

You can show and hide the scale by passing `'scale'` to the plugin, optionally followed by a boolean to either show or hide the scale.

	// hide the scale
	$('mydiv').freetrans('scale', false);

	// show the scale
	$('mydiv').freetrans('scale', true);

        // toggle the scale
        $('mydiv').freetrans('scale');


##### Showing/Hiding the Rotate

You can show and hide the rotate by passing `'rotator'` to the plugin, optionally followed by a boolean to either show or hide the rotator.

	// hide the rotator
	$('mydiv').freetrans('rotator', false);

	// show the rotator
	$('mydiv').freetrans('rotator', true);

        // toggle the rotator
        $('mydiv').freetrans('rotator');



##### Getting the bounding box

You can retrieve the bounding box of the transformed selector by passing `'getBounds'`. This method is only available for single selectors, not groups. It returns an object with the bounds information. This method is not chainable.

	var b = $('mydiv').freetrans('getBounds');
	console.log(b.xmin, b.ymax, b.height, b.center.x);

##### Getting the current options

You can retrieve the current options of the transformed selector by passing
`'getOptions'` which is useful for persistence. This method is only available for single selectors, not groups. It returns an object with the bounds information. This method is not chainable.

	var o = $('mydiv').freetrans('getOptions');
	console.log(o.angle, o.maintainAspectRatio, o['rot-origin'], o.scaleLimit, o.scalex, o.scaley, o.x, o.y);

##### Destroying the plugin
If you want to remove the freetrans functionality from a selector, you can pass `'destroy'`. It will unbind any events, and destroy the `$.data('freetrans')` object.

	// destroy plugin for mydiv
	$('mydiv').freetrans('destroy');

### Usage Notes

##### The SHIFT key

While scaling, holding down the Shift key will maintain the aspect ratio of the div when the scaling was started.

While rotating, the Shift key causes the rotation to snap to 15 degree increments.

##### The ALT key

While scaling, holding down the Alt key will scale div relative to its center.

##### Chainability

This plugin keeps chainability in tact. Chain away!

	$('mydiv').freetrans().css({border: '1px solid blue'});
