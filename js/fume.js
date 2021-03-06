var camera, scene, renderer,
    geometry, material, mesh;


var fftSize = 1024,
    AudioContext = (window.AudioContext || window.webkitAudioContext),

    playing = false,
    startedAt, pausedAt,

    rotation = 0,
    msgElement = document.querySelector('#loading .msg'),
    listener, audio, mediaElement, analyser, uniform, actx;

window.addEventListener('resize', onResize, false);
let playButton = document.getElementById("playButton");
playButton.addEventListener("click", handlePlayButton, false);

let req = new XMLHttpRequest();
req.open('GET', '/puff-puff-pass/audio/outaspace.mp3', true);
req.responseType = 'blob';
req.onload = function() {
    // Onload is triggered even on 404
    // so we need to check the status code
    if (this.status === 200) {
       var audioBlob = this.response;
       var audioUrl = URL.createObjectURL(audioBlob); // IE10+
       // Video is now downloaded
       // and we can set it as source on the video element
       mediaElement = new Audio();
       mediaElement.src = audioUrl;
       listener = new THREE.AudioListener();
        audio = new THREE.Audio(listener);
        // mediaElement = new Audio('../audio/outaspace.mp3');
        audio.setMediaElementSource(mediaElement);
        actx = audio.context;
        console.log(actx, mediaElement);

        analyser = new THREE.AudioAnalyser(audio, fftSize);
        mediaElement.loop = true;
       console.log(`Loaded ${mediaElement} in ${audioUrl} from ${audioBlob}`);
    }
 }
 req.onerror = function() {
    // Error
    console.log('Error.')
 }
 
 req.send();

window.onload = function () {


    init();
    animate();
}

async function playAudio() {
    try {
        await mediaElement.play();
        playButton.classList.toggle("paused");

    } catch (err) {
        playButton.classList.toggle("paused");

    }
}

function handlePlayButton() {
    actx.resume().then(() => {
        if (mediaElement.paused) {
            playAudio();
            playButton.innerText = 'Pause';
        } else {
            mediaElement.pause();
            playButton.classList.toggle("paused");
            playButton.innerText = 'Outaspace!';
        }
        console.log('Playback resumed successfully');
    })

}




function init() {
    
    // listener = new THREE.AudioListener();
    // audio = new THREE.Audio(listener);
    // // mediaElement = new Audio('../audio/outaspace.mp3');
    // audio.setMediaElementSource(mediaElement);
    // actx = audio.context;
    // console.log(actx, mediaElement);

    // analyser = new THREE.AudioAnalyser(audio, fftSize);
    // mediaElement.loop = true;







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
    light.position.set(-1, 0, 2);
    scene.add(light);



    var color = new THREE.Color(1, 0, 0);

    THREE.ImageUtils.crossOrigin = ''; //Need this to pull in crossdomain images from AWS
    smokeTexture = THREE.ImageUtils.loadTexture('./img/Smoke-Element.png');

    smokeGeo = new THREE.PlaneGeometry(300, 300);
    smokeParticles = [];


    for (p = 0; p < 100; p++) {
        smokeMaterial = new THREE.MeshLambertMaterial({
            color: 0x42B42E,
            map: smokeTexture,
            transparent: true
        });
        var particle = new THREE.Mesh(smokeGeo, smokeMaterial);
        particle.position.set(Math.random() * 1000 - 250, Math.random() * 150 - 100, Math.random() * 1500 - 100);
        particle.rotation.z = Math.random() * 2000;
        scene.add(particle);
        smokeParticles.push(particle);
    }



    document.body.appendChild(renderer.domElement);

    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.left = '0px';
    renderer.domElement.style.top = '0px';


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
        smokeParticles[sp].rotation.z += (delta * 0.5);
    }
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {

    analyser.getFrequencyData();

    scene.traverse(function (e) {
        // console.log(e);
        if (e.type === 'Mesh') {
            e.position.y = analyser.data[50] / 3;
            // e.position.x = analyser.data[100] / 2;
        }

    })
    mesh.rotation.x += 0.05 * analyser.data[420];
    mesh.rotation.y += 0.01;
    cubeSineDriver += .01;
    mesh.position.z = 100 + (Math.sin(cubeSineDriver) * 500);
    renderer.render(scene, camera);

}