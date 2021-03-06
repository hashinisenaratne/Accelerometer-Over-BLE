// A mobilephone application for tri-axial accereometer readings from 6 micro:bits.

/**
 * Object that holds application data and functions.
 */
var app = {};

/**
 * Data that is plotted on the canvas relating to each accelerometer (Repace depending on the number of devices)
 */
app.dataPoints1 = [];
app.dataPoints2 = [];
app.dataPoints3 = [];
app.dataPoints4 = [];
app.dataPoints5 = [];
app.dataPoints6 = [];

/**
 * Activities to record along with duration in seconds (Replace accordingly)
 */
app.activities = [	

	['Stand_Still', 10],
	['Sit_down', 5],
	['Sit_Still', 10],
	['Heel_tap_sit_R', 10],
	['Heel_tap_sit_L', 10],
	['Heel_tap_sit_B', 10],
	['Scissors_sit', 10],
	['Toe_tap_sit_R', 10],
	['Toe_tap_sit_L', 10],
	['Toe_tap_sit_B', 10],
	['Swing_on_knee_R', 10],
	['Swing_on_knee_L', 10],
	['Jiggle_R', 10],
	['Jiggle_L', 10],	
	['Sit_Normal', 20],
	['Stand_up', 5],
	['Stand_Normal', 20],
	['Toe_tap_stand_R', 10],
	['Toe_tap_stand_L', 10],	
	['Heel_tap_stand_R', 10],
	['Heel_tap_stand_L', 10],
	['Sit_down', 5],
	['Sit_Normal', 20],
	['Slow_Music', 20],
	['Fast_Music', 20],
	['Stand_up', 5],
	['Walk', 60],	
	['Step_down', 20],
	['Step_up', 20],
	['Run', 10],
	['Stand_Normal', 20],
	['Cycle', 10],	
	['Extra1', 10],
	['Extra2', 10],
	['Extra3', 10]
];

app.currentActivity = -1;
app.recordtime = 0;
app.startTime = 4717064816000;
app.csv = '';
app.csvglobal = '';
app.record = 0;
app.wroteOnce = false;
app. connectionId = 0;
app.disconnectionId = 0;
app.microbitsConnected = 0;

/**
 * Timeout (ms) after which a message is shown if the micro:bit wasn't found.
 */
app.CONNECT_TIMEOUT = 20000;

/**
 * Object that holds micro:bit UUIDs. 
 * Refer to micro:bit related UUIDs at: https://lancaster-university.github.io/microbit-docs/resources/bluetooth/bluetooth_profile.html
 */
app.microbit = {};
app.microbit.ACCELEROMETER_SERVICE = 'e95d0753-251d-470a-a062-fa1922dfa9a8';
app.microbit.ACCELEROMETER_DATA = 'e95dca4b-251d-470a-a062-fa1922dfa9a8';
app.microbit.ACCELEROMETER_PERIOD = 'e95dfb24-251d-470a-a062-fa1922dfa9a8';

var BLE_NOTIFICATION_UUID = '00002902-0000-1000-8000-00805f9b34fb';

/**
 * MAC addresses of 6 micro:bits (Replace accordingly)
 */
var MICROBIT_ADDRESS_1 = 'C6:AF:C9:39:F6:15';
var MICROBIT_ADDRESS_2 = 'F8:AE:B5:D7:56:C5';
var MICROBIT_ADDRESS_3 = 'FF:79:1A:A4:85:EC'; 
var MICROBIT_ADDRESS_4 = 'DC:0B:36:4F:F4:12';
var MICROBIT_ADDRESS_5 = 'FC:23:F1:BE:26:F1';
var MICROBIT_ADDRESS_6 = 'FD:33:A8:12:75:4D';

/**
 * Initialise the application.
 */
app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(app.onDeviceReady) },
		false);

	// Called when HTML page has been loaded.
	$(document).ready( function()
	{
		// Adjust canvas size when browser resizes
		$(window).resize(app.respondCanvas);

		// Adjust the canvas size when the document has loaded.
		app.respondCanvas();
	});
};

/**
 * Adjust the canvas dimensions based on its container's dimensions.
 */
app.respondCanvas = function()
{
	var canvas1 = $('#canvas1');
	var canvas2 = $('#canvas2');
	var canvas3 = $('#canvas3');
	var canvas4 = $('#canvas4');
	var canvas5 = $('#canvas5');
	var canvas6 = $('#canvas6');
	var container1 = $(canvas1).parent();
	var container2 = $(canvas2).parent();
	var container3 = $(canvas3).parent();
	var container4 = $(canvas4).parent();
	var container5 = $(canvas5).parent();
	var container6 = $(canvas6).parent();
	canvas1.attr('width', $(container1).width() );
	canvas2.attr('width', $(container2).width() );
	canvas3.attr('width', $(container3).width() );
	canvas4.attr('width', $(container4).width() );
	canvas5.attr('width', $(container5).width() );
	canvas6.attr('width', $(container6).width() );
	
};

function onConnect(context) {
  console.log("Client Connected");
  console.log(context);
}

app.onDeviceReady = function()
{
	app.showInfo('Activate the micro:bit and tap Start.', 1);
	app.showInfo('Activate the micro:bit and tap Start.', 2);
	app.showInfo('Activate the micro:bit and tap Start.', 3);
	app.showInfo('Activate the micro:bit and tap Start.', 4);
	app.showInfo('Activate the micro:bit and tap Start.', 5);
	app.showInfo('Activate the micro:bit and tap Start.', 6);
};

app.showInfo = function(info, id)
{
	if(id==1){
		document.getElementById('info1').innerHTML = info;
	} else if(id == 2){
		document.getElementById('info2').innerHTML = info;
	} else if(id == 3){
		document.getElementById('info3').innerHTML = info;
	} else if(id == 4){
		document.getElementById('info4').innerHTML = info;
	} else if(id == 5){
		document.getElementById('info5').innerHTML = info;
	} else if(id == 6){
		document.getElementById('info6').innerHTML = info;
	} else if(id == 0) {
		document.getElementById('info').innerHTML = info;
	}
};

// TODO - remove replication
app.onStartButton1 = function()
{
	app.connectionId = 1;
	app.onStopButton1();
	app.startScan();
	app.showInfo('Status: Scanning...', 1);
	app.startConnectTimer();
};

app.onStopButton1 = function()
{
	// Stop any ongoing scan and close devices.
	app.disconnectionId = 1;
	app.stopConnectTimer();
	evothings.easyble.stopScan();
	app.closeDevice(1);
	app.showInfo('Status: Stopped.', 1);
	app.microbitsConnected -=1;
};

app.onStartButton2 = function()
{
	app.connectionId = 2;
	app.onStopButton2();
	app.startScan();
	app.showInfo('Status: Scanning...', 2);
	app.startConnectTimer();
};

app.onStopButton2 = function()
{
	// Stop any ongoing scan and close devices.
	app.disconnectionId = 2;
	app.stopConnectTimer();
	evothings.easyble.stopScan();
	app.closeDevice(2);
	app.showInfo('Status: Stopped.', 2);
	app.microbitsConnected -=1;
};

app.onStartButton3 = function()
{
	app.connectionId = 3;
	app.onStopButton3();
	app.startScan();
	app.showInfo('Status: Scanning...', 3);
	app.startConnectTimer();
};

app.onStopButton3 = function()
{
	// Stop any ongoing scan and close devices.
	app.disconnectionId = 3;
	app.stopConnectTimer();
	evothings.easyble.stopScan();
	app.closeDevice(3);
	app.showInfo('Status: Stopped.', 3);
	app.microbitsConnected -=1;
};

app.onStartButton4 = function()
{
	app.connectionId = 4;
	app.onStopButton4();
	app.startScan();
	app.showInfo('Status: Scanning...', 4);
	app.startConnectTimer();
};

app.onStopButton4 = function()
{
	// Stop any ongoing scan and close devices.
	app.disconnectionId = 4;
	app.stopConnectTimer();
	evothings.easyble.stopScan();
	app.closeDevice(4);
	app.showInfo('Status: Stopped.', 4);
	app.microbitsConnected -=1;
};

app.onStartButton5 = function()
{
	app.connectionId = 5;
	app.onStopButton5();
	app.startScan();
	app.showInfo('Status: Scanning...', 5);
	app.startConnectTimer();
};

app.onStopButton5 = function()
{
	// Stop any ongoing scan and close devices.
	app.disconnectionId = 5;
	app.stopConnectTimer();
	evothings.easyble.stopScan();
	app.closeDevice(5);
	app.showInfo('Status: Stopped.', 5);
	app.microbitsConnected -=1;
};

app.onStartButton6 = function()
{
	app.connectionId = 6;
	app.onStopButton6();
	app.startScan();
	app.showInfo('Status: Scanning...', 6);
	app.startConnectTimer();
};

app.onStopButton6 = function()
{
	// Stop any ongoing scan and close devices.
	app.disconnectionId = 6;
	app.stopConnectTimer();
	evothings.easyble.stopScan();
	app.closeDevice(6);
	app.showInfo('Status: Stopped.', 6);
	app.microbitsConnected -=1;
};

/**
 * If connection is not made within the timeout period, an error message is shown.
 */
app.startConnectTimer = function()
{
	app.connectTimer = setTimeout(
		function()
		{
			app.showInfo('Status: Scanning... ' +
				'Please start the micro:bit.', app.connectionId);
		},
		app.CONNECT_TIMEOUT)
}

app.stopConnectTimer = function()
{
	clearTimeout(app.connectTimer);
}

app.startScan = function()
{
	evothings.easyble.startScan(
		function(device)
		{
			// Connect if found an micro:bit.
			if (app.deviceIsMicrobit(device))
			{
				console.log('device name: ' + device.name);
				console.log('connectionId: ' + app.connectionId);
				if((app.connectionId == 1 && device.address == MICROBIT_ADDRESS_1) || 
				(app.connectionId == 2 && device.address == MICROBIT_ADDRESS_2) || 
				(app.connectionId == 3 && device.address == MICROBIT_ADDRESS_3) ||
				(app.connectionId == 4 && device.address == MICROBIT_ADDRESS_4) ||
				(app.connectionId == 5 && device.address == MICROBIT_ADDRESS_5) ||
				(app.connectionId == 6 && device.address == MICROBIT_ADDRESS_6) )
				{
				console.log('device name: ' + device.name);
				app.showInfo('Status: Device found: ' + device.name + '.', app.connectionId);
				evothings.easyble.stopScan();
				app.connectToDevice(device);
				app.stopConnectTimer();
				}
			}
		},
		function(errorCode)
		{
			app.showInfo('Error: startScan: ' + errorCode + '.', app.connectionId);
		});
};

app.deviceIsMicrobit = function(device)
{
	return (device != null) &&
		(device.name != null) &&
		((device.name.indexOf('MicroBit') > -1) ||
			(device.name.indexOf('micro:bit') > -1));
};

/**
 * Read services for a device.
 */
app.connectToDevice = function(device)
{
	app.showInfo('Connecting...', app.connectionId);
	device.connect(
		function(device)
		{
			app.showInfo('Status: Connected - reading micro:bit services...', app.connectionId);
			app.microbitsConnected +=2;
			console.log('Connected');
			app.readServices(device);
		},
		function(errorCode)
		{
			app.showInfo('Error: Connection failed: ' + errorCode + '.', app.connectionId);
			evothings.ble.reset();
		});
};

app.closeDevice = function(id)
{
	var devices = evothings.easyble.getConnectedDevices();
	if(devices != null){
	for (var key in devices){
		if(devices[key] != null && devices[key] != undefined && id == 1 && devices[key].address == MICROBIT_ADDRESS_1){
			evothings.easyble.closeConnectedDevice(devices[key]);
			console.log('CLOSED');
		} else if(devices[key] != null && devices[key] != undefined && id == 2 && devices[key].address == MICROBIT_ADDRESS_2){
			evothings.easyble.closeConnectedDevice(devices[key]);
		} else if(devices[key] != null && devices[key] != undefined && id == 3 && devices[key].address == MICROBIT_ADDRESS_3){
			evothings.easyble.closeConnectedDevice(devices[key]);
		} else if(devices[key] != null && devices[key] != undefined && id == 4 && devices[key].address == MICROBIT_ADDRESS_4){
			evothings.easyble.closeConnectedDevice(devices[key]);
		} else if(devices[key] != null && devices[key] != undefined && id == 5 && devices[key].address == MICROBIT_ADDRESS_5){
			evothings.easyble.closeConnectedDevice(devices[key]);
		} else if(devices[key] != null && devices[key] != undefined && id == 6 && devices[key].address == MICROBIT_ADDRESS_6){
			evothings.easyble.closeConnectedDevice(devices[key]);
		}
	}
	}
}

app.readServices = function(device)
{
	console.log('adding read services');
	device.readServices(
		[ app.microbit.ACCELEROMETER_SERVICE], // Accelerometer service UUID.
		app.startAccelerometerNotification, // Function that monitors accelerometer data
		// Use this function to monitor magnetometer data(comment out the above line if you try this).
		//app.startMagnetometerNotification,
		function(errorCode)
		{
			console.log('Error: Failed to read services: ' + errorCode + '.', app.connectionId);
		});
};

/**
 * Read accelerometer data.
 */
app.startAccelerometerNotification = function(device)
{
	console.log('starting accelerometer notification');
	app.showInfo('Status: Starting accelerometer notification...');
	var id = (
		device.address === MICROBIT_ADDRESS_1 ? 1 :
		device.address === MICROBIT_ADDRESS_2 ? 2 :
		device.address === MICROBIT_ADDRESS_3 ? 3 :
		device.address === MICROBIT_ADDRESS_4 ? 4 :
		device.address === MICROBIT_ADDRESS_5 ? 5 :
		device.address === MICROBIT_ADDRESS_6 ? 6 :
		null
	  );

	// Due to https://github.com/evothings/cordova-ble/issues/30
	// ... we have to do double work to make it function properly
	// on both Android and iOS. This first part is only needed for Android
	// and causes an error message on iOS that is safe to ignore.
  
	// Set accelerometer notification to ON.
	device.writeDescriptor(
		app.microbit.ACCELEROMETER_DATA,
		BLE_NOTIFICATION_UUID,
		new Uint8Array([1,0]),
		function()
		{
			console.log('Status: writeDescriptor ok.');
		},
		function(errorCode)
		{
			// This error will happen on iOS, since this descriptor is not
			// listed when requesting descriptors. On iOS you are not allowed
			// to use the configuration descriptor explicitly. It should be
			// safe to ignore this error.
			console.log('Error: writeDescriptor: ' + errorCode + '.');
		});

	setTimeout(function(){ 
			console.log('timeout 1'); 
			// Start accelerometer notification.
			device.enableNotification(
				app.microbit.ACCELEROMETER_DATA,
				function(data)
				{
					app.showInfo('Status: Data stream active - accelerometer', id);
					var dataArray = new Uint8Array(data);
					var values = app.getAccelerometerValues(dataArray, id);
					app.drawDiagram(values, id);
				},
				function(errorCode)
				{
					console.log('Error: enableNotification: ' + errorCode + '.');
				});
	}, 3000);
	
};

/**
 * Calculate accelerometer values from raw data for micro:bit.
 * @param data - an Uint8Array.
 * @return Object with fields: x, y, z.
 */
app.getAccelerometerValues = function(data, id)
{
	// We want to scale the values to +/- 1.
	// Documentation says: "Values are in the range +/-1000 milli-newtons, little-endian."
	// Actual maximum values is measured to be 2048.
	var divisor = 2048;

	// Calculate accelerometer values.
	var rawX = evothings.util.littleEndianToInt16(data, 0);
	var rawY = evothings.util.littleEndianToInt16(data, 2);
	var rawZ = evothings.util.littleEndianToInt16(data, 4);
	var ax = rawX / divisor;
	var ay = rawY / divisor;
	var az = rawZ / divisor;

	// log raw values every now and then
	var now = new Date().getTime();	// current time in milliseconds since 1970.
	var log = id + ',' + now + ',' + rawX + ',' + rawY + ',' + rawZ + '\n';
		
	if(app.record == 1){
		app.csvglobal = app.csvglobal + log;
		if((now - app.startTime) >= (app.recordtime*1000)){
			app.onStop();
		}
	}
	return { x: ax, y: ay, z: az };
};

/**
 * Plot diagram of sensor values.
 * Values plotted are expected to be between -1 and 1
 * and in the form of objects with fields x, y, z.
 */
// TODO - remove replication
app.drawDiagram = function(values, id)
{
	var canvasID =(
		id === 1 ? 'canvas1' :
		id === 2 ? 'canvas2' :
		id === 3 ? 'canvas3' :
		id === 4 ? 'canvas4' :
		id === 5 ? 'canvas5' :
		id === 6 ? 'canvas6' :
		null
	  );
	var canvas = document.getElementById(canvasID);
	var context = canvas.getContext('2d');
	var datapoints = [];
	// Add recent values.
	if(id == 1){
		app.dataPoints1.push(values);
		// Remove data points that do not fit the canvas.
		if (app.dataPoints1.length > canvas.width)
		{
			app.dataPoints1.splice(0, (app.dataPoints1.length - canvas.width));
		}
	} else if(id == 2){
		app.dataPoints2.push(values);

		// Remove data points that do not fit the canvas.
		if (app.dataPoints2.length > canvas.width)
		{
			app.dataPoints2.splice(0, (app.dataPoints2.length - canvas.width));
		}
	} else if(id == 3){
		app.dataPoints3.push(values);

		// Remove data points that do not fit the canvas.
		if (app.dataPoints3.length > canvas.width)
		{
			app.dataPoints3.splice(0, (app.dataPoints3.length - canvas.width));
		}
	} else if(id == 4){
		app.dataPoints4.push(values);

		// Remove data points that do not fit the canvas.
		if (app.dataPoints4.length > canvas.width)
		{
			app.dataPoints4.splice(0, (app.dataPoints4.length - canvas.width));
		}
	} else if(id == 5){
		app.dataPoints5.push(values);

		// Remove data points that do not fit the canvas.
		if (app.dataPoints5.length > canvas.width)
		{
			app.dataPoints5.splice(0, (app.dataPoints5.length - canvas.width));
		}
	} else if(id == 6){
		app.dataPoints6.push(values);

		// Remove data points that do not fit the canvas.
		if (app.dataPoints6.length > canvas.width)
		{
			app.dataPoints6.splice(0, (app.dataPoints6.length - canvas.width));
		}
	}

	// Value is an accelerometer reading between -1 and 1.
	function calcDiagramY(value)
	{
		// Return Y coordinate for this value.
		var diagramY =
			((value * (canvas.height-1)) / 2)
			+ ((canvas.height-1) / 2);
		return diagramY;
	}

	// TODO - remove replication
	function drawLine(axis, color)
	{
		if(id==1){
			context.strokeStyle = color;
			context.beginPath();
			var lastDiagramY = calcDiagramY(
				app.dataPoints1[app.dataPoints1.length-1][axis]);
			context.moveTo(0, lastDiagramY);
			var x = 1;
			for (var i = app.dataPoints1.length - 2; i >= 0; i--)
			{
				var y = calcDiagramY(app.dataPoints1[i][axis]);
				context.lineTo(x, y);
				x++;
			}
			context.stroke();
		} else if(id==2){
			context.strokeStyle = color;
			context.beginPath();
			var lastDiagramY = calcDiagramY(
				app.dataPoints2[app.dataPoints2.length-1][axis]);
			context.moveTo(0, lastDiagramY);
			var x = 1;
			for (var i = app.dataPoints2.length - 2; i >= 0; i--)
			{
				var y = calcDiagramY(app.dataPoints2[i][axis]);
				context.lineTo(x, y);
				x++;
			}
			context.stroke();
		} else if(id==3){
			context.strokeStyle = color;
			context.beginPath();
			var lastDiagramY = calcDiagramY(
				app.dataPoints3[app.dataPoints3.length-1][axis]);
			context.moveTo(0, lastDiagramY);
			var x = 1;
			for (var i = app.dataPoints3.length - 2; i >= 0; i--)
			{
				var y = calcDiagramY(app.dataPoints3[i][axis]);
				context.lineTo(x, y);
				x++;
			}
			context.stroke();
		} else if(id==4){
			context.strokeStyle = color;
			context.beginPath();
			var lastDiagramY = calcDiagramY(
				app.dataPoints4[app.dataPoints4.length-1][axis]);
			context.moveTo(0, lastDiagramY);
			var x = 1;
			for (var i = app.dataPoints4.length - 2; i >= 0; i--)
			{
				var y = calcDiagramY(app.dataPoints4[i][axis]);
				context.lineTo(x, y);
				x++;
			}
			context.stroke();
		} else if(id==5){
			context.strokeStyle = color;
			context.beginPath();
			var lastDiagramY = calcDiagramY(
				app.dataPoints5[app.dataPoints5.length-1][axis]);
			context.moveTo(0, lastDiagramY);
			var x = 1;
			for (var i = app.dataPoints5.length - 2; i >= 0; i--)
			{
				var y = calcDiagramY(app.dataPoints5[i][axis]);
				context.lineTo(x, y);
				x++;
			}
			context.stroke();
		} else if(id==6){
			context.strokeStyle = color;
			context.beginPath();
			var lastDiagramY = calcDiagramY(
				app.dataPoints6[app.dataPoints6.length-1][axis]);
			context.moveTo(0, lastDiagramY);
			var x = 1;
			for (var i = app.dataPoints6.length - 2; i >= 0; i--)
			{
				var y = calcDiagramY(app.dataPoints6[i][axis]);
				context.lineTo(x, y);
				x++;
			}
			context.stroke();
		}
	}

	// Clear background.
	context.clearRect(0, 0, canvas.width, canvas.height);

	// Draw lines.
	drawLine('x', '#f00');
	drawLine('y', '#0f0');
	drawLine('z', '#00f');
};

app.onRecord = function()
{
	if(app.microbitsConnected >= 3) {
		app.currentActivity += 1;
		app.startTime = new Date().getTime();
		app.recordtime = app.activities[app.currentActivity][1];
		document.getElementById('Now').innerHTML = app.activities[app.currentActivity][0]+'('+app.activities[app.currentActivity][1]+')'+ app.currentActivity + '/'+52;
		document.getElementById('Next').innerHTML = app.activities[app.currentActivity+1][0];

		app.record = 1;

		app.showInfo('Recording initiate.', 0);
		
		document.getElementById('Stop').disabled = false;
		document.getElementById('Discard').disabled = false;
		document.getElementById('Record').disabled = true;
		document.getElementById('Pre').disabled = true;
		document.getElementById('Next').disabled = true;

		document.getElementById('start1').disabled = true;
		document.getElementById("stop1").disabled = true;
		document.getElementById('start2').disabled = true;
		document.getElementById("stop2").disabled = true;
		document.getElementById('start3').disabled = true;
		document.getElementById("stop3").disabled = true;
		document.getElementById('start4').disabled = true;
		document.getElementById("stop4").disabled = true;
		document.getElementById('start5').disabled = true;
		document.getElementById("stop5").disabled = true;	
		document.getElementById('start6').disabled = true;
		document.getElementById("stop6").disabled = true;
	} else{
		app.showInfo("connect at least 3 microbits, now"+app.microbitsConnected, 0);
		document.getElementById('Stop').disabled = true;
		document.getElementById('Discard').disabled = true;
	}
};

app.onDiscard = function()
{
	app.startTime = 4717064816000;
	app.record = 0;	
	app.currentActivity -= 1;	
	app.showInfo('Recording Discarded.', 0);	
	document.getElementById('Record').disabled = false;	
	document.getElementById('Stop').disabled = true;
	document.getElementById('Discard').disabled = true;	
	document.getElementById('Pre').disabled = false;
	document.getElementById('Next').disabled = false;
	document.getElementById('Now').innerHTML = 'Not Recording';
	document.getElementById('Next').innerHTML = app.activities[app.currentActivity+1][0];

	document.getElementById('start1').disabled = false;
	document.getElementById("stop1").disabled = false;
	document.getElementById('start2').disabled = false;
	document.getElementById("stop2").disabled = false;
	document.getElementById('start3').disabled = false;
	document.getElementById("stop3").disabled = false;
	document.getElementById('start4').disabled = false;
	document.getElementById("stop4").disabled = false;
	document.getElementById('start5').disabled = false;
	document.getElementById("stop5").disabled = false;	
	document.getElementById('start6').disabled = false;
	document.getElementById("stop6").disabled = false;
	app.csvglobal = '';
};

app.onStop = function()
{
	app.startTime = 4717064816000;
	app.record = 0;	
	app.showInfo('Recording Stopped.', 0);
	document.getElementById('Record').disabled = false;	
	document.getElementById('Stop').disabled = true;
	document.getElementById('Discard').disabled = true;	
	document.getElementById('Pre').disabled = false;
	document.getElementById('Next').disabled = false;

	document.getElementById('Now').innerHTML = 'Not Recording';

	document.getElementById('start1').disabled = false;
	document.getElementById("stop1").disabled = false;
	document.getElementById('start2').disabled = false;
	document.getElementById("stop2").disabled = false;
	document.getElementById('start3').disabled = false;
	document.getElementById("stop3").disabled = false;
	document.getElementById('start4').disabled = false;
	document.getElementById("stop4").disabled = false;
	document.getElementById('start5').disabled = false;
	document.getElementById("stop5").disabled = false;	
	document.getElementById('start6').disabled = false;
	document.getElementById("stop6").disabled = false;
	var now = new Date().getTime();
	var filename = 'MMM_'+document.getElementById('userNo').value+app.activities[app.currentActivity][0]+'_'+now+'.csv'
	app.append(app.csvglobal, filename);
	app.csvglobal = '';
};

app.onNext = function()
{
	if(app.microbitsConnected >= 3) {
		app.currentActivity += 1;
		document.getElementById('Now').innerHTML = "Not Recording";
		document.getElementById('Next').innerHTML = app.activities[app.currentActivity+1][0];
		app.showInfo('Set to Next.', 0);
	} else{
		app.showInfo("connect at least 3 microbits, now"+app.microbitsConnected, 0);
	}
};

app.onPre = function()
{
	if(app.microbitsConnected >= 3) {
		app.currentActivity -= 1;
		document.getElementById('Now').innerHTML = "Not Recording";
		document.getElementById('Next').innerHTML = app.activities[app.currentActivity+1][0];
		app.showInfo('Set to Previous.', 0);
	} else{
		app.showInfo("connect at least 3 microbits, now"+app.microbitsConnected, 0);
	}
};

app.append = function(data, file) {
	window.resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function(dirEntry) {
		console.log('file system open: ' + dirEntry.name);
		var isAppend = app.wroteOnce;
		app.createFile(dirEntry, file, isAppend, data);
	}, onErrorLoadFs);
};

app.createFile =  function (dirEntry, fileName, isAppend, data) {
    // Creates a new file or returns the file if it already exists.
    dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
		app.writeFile(fileEntry, data, isAppend);
		app.showInfo('write **********************************', 0);
    }, onErrorCreateFile);
};

app.writeFile = function (fileEntry, dataObj, isAppend) {
    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
			console.log("Successful file read...");
			app.showInfo("Successful file read...", 0);
            app.readFile(fileEntry);
        };

        fileWriter.onerror = function (e) {
			console.log("Failed file read: " + e.toString());
			app.showInfo("Failed file read: " + e.toString(), 0);
        };

        // If we are appending data to file, go to the end of the file.
        if (isAppend) {
            try {
                fileWriter.seek(fileWriter.length);
            }
            catch (e) {
				console.log("file doesn't exist!");
				app.showInfo("file doesn't exist!", 0);
            }
        }
		fileWriter.write(dataObj);
		app.wroteOnce = true;
    });
};

function onErrorCreateFile() {
	console.log("Create file fail...");	
	app.showInfo("------------------------------- create fail", 0);
}
	

function onErrorLoadFs() {
	console.log("File system fail...");
	app.showInfo("File system fail.........................", 0);
}

app.readFile = function (fileEntry) {

    fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function() {
            console.log("Successful file read: " + this.result);
            displayFileData(fileEntry.fullPath + ": " + this.result);
        };

        reader.readAsText(file);

    });
}

// Initialize the app.
app.initialize();
