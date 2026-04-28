// ColoredPoint.js (c) 2012 matsuda


// Vertex shader program
//come here to change the brush size
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'uniform mat4 u_ModelMatrix;' + 
  'uniform mat4 u_GlobalRotateMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  //'  gl_PointSize = 10.0;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';


//global vars


let canvas;
let gl;
let a_position;
let u_FragColor;
let u_Size;

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

function main() {
  // Retrieve <canvas> element
  
  setupWebGL();
  connectVariablesToGLSL();

  addUIelements();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) {click(ev)}};

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
  
  canvas.onmousemove = function(ev){
    if (ev.buttons & 1 && !ev.shiftKey) {
      var rect = ev.target.getBoundingClientRect();
      var x = ev.clientX - rect.left;
      var y = ev.clientY - rect.top;

      g_mouseYRotation = (((x / canvas.width) * -360) - 180);
      g_mouseXRotation = (((y / canvas.width) * -360) - 180);
    }
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.53, 0.81, 0.92, 1.0);

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

function renderAllShapes(){

  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0,1,0).rotate(g_mouseXRotation, 1, 0, 0).rotate(g_mouseYRotation, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  //drawTriangle3D([-1.0,0.0,0.0,  -0.5,-1.0,0.0,  0.0,0.0,0.0]);

  //passed it off to someone else(different function)
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
    g_tailAngle = (5 * Math.sin(g_seconds));
  }
  //I don't want to coordinate the double joint, but as per assignment, I am keeping this here as a proof of concept.
  if(g_magentaAnimation){
    g_magentaAngle = (5 * Math.sin(g_seconds * 3));
  }
  if(g_leftHandAnimation){
    g_leftHandAngle = (45 * Math.sin(g_seconds * 3));
  }
  
}
function renderScene(){

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
  body.matrix.scale(.5,.4,1.5); //initial body proportions
  body.matrix.scale(0.6,0.6,0.6); //scale the entire body down, I should keep this as is. 
  body.matrix.translate(-.5,-.5,-.25);
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
  var tail = new Cylinder();
  tail.color = green;
  tail.matrix = new Matrix4();
  tail.matrix.translate(0,-0,.5);
  //going to do animations here too, just finishing the body
  tail.matrix.rotate(10 + g_tailAngle,1,0,0);
  tail.matrix.translate(0,-0.1,.85);
  tail.matrix.scale(.1, .25, -0.8);
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
  leftarm.matrix.translate(0.22, -.1, .05); // position in world space
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
  rightarm.matrix.translate(-0.2, -.1, .08); //worldspace
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

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0-g_startTime;
function tick(){
  g_seconds = performance.now()/1000-g_startTime;
  console.log(g_seconds);
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}