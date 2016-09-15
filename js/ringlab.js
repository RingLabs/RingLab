// Set up the scene, camera, and renderer as global variables.
var container, stats;
var scene, camera, controls, renderer;
var objects = [];
var plane = new THREE.Plane();
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),
	offset = new THREE.Vector3(),
	intersection = new THREE.Vector3(),
	INTERSECTED, SELECTED;

init();
animate();

// Sets up the scene.
function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );


	// Create the scene and set the scene size.
	scene = new THREE.Scene();

	//camera
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 200;
	scene.add(camera);

	//controls
	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 5.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noRotate = false;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	//lighting
	scene.add( new THREE.AmbientLight ( 0x505050 ) );
	var light = new THREE.PointLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 200);
	light.castShadow = true;
	light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 200, 10000 ) );
	light.shadow.bias = - 0.00022;
	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;
	scene.add( light );

	// Create a renderer and add it to the DOM.
	renderer = new THREE.WebGLRenderer( {antialias:true} );
	renderer.setClearColor( 0xf0f0f0 );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	container.appendChild( renderer.domElement );

	stats = new Stats();
	//container.appendChild( stats.dom );

	//event listeners
	renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
	window.addEventListener( 'resize', onWindowResize, false );

	//button setup
	var addBtn = document.getElementById( 'add_ring' );
	addBtn.addEventListener( 'click', function() {
	addRing();
	}, false);
}

function animate() {
	requestAnimationFrame(animate);

	render();
	stats.update();
}

function render() {
	controls.update();
	renderer.render( scene, camera );
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
	event.preventDefault();
	// the following two should work but seem to have a mouse offset when selecting rings
  //mouse.x = ( (event.clientX - renderer.domElement.offsetLeft)/ renderer.domElement.width ) * 2 - 1;
	//mouse.y = - ( (event.clientY - renderer.domElement.offsetTop)/ renderer.domElement.height ) * 2 + 1;
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse, camera );

	if ( SELECTED ) {
	  if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
		  SELECTED.position.copy( intersection.sub( offset ) );
	  }
  	return;
	}

	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {

	if ( INTERSECTED != intersects[ 0 ].object ) {

		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

		INTERSECTED = intersects[ 0 ].object;
		INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

		plane.setFromNormalAndCoplanarPoint(
		camera.getWorldDirection( plane.normal ),
		INTERSECTED.position );

	}

	container.style.cursor = 'pointer';

	} else {

	if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

	INTERSECTED = null;

	container.style.cursor = 'auto';

	}

}

function onDocumentMouseDown( event ) {
	event.preventDefault();
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {
	  controls.enabled = false;
	  SELECTED = intersects[ 0 ].object;
	  if ( raycaster.ray.intersectPlane( plane, intersection ) ) {
		  offset.copy( intersection ).sub( SELECTED.position );
	  }

	  container.style.cursor = 'move';
	}
}

function onDocumentMouseUp( event ) {
	event.preventDefault();
	controls.enabled = true;

	if ( INTERSECTED ) {
	  SELECTED = null;
	}

	container.style.cursor = 'auto';
}

function addRing() {
	// Load in the mesh and add it to the scene.
	var geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
	var object = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff, metal: true, shinyness:0 } ) );

	object.position.x = 0;
	object.position.y = 0;
	object.position.z = 0;

	object.castShadow = true;
	object.receiveShadow = true;

	scene.add( object );
	objects.push( object );

	var geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
	var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff} ) );

	object.position.x = 0;
	object.position.y = 0;
	object.position.z = 0;

	object.castShadow = true;
	object.receiveShadow = true;

	scene.add( object );
	objects.push( object );
}

function toggleZoom() {
	controls.noZoom = controls.noZoom ? false : true;
}

function togglePan() {
	controls.noPan = controls.noPan ? false : true;
}

function toggleRotate() {
	controls.noRotate = controls.noRotate ? false : true;
}

window.onload = function () {
	var rotationCheckboxInput = document.querySelector('#rotationCheckbox');
	var panCheckboxInput = document.querySelector('#panCheckbox');
	var zoomCheckboxInput = document.querySelector('#zoomCheckbox');

  function check() {
    rotationCheckboxInput.checked ? controls.noRotate = false : controls.noRotate = true;
    panCheckboxInput.checked ? controls.noPan = false : controls.noPan = true;
    zoomCheckboxInput.checked ? controls.noZoom = false : controls.noZoom = true;
	}
  rotationCheckboxInput.onchange = check;
  panCheckboxInput.onchange = check;
  zoomCheckboxInput.onchange = check;
  check();
}
