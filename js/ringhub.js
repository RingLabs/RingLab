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
  controls.noRotate = true;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0.3;

  //lighting
  scene.add( new THREE.AmbientLight ( 0x505050 ) );
  var light = new THREE.SpotLight( 0xffffff, 1.5 );
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

  renderer.shadowMapEnabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  container.appendChild( renderer.domElement );

  var stats = new Stats();
  container.appendChild( stats.dom );

  //event listeners
  renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
  renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
  renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );
  window.addEventListener( 'resize', onWindowResize, false );

  // Load in the mesh and add it to the scene.
  var geometry = new THREE.TorusGeometry( 10, 3, 16, 100 );
  var material = new THREE.MeshLambertMaterial( {color: 0xff0000} );
  var torus = new THREE.Mesh( geometry, material );
  torus.castShadow = true;
  torus.receiveShadow = true;
  scene.add(torus);
  objects.push(torus);

  var geometry2 = new THREE.TorusGeometry( 10, 3, 16, 100 );
  var material2 = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
  var torus2 = new THREE.Mesh( geometry2, material2 );
  torus2.castShadow = true;
  torus2.receiveShadow = true;
  torus2.position.set(50, 50, 0);
  scene.add(torus2);
  objects.push(torus2);

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