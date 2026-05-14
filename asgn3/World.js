// ColoredPoint.js (c) 2012 matsuda


// Vertex shader program
//come here to change the brush size

var VSHADER_SOURCE =
  'precision mediump float;\n' + 
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_UV;\n' +
  'varying vec2 v_UV;\n' +
  'uniform float u_Size;\n' +
  'uniform mat4 u_ModelMatrix\n;' + 
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjectionMatrix\n;' +
  'void main() {\n' +
  '  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  //'  gl_Position = u_ProjectionMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '  v_UV = a_UV; \n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec2 v_UV;\n' + 
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'uniform sampler2D u_Sampler0;\n' + 
  'uniform sampler2D u_Sampler1;\n' + 
  'uniform sampler2D u_Sampler2;\n' + 
  'uniform int u_whichTexture;\n' + 
  'void main() {\n' +
  '  if(u_whichTexture == -2){\n' +
  '     gl_FragColor = u_FragColor;\n' +
  '  } else if(u_whichTexture == -1){\n' +
  '     gl_FragColor = vec4(v_UV, 1.0, 1.0);\n' + 
  '  } else if(u_whichTexture == 0){\n' +
  '     gl_FragColor = texture2D(u_Sampler0, v_UV);\n' + 
  '  } else if(u_whichTexture == 1){ \n' +
  '     gl_FragColor = texture2D(u_Sampler1, v_UV); \n' +
  '  }else if (u_whichTexture == 2){ \n' +
  '     gl_FragColor = texture2D(u_Sampler2, v_UV); \n' +
  '  } else { \n' +
  '     gl_FragColor = vec4(1,.2,.2,1); \n' + 
  '  }\n' +  
  '}\n';


//global vars


let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_GlobalRotateMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_ModelMatrix;

//from the example, he uses the global variables canvas and gl.
//DO NOT TOUCH THIS ANYMORE, IT SETS UP WEBGL.
//at least not for the rest of the quarter
function setupWebGL(){

  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);

  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  //I have literally no idea why this line disappeared, but this should do it. 
  //this prevents overlap between cubes
  gl.enable(gl.DEPTH_TEST);

}

//compiles and installs shaders
function connectVariablesToGLSL(){
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  //get storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if(a_UV < 0){
    console.log('Failed to get the storage location of a_UV');
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix){
    console.log('failed to get location of u_ProjectionMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix){
    console.log('failed to get location of u_ViewMatrix');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }


  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix){
    console.log('failed to get location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('failed to get location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}


//ui globals

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2

//render and camera
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedSegment = 10;
let g_selectedVertDist = 1;
let g_selectedHeight = 1;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_mouseXRotation = 0;
let g_mouseYRotation = 0;
let g_pointerLock = false;

//cow left side
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_leftHandAngle = 0;
let g_tailAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_leftHandAnimation = false;
let g_tailAnimation = false;

let g_pokeAnimation = false;
let g_pokeTime = 0;
let g_pokeDuration = 3.0;
let g_pokeStartTime = 0;

function addUIelements(){


  //old buttons
  document.getElementById('green').onclick = function() {g_selectedColor = [0.0,1.0,0.0,1.0]};
  document.getElementById('red').onclick = function() {g_selectedColor = [1.0,0.0,0.0,1.0]};
  document.getElementById('clear').onclick = function() {g_shapesList = []; renderAllShapes();};
  document.getElementById('undo').onclick = function() {g_shapesList.pop(); renderAllShapes();};
  document.getElementById('point').onclick = function() {g_selectedType = POINT};
  document.getElementById('triangle').onclick = function() {g_selectedType = TRIANGLE};
  document.getElementById('circle').onclick = function() {g_selectedType = CIRCLE};

  //old sliders
  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100});
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100});
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100});

  //sliders for the different joints
  document.getElementById('jointSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderAllShapes();});
  document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderAllShapes();});

  document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});

  //animation buttons
  document.getElementById('on').onclick = function() {g_yellowAnimation = true;};
  document.getElementById('off').onclick = function() {g_yellowAnimation = false;};

  document.getElementById('mon').onclick = function() {g_magentaAnimation = true;};
  document.getElementById('moff').onclick = function() {g_magentaAnimation = false;};


}

function initTextures(gl, n){
  var texture = gl.createTexture();  //creates some texture object
  if(!texture){
    console.log("failed to create the texture object");
    return false;
  }

  var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if(!u_Sampler0){
    console.log("failed to get the storage location of u_Sampler0");
    return false;
  }

  var image = new Image();
  if(!image){
    console.log("failed to create the image object");
    return false;
  }

  image.onload = function(){sendTextureToGLSL(gl, n, texture, u_Sampler0, image);}
  //with this one, I think I can just use an if statement to change the .src of the image so I can change whatever
  image.src = 'deceased.jpg'; //I thikn I need an image file of some sort for this thing to work.
  
  if(n == 0){
    image.src = 'grass.jpg'; //floor
  }
  if(n == 1){
    image.src = 'space.jpg'; //sky
  }
  if(n == 2){
    image.src = 'stone.jpg'; //stone blocks
  }
  
  return true;
}

function sendTextureToGLSL(gl, n, texture, u_Sampler, image){
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  if(n == 0){
    gl.activeTexture(gl.TEXTURE0);
  }
  if(n == 1){
    gl.activeTexture(gl.TEXTURE1);
  }
  if(n == 2){
    gl.activeTexture(gl.TEXTURE2);
  }

  //gl.activeTexture(gl.TEXTURE0);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  gl.uniform1i(u_Sampler, 0);

  console.log('finished loadTexture');

  if(n == 0){
    var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    gl.uniform1i(u_Sampler0, 0);
  }
  else if(n == 1){
    var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    gl.uniform1i(u_Sampler1, 1);
  }
  else if(n == 2){
    var u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    gl.uniform1i(u_Sampler2, 2);
  }

}



function main() {
  // Retrieve <canvas> element
  
  setupWebGL();
  connectVariablesToGLSL();

  addUIelements();

  document.onkeydown = keydown;

  initTextures(gl, 0);
  initTextures(gl, 1);
  initTextures(gl, 2);
  // Register function (event handler) to be called on a mouse press
  
  canvas.onmousedown = function(ev){
    if(ev.shiftKey){
      if(!g_pokeAnimation){
        g_pokeAnimation = true;
        g_pokeDuration = g_seconds;
        console.log("shift and click!!!!!!!!!!!!!!!!");
      }
    }else{
      click(ev);
    }
  }

  document.addEventListener('mousemove', onMove);

  document.addEventListener('pointerlockchange', function() {
    g_pointerLock = document.pointerLockElement === canvas;
  });

  canvas.addEventListener('click', function() {
      if (!g_pointerLock) {
          canvas.requestPointerLock();
      }
  });

  canvas.addEventListener('mousedown', function(ev) {
    if (!g_pointerLock) return;
    if (ev.button === 0) deleteBlock();  // left click
    if (ev.button === 2) addBlock();     // right click
});

canvas.addEventListener('contextmenu', ev => ev.preventDefault());


  // Specify the color for clearing <canvas>
  //blue background
  //gl.clearColor(0.53, 0.81, 0.92, 1.0);
  //black background
  gl.clearColor(0, 0, 0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //might have to change this later
  //renderScene();
  requestAnimationFrame(tick);
}

var g_shapesList = [];

function click(ev) {

  let [x, y] = convertCoordinateEventToGL(ev);
  let point;

  if(g_selectedType == POINT){
    point = new Point();
  }else if(g_selectedType == TRIANGLE){
    point = new Triangle();
  }else{
    point = new Circle();
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  if(g_selectedType == CIRCLE){
    point.segments = g_selectedSegment;
  }

  if(g_selectedType == TRIANGLE){
    point.vertDist = g_selectedVertDist;
    point.height = g_selectedHeight;
  }
 
  
  renderAllShapes();
}

function convertCoordinateEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x, y])

}



var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];
var g_camera = new Camera();
var g_keys = {};


let g_lastMouseX = null;
let g_lastMouseY = null;
let g_sens = 0.3;


/*
function onMove(ev){
  if (!(ev.buttons & 1)) return;  // only rotate while holding mouse

  if (g_lastMouseX === null) {
    g_lastMouseX = ev.clientX;
    g_lastMouseY = ev.clientY;
    return;
  }

  let deltaX = ev.clientX - g_lastMouseX;
  let deltaY = ev.clientY - g_lastMouseY;

  g_lastMouseX = ev.clientX;
  g_lastMouseY = ev.clientY;

  let alpha = deltaX * g_sens;
  let beta  = -deltaY * g_sens;

  if (alpha > 0) g_camera.panRight(alpha);
  else g_camera.panLeft(-alpha);

  g_camera.pitchCamera(beta);

  renderAllShapes();
}
  */

function onMove(ev) {
    if (!g_pointerLock) return;

    let alpha = ev.movementX * g_sens;
    let beta  = -ev.movementY * g_sens;

    if (alpha > 0) g_camera.panRight(alpha);
    else g_camera.panLeft(-alpha);

    g_camera.pitchCamera(beta);
}

function resetMouse(){
  g_lastMouseX = null;
  g_lastMouseY = null;
}

var g_map = [
  [1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,1,1,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,1],
];

//for stacking and storing block locations
var g_blocks = {};

//so that I could actually place blocks, 36 * 36 area
function buildMap() {
    for (let x = 0; x < 36; x++) {
        for (let z = 0; z < 36; z++) {
            if (x === 0 || x === 35 || z === 0 || z === 35) {
                g_blocks[x+','+z] = 1;
            }
        }
    }
}

function drawMap() {
    for (let key in g_blocks) {
        let [x, z] = key.split(',').map(Number);
        let h = g_blocks[key];
        for (let y = 0; y < h; y++) {
            var cube = new Cube();
            cube.color = [0.8, 1.0, 1.0, 1.0];
            cube.textureNum = 2;
            cube.matrix.translate(0, -0.5, 0);
            cube.matrix.scale(0.3, 0.3, 0.3);
            cube.matrix.translate(x - 16, y, z - 16);
            cube.render();
        }
    }
}




//this is for continuous movement
function keydown(ev){
  g_keys[ev.keyCode] = true;
}

document.onkeyup = function(ev){
  g_keys[ev.keyCode] = false
}

function handlekeys(ev){
  if (g_keys[70]) {  // F key
    document.exitPointerLock();
    g_keys[70] = false;  // prevent repeated firing
  }
  if(g_keys[65]){ //right arrow
    g_camera.left();
  }
  if(g_keys[68]){ //left arrow
    g_camera.right();
  }
  if(g_keys[87]){ //up arrow
    g_camera.forward();
  }
  if(g_keys[83]){ //down arrow
    g_camera.back();
  }
}

function getBlockInFront() {
    let ray = {
        x: g_camera.at.x - g_camera.eye.x,
        z: g_camera.at.z - g_camera.eye.z
    };
    let len = Math.sqrt(ray.x*ray.x + ray.z*ray.z);
    ray.x /= len;
    ray.z /= len;

    // step 1 block ahead in world space, convert to grid
    let wx = g_camera.eye.x + ray.x * 0.3;
    let wz = g_camera.eye.z + ray.z * 0.3;

    let gx = Math.round(wx / 0.3 + 16);
    let gz = Math.round(wz / 0.3 + 16);

    return gx+','+gz;
}

function addBlock() {
    let key = getBlockInFront();
    g_blocks[key] = (g_blocks[key] || 0) + 1;
}

function deleteBlock() {
    let key = getBlockInFront();
    if (g_blocks[key] > 0) {
        g_blocks[key]--;
        if (g_blocks[key] === 0) delete g_blocks[key];
    }
}



//potential function to interact with some blocks

function renderAllShapes(){

  var startTime = performance.now();

  var projectionMat = new Matrix4();
  projectionMat.setPerspective(60, 1*canvas.width/canvas.height, .1, 100); //(how narrow fov is, aspect ratio, near + far plane, )
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projectionMat.elements);

  // View (camera)
  var viewMat = new Matrix4();
  //viewMat.setLookAt(g_eye[0],g_eye[1],g_eye[2], g_at[0],g_at[1],g_at[2], g_up[0],g_up[1],g_up[2]); //x,y,z, I'd look at this a little more

  viewMat.setLookAt(
      g_camera.eye.x,g_camera.eye.y,g_camera.eye.z, 
      g_camera.at.x,g_camera.at.y,g_camera.at.z, 
      g_camera.up.x,g_camera.up.y,g_camera.up.z
  );

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  //for the rotation camera
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0,1,0).rotate(g_mouseXRotation, 1, 0, 0).rotate(g_mouseYRotation, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  //drawTriangle3D([-1.0,0.0,0.0,  -0.5,-1.0,0.0,  0.0,0.0,0.0]);

  //passed it off to someone else(different function)
  drawMap();
  renderScene();
 // var duration = performance.now() - startTime;
 // sendTextToHTML("numdot: " + len + "ms: " + Math.floor(duration) + "fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function updateAnimationAngles(){
  if(g_pokeAnimation){
    let timeElapsed = g_seconds - g_pokeStartTime;
    let t = timeElapsed / g_pokeDuration;

    if(t < 3.0){
      //g_tailAngle = (180 * (Math.sin(t * 5)));
      //g_yellowAngle = (180 * (Math.sin(t * 5)));
      let intensity = Math.sin(t * Math.PI * 20);
      g_yellowAngle = 360 * intensity;
      g_tailAngle = 360 * intensity;
      return;
    }else{
      g_pokeAnimation = false;
      g_tailAngle = 0;
      g_yellowAngle = 0;
      console.log("finished!");
    }
  }
  if(g_yellowAnimation){
    g_yellowAngle = (25 * Math.sin(g_seconds));
    g_tailAngle = (35 * Math.sin(g_seconds));
  }
  //I don't want to coordinate the double joint, but as per assignment, I am keeping this here as a proof of concept.
  if(g_magentaAnimation){
    g_magentaAngle = (5 * Math.sin(g_seconds * 3));
  }
  if(g_leftHandAnimation){
    g_leftHandAngle = (45 * Math.sin(g_seconds * 3));
  }
  
}

function buildCow(){
  var pink = [1.0, .75, .8, 1.0];
  var brown = [.59, .29, 0, 1.0];
  var black = [0,0,0,1];
  var white = [1,1,1,1];

  
//making the cow

  //body
  var body = new Cube();
  body.color = brown;
  
  body.matrix.rotate(90, 0, 1, 0);
  body.matrix.scale(.5,.5,1.0);
  body.matrix.scale(0.8,0.8,0.8);
  body.matrix.translate(-.2,-.2,1);
  
  var bodyCoords = new Matrix4(body.matrix);
  body.render();

  //tail
  var tail = new Cube();
  tail.color = brown;
  tail.matrix = new Matrix4(bodyCoords);
  tail.matrix.translate(.45,.8,1);
  //going to do animations here too, just finishing the body
  tail.matrix.rotate(135 + g_tailAngle,1,0,0);
  tail.matrix.scale(0.1, .75, 0.1);
  tail.render();

  //head
  var head = new Cube();
  head.color = brown;
  head.matrix = new Matrix4(bodyCoords);
  head.matrix.translate(0.175,.65,-.25);
  head.matrix.scale(.65, .65, .35);
  var headCoords = new Matrix4(head.matrix);
  head.render();

  var nose = new Cylinder();
  nose.color = pink;
  nose.matrix = headCoords;
  //nose.matrix.translate(0,.55,-0.025);
  nose.matrix.translate(.5,0.3,-.025);
  nose.matrix.scale(.4,.25,.25);
  nose.matrix.rotate(90, 1, 0, 0);
  nose.render();

  var leftNostril = new Cylinder();
  leftNostril.color = black;
  leftNostril.matrix = new Matrix4(headCoords);
  leftNostril.matrix.translate(-.25, 1, -0.035);
  leftNostril.matrix.translate(0,-1.25,0);
  leftNostril.matrix.scale(0.15,0.35,.5);
  leftNostril.matrix.rotate(0, 1, 0, 0);
  leftNostril.render();

  var rightNostril = new Cylinder();
  rightNostril.color = black;
  rightNostril.matrix = new Matrix4(headCoords);
  rightNostril.matrix.translate(.25, -.25, -0.035);
  rightNostril.matrix.scale(0.15,0.35,.5);
  rightNostril.matrix.rotate(0, 1, 0, 0);
  rightNostril.render();

  var leftEye = new Cylinder();
  leftEye.color = black;
  leftEye.matrix = new Matrix4(headCoords);
  leftEye.matrix.translate(.75, -.25, -1.5);
  leftEye.matrix.scale(.4, .25, .35);
  leftEye.matrix.rotate(0, 1, 0, 0);
  leftEye.render();

  var rightEye = new Cylinder();
  rightEye.color = black;
  rightEye.matrix = new Matrix4(headCoords);
  rightEye.matrix.translate(-.75, -.25, -1.5);
  rightEye.matrix.scale(.4, .25, .35);
  rightEye.matrix.rotate(0, 1, 0, 0);
  rightEye.render();

  var horn1 = new Cube();
  horn1.color = white;
  horn1.matrix = new Matrix4(headCoords);
  horn1.matrix.translate(-1.5, 1, -3.5);
  horn1.matrix.scale(0.5, 1, 1.5);
  //x z y
  horn1.matrix.rotate(0,0,0,1);
  horn1.render();

  var horn2 = new Cube();
  horn2.color = white;
  horn2.matrix = new Matrix4(headCoords);
  horn2.matrix.translate(1, 1, -3.5);
  horn2.matrix.scale(0.5, 1, 1.5);
  horn2.matrix.rotate(0,0,0,1);
  horn2.render();

  //arms and legs are going to be loosely identical
  //left arm (including hands)
  
  var leftarm = new Cube();
  leftarm.color = brown;
  leftarm.matrix = new Matrix4(bodyCoords);
  leftarm.matrix.translate(0.7, -.4, .1);
  leftarm.matrix.translate(0, .4, 0);
  leftarm.matrix.rotate(g_yellowAngle, 1, 0, 0);
  var leftArmCoords = new Matrix4(leftarm.matrix);
  leftarm.matrix.translate(0, -.4, 0);
  leftarm.matrix.scale(0.3, .5, .15);
  leftarm.render();

  var lowerL = new Cube();
  lowerL.color = brown;
  lowerL.matrix = new Matrix4(leftArmCoords);
  lowerL.matrix.translate(0, -.8, 0);
  lowerL.matrix.translate(0, .7, 0);
  lowerL.matrix.rotate(g_magentaAngle,1,0,0);
  lowerL.matrix.translate(0, -.7, 0);
  lowerL.matrix.scale(0.3, .5, .15);
  lowerL.render();

  //right arm
  var rightarm = new Cube();
  rightarm.color = brown;
  rightarm.matrix = new Matrix4(bodyCoords);
  rightarm.matrix.translate(0, -.4, .1);
  rightarm.matrix.translate(0, .4, 0);
  rightarm.matrix.rotate(-g_yellowAngle, 1, 0, 0);
  var rightArmCoords = new Matrix4(rightarm.matrix);
  rightarm.matrix.translate(0, -.4, 0);
  rightarm.matrix.scale(0.3, .5, .15);
  rightarm.render();

  var rightR  = new Cube();
  rightR.color = brown;
  rightR.matrix = new Matrix4(rightArmCoords);
  rightR.matrix.translate(0, -.8, 0);
  rightR.matrix.translate(0, .7, 0);
  rightR.matrix.rotate(-g_magentaAngle,1,0,0);
  rightR.matrix.translate(0, -.7, 0);
  rightR.matrix.scale(0.3, .5, .15);
  rightR.render();

  //left leg
  var leftleg = new Cube();
  leftleg.color = brown;
  leftleg.matrix = new Matrix4(bodyCoords);
  leftleg.matrix.translate(0.7, -.4, .75);
  leftleg.matrix.translate(0, .4, 0);
  leftleg.matrix.rotate(-g_yellowAngle, 1, 0, 0);
  var leftLegCoords = new Matrix4(leftleg.matrix);
  leftleg.matrix.translate(0, -.4, 0);
  leftleg.matrix.scale(0.3, .5, .15);
  leftleg.render();

  var legL = new Cube();
  legL.color = brown;
  legL.matrix = new Matrix4(leftLegCoords);
  legL.matrix.translate(0, -.8, 0);
  legL.matrix.translate(0, .7, 0);
  legL.matrix.rotate(-g_magentaAngle,1,0,0);
  legL.matrix.translate(0, -.7, 0);
  legL.matrix.scale(0.3, .5, .15);
  legL.render();

  //right leg
  var rightleg = new Cube();
  rightleg.color = brown;
  rightleg.matrix = new Matrix4(bodyCoords);
  rightleg.matrix.translate(0, -.4, .75);
  rightleg.matrix.translate(0, .4, 0);
  rightleg.matrix.rotate(g_yellowAngle, 1, 0, 0);
  var rightLegCoords = new Matrix4(rightleg.matrix);
  rightleg.matrix.translate(0, -.4, 0);
  rightleg.matrix.scale(0.3, .5, .15);
  rightleg.render();

  var legR = new Cube();
  legR.color = brown;
  legR.matrix = new Matrix4(rightLegCoords);
  legR.matrix.translate(0, -.8, 0);
  legR.matrix.translate(0, .7, 0);
  legR.matrix.rotate(g_magentaAngle,1,0,0);
  legR.matrix.translate(0, -.7, 0);
  legR.matrix.scale(0.3, .5, .15);
  legR.render();
  

}

function buildGround(){
  var sky = new Cube();
  sky.color = [0.53, 0.81, 0.92, 1.0];
  sky.textureNum = 1;
  sky.matrix.translate(0, .75, 0);
  sky.matrix.scale(50,50,50);
  sky.matrix.translate(-.5,-0.5,-.5);
  sky.render();

  var floor = new Cube();
  floor.color = [0.53, 0.81, 0.92, 1.0];
  floor.matrix.translate(-5,-.5,-5);
  floor.matrix.scale(11,0,11);
  floor.textureNum = 0;
  floor.render();
}

function buildGator(){
  var pink = [1.0, .75, .8, 1.0];
  var brown = [.59, .29, 0, 1.0];
  var black = [0,0,0,1];
  var white = [1,1,1,1];
  var green = [0.0,0.4,0.1,1];
  var lg = [0.0, 0.45, 0.1, 1];

//making the crocodile

  //body
  var body = new Cube();
  body.color = green;
  body.matrix.rotate(-90, 0, 1, 0);
  body.matrix.scale(.5,.4,1.5); //initial body proportions
  body.matrix.scale(0.6,0.6,0.6); //scale the entire body down, I should keep this as is. 
  body.matrix.translate(-.5,-1,-.25);
  var bodyCoords = new Matrix4(body.matrix);
  body.render();
  var legAttach = new Matrix4();

  var leftSeg = new Cube();
  leftSeg.color = green;
  leftSeg.matrix = new Matrix4(bodyCoords);
  leftSeg.matrix.scale(.75, .75, .75);
  leftSeg.matrix.translate(.55, .0, 0.2);
  leftSeg.render();

  var rightSeg = new Cube();
  rightSeg.color = green;
  rightSeg.matrix = new Matrix4(bodyCoords);
  rightSeg.matrix.scale(.75, .75, .75);
  rightSeg.matrix.translate(-.2, .0, 0.2);
  rightSeg.render();


  //tail
  var tail = new Cube();
  tail.color = green;
  tail.matrix = new Matrix4();
  tail.matrix.rotate(-90, 0, 1, 0);
  tail.matrix.translate(0,-.1,.5);
  //going to do animations here too, just finishing the body
  tail.matrix.rotate(10 + g_tailAngle,1,0,0);
  tail.matrix.translate(-.125,-0.1,.85);
  tail.matrix.scale(.25, .15, -0.8);
  tail.render();

  //head
  var neck = new Cube();
  neck.color = lg;
  neck.matrix = new Matrix4(bodyCoords);
  neck.matrix.translate(0.115,.15,-.1);
  neck.matrix.scale(.8, .8, .25);
  var headCoords = new Matrix4(neck.matrix);
  neck.render();


  // head — bigger and centered on neck
  var head = new Cube();
  head.color = lg;
  head.matrix = new Matrix4(headCoords);
  head.matrix.translate(0.05, 0, -.5);   // move forward in Z
  head.matrix.scale(.9, .9, 2);          // keep same scale as neck
  head.render();

  // snout — extends forward from head
  var face = new Cube();
  face.color = green;
  face.matrix = new Matrix4(headCoords);
  face.matrix.translate(0.1, .1, -1.2); // further forward
  face.matrix.scale(.8, .7, .8);       // slightly smaller than head
  face.render();

  // nose tip
  var nose = new Cube();
  nose.color = lg;
  nose.matrix = new Matrix4(headCoords);
  nose.matrix.translate(0.05, 0.5, -1.5);
  nose.matrix.scale(0.9, .4, .4);
  nose.render();

  var leftEye = new Cylinder();
  leftEye.color = black;
  leftEye.matrix = new Matrix4(headCoords);
  leftEye.matrix.translate(.7, .9, -.2);
  leftEye.matrix.scale(.5, .5, .5);
  leftEye.matrix.scale(.25, .3, .35);
  leftEye.matrix.rotate(0, 1, 0, 1);
  leftEye.render();

  var rightEye = new Cylinder();
  rightEye.color = black;
  rightEye.matrix = new Matrix4(headCoords);
  rightEye.matrix.translate(.3, .9, -.2);
  rightEye.matrix.scale(.5, .5, .5);
  rightEye.matrix.scale(.25, .3, .35);
  rightEye.matrix.rotate(0, 1, 0, 1);
  rightEye.render();


  var horn2 = new Cube();
  horn2.color = white;
  horn2.matrix = new Matrix4(headCoords);
  horn2.matrix.translate(0.6, 0.3, -1.25);
  horn2.matrix.scale(0.15, 0.5, .1);
  horn2.matrix.rotate(0,0,0,1);
  horn2.render();

  var leftNostril = new Cylinder();
  leftNostril.color = black;
  leftNostril.matrix = new Matrix4(headCoords);
  leftNostril.matrix.translate(.65, .65, -1.55);
  leftNostril.matrix.scale(.07, .13, .1);
  leftNostril.matrix.rotate(90, 90, 0, 1);
  leftNostril.render();

  var rightNostril = new Cylinder();
  rightNostril.color = black;
  rightNostril.matrix = new Matrix4(headCoords);
  rightNostril.matrix.translate(.4, .65, -1.55);
  rightNostril.matrix.scale(.07, .13, .1);
  rightNostril.matrix.rotate(90, 90, 0, 1);
  rightNostril.render();

  // left front arm
  var leftarm = new Cube();
  leftarm.color = green;
  leftarm.matrix = new Matrix4();          // start fresh
  leftarm.matrix.rotate(-90, 0, 1, 0);
  leftarm.matrix.translate(0.22, -.175, .05); // position in world space
  leftarm.matrix.rotate(g_yellowAngle, 1, 0, 0); //pivot point
  var leftArmCoords = new Matrix4(leftarm.matrix);
  leftarm.matrix.translate(-.05, -.1, -.08);
  leftarm.matrix.scale(0.09, .18, .15);
  leftarm.render();

  var lowerL = new Cube();
  lowerL.color = green;
  lowerL.matrix = new Matrix4(leftArmCoords);
  lowerL.matrix.translate(0, -.0, 0);
  lowerL.matrix.rotate(g_magentaAngle, 1, 0, 0);
  lowerL.matrix.translate(-.05, -.15, -.15);
  lowerL.matrix.scale(0.09, .05, .15);
  lowerL.render();

  // right front arm
  var rightarm = new Cube();
  rightarm.color = green;
  rightarm.matrix = new Matrix4();
  rightarm.matrix.rotate(-90, 0, 1, 0);
  rightarm.matrix.translate(-0.2, -.175, .08); //worldspace
  rightarm.matrix.rotate(-g_yellowAngle, 1, 0, 0);
  var rightArmCoords = new Matrix4(rightarm.matrix);
  rightarm.matrix.translate(-.05, -.1, -.1);
  rightarm.matrix.scale(0.09, .18, .15);
  rightarm.render();

  var rightR = new Cube();
  rightR.color = green;
  rightR.matrix = new Matrix4(rightArmCoords);
  rightR.matrix.translate(0, 0, 0);
  rightR.matrix.rotate(-g_magentaAngle, 1, 0, 0);
  rightR.matrix.translate(-.05, -.15, -0.15);
  rightR.matrix.scale(0.09, .05, .15);
  rightR.render();

  // left back leg
  var leftleg = new Cube();
  leftleg.color = green;
  leftleg.matrix = new Matrix4();
  leftleg.matrix.rotate(-90, 0, 1, 0);
  leftleg.matrix.translate(0,-.1,0);
  leftleg.matrix.translate(0.22, .05, .4); //worldspace
  leftleg.matrix.rotate(-g_yellowAngle, 1, 0, 0);
  var leftLegCoords = new Matrix4(leftleg.matrix);
  leftleg.matrix.translate(-.05, -.25, -.04);
  leftleg.matrix.scale(0.09, .18, .2);
  leftleg.render();

  var legL = new Cube();
  legL.color = green;
  legL.matrix = new Matrix4(leftLegCoords);
  legL.matrix.translate(0, -0.05, -0.05);
  legL.matrix.rotate(-g_magentaAngle, 1, 0, 0);
  legL.matrix.translate(-.05, -.25, -.04);
  legL.matrix.scale(0.09, .05, .15);
  legL.render();

  // right back leg
  var rightleg = new Cube();
  rightleg.color = green;
  rightleg.matrix = new Matrix4();
  rightleg.matrix.rotate(-90, 0, 1, 0);
  rightleg.matrix.translate(0,-.1,0);
  rightleg.matrix.translate(-0.2, .05, .4);
  rightleg.matrix.rotate(g_yellowAngle, 1, 0, 0);
  var rightLegCoords = new Matrix4(rightleg.matrix);
  rightleg.matrix.translate(-.05, -.25, -.04);
  rightleg.matrix.scale(0.09, .18, .2);
  rightleg.render();

  var legR = new Cube();
  legR.color = green;
  legR.matrix = new Matrix4(rightLegCoords);
  legR.matrix.translate(0, -.05, -.05);
  legR.matrix.rotate(g_magentaAngle, 1, 0, 0);
  legR.matrix.translate(-.05, -.25, -.04);
  legR.matrix.scale(0.09, .05, .15);
  legR.render();

  //arms and legs are going to be loosely identical
  //left arm (including hands)
  
}
//if you want to change the texture, just do object.textureNum
function renderScene(){
  buildGround();
  buildCow();
  buildGator();
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
function tick(){
  g_seconds = performance.now()/1000-g_startTime;
  //console.log(g_seconds);
  handlekeys();
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}