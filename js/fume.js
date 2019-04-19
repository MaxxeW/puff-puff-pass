var camera, scene, renderer,
    geometry, material, mesh;

init();
animate();

function init() {


    clock = new THREE.Clock();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    scene.add(camera);

    geometry = new THREE.CubeGeometry(200, 200, 200);
    material = new THREE.MeshLambertMaterial({
        color: 0xf0f0f0,
        wireframe: false
    });
    mesh = new THREE.Mesh(geometry, material);
    //scene.add( mesh );
    cubeSineDriver = 0;


    light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-1, 0, 3);
    scene.add(light);

    THREE.ImageUtils.crossOrigin = ''; //Need this to pull in crossdomain images from AWS
    smokeTexture = THREE.ImageUtils.loadTexture('https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png');
    smokeMaterial = new THREE.MeshLambertMaterial({
        color: 0x00dddd,
        map: smokeTexture,
        transparent: true
    });
    smokeGeo = new THREE.PlaneGeometry(300, 300);
    smokeParticles = [];


    for (p = 0; p < 150; p++) {
        var particle = new THREE.Mesh(smokeGeo, smokeMaterial);
        particle.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 1000 - 100);
        particle.rotation.z = Math.random() * 360;
        scene.add(particle);
        smokeParticles.push(particle);
    }

    document.body.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0px';
    renderer.domElement.style.top = '0px';

    // Object Model Loader and Manager
    // Instantiate a loader
    var loader = new THREE.GLTFLoader();
    // Load a glTF resource
    loader.load(
        // resource URL
        'models/glb/420.glb',
        // called when the resource is loaded
        function ( gltf ) {

            scene.add( gltf.scene );

        },
        // called while loading is progressing
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        }
        
    );

    //

}

function animate() {

    // note: three.js includes requestAnimationFrame shim
    delta = clock.getDelta();
    requestAnimationFrame(animate);
    evolveSmoke();
    render();
}

function evolveSmoke() {
    var sp = smokeParticles.length;
    while (sp--) {
        smokeParticles[sp].rotation.z += (delta * 0.2);
    }
}

function render() {

    mesh.rotation.x += 0.005;
    mesh.rotation.y += 0.01;
    cubeSineDriver += .01;
    mesh.position.z = 100 + (Math.sin(cubeSineDriver) * 500);
    renderer.render(scene, camera);

}