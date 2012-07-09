jquery-free-transform
======================

Provides simple controls that allows you to move/rotate/scale a div. Kind of like a simple version of the free transform tool in Flash or Photoshop.

[example page](http://jsfiddle.net/gthmb/66Bna/1/)

Dependancies:
  - jQuery - tested with 1.7.2
  - [Matrix.js](https://github.com/STRd6/matrix.js "awesome and simple Matrix lib from STRd6") - awesome and simple Matrix lib from STRd6

TODOs:
  - handle control placement for negative scaling
  - test in IE :)

API
===

The $.freetrans() method is used for all access to the plugin. 

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
			rotation: 45
	})

##### Updating options and values

After a div has been initialized, you can pass in an object to update any options you'd like. This snippet does the same thing as the preceeding example, it's just showing how you can update parameters after initization:

	// init
	$('mydiv').freetrans();

	// update
	$('mydiv').freetrans({
			x: 100,
			y: 150,
			rotation: 45
	})


The options and properties for a selector are stored in the <code>$.data('freetrans')</code> object. The properties that are used to render the selector are:

- x:Number (the x position of the selector)
- y:Number (the y position of the selector)
- scalex:Number (the x scale of the selector)
- scaley:Number (the y scale of the selector)
- angle:Number (the angle (in degrees) of the rotation)
- 'rot-origin':String (the location of rotation point),

The <code>'rot-origin'</code> property is a string formatted just like the 'transform-origin' property in CSS. Like CSS, it defaults to <code>'50% 50%'</code>, which means 50% of the width and 50% of the height, eg, the center point. The first value in the string describes the x location, the second describes the y location. Passing in a single value will apply the same value to both the x and the y location. If you'd prefer to use pixel offsets and not percentages, just leave the '%' off the values. <code>'150 100'</code> will make the rotation origin point {x: 150px, y: 100px}.


##### Showing/Hiding the controls

You can show and hide the controls by passing 'controls' to the plugin folloed by a boolean to either show or hide the controls.

	// hide the controls
	$('mydiv').freetrans('controls', false);

	// show the controls
	$('mydiv').freetrans('controls', true);


##### Destroying the plugin
If you want to remove the freetrans functionality from a selector, you can pass 'destroy'. It will unbind any events, and destroy the data('freetrans') object. 

	// hide the controls
	$('mydiv').freetrans('destroy');