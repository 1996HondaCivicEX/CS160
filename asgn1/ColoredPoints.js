// ColoredPoint.js (c) 2012 matsuda


// Vertex shader program
//come here to change the brush size
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
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

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}


//ui globals

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2


let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedSegment = 10;
let g_selectedVertDist = 1;
let g_selectedHeight = 1;
let g_selectedType = POINT;
let g_previewPos = null;



function addUIelements(){
  document.getElementById('green').onclick = function() {g_selectedColor = [0.0,1.0,0.0,1.0]};
  document.getElementById('red').onclick = function() {g_selectedColor = [1.0,0.0,0.0,1.0]};
  document.getElementById('clear').onclick = function() {g_shapesList = []; renderAllShapes();};
  document.getElementById('undo').onclick = function() {g_shapesList.pop(); renderAllShapes();};
  document.getElementById('fox').onclick = function() {drawFox();};

  document.getElementById('point').onclick = function() {g_selectedType = POINT};
  document.getElementById('triangle').onclick = function() {g_selectedType = TRIANGLE};
  document.getElementById('circle').onclick = function() {g_selectedType = CIRCLE};

  document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100});
  document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100});
  document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100});

  document.getElementById('segSlide').addEventListener('mouseup', function() {g_selectedSegment = this.value});

  document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value});
  document.getElementById('triSlide').addEventListener('mouseup', function() {g_selectedVertDist = this.value});
  document.getElementById('heightSlide').addEventListener('mouseup', function() {g_selectedHeight = this.value});


}

function main() {
  // Retrieve <canvas> element
  
  setupWebGL();
  connectVariablesToGLSL();

  addUIelements();
  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) 
  { 
    if(ev.buttons == 1) {
      click(ev)
    }else{
      g_previewPos = convertCoordinateEventToGL(ev);
      renderAllShapes();
    }
  };

  canvas.onmouseleave = function(){
    g_previewPos = null;
    renderAllShapes();
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];


//var g_points = [];  // The array for the position of a mouse press
//var g_colors = [];  // The array to store the color of a point
//var g_sizes = [];

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

function drawFox() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // ORANGE COLOR
  gl.uniform4f(u_FragColor, 1.0, 0.5, 0.0, 1.0);

  // BODY
  drawTriangle([
    -0.2, -0.6,
     0.2, -0.6,
     0.0,  0.2
  ]);

  // HEAD
  drawTriangle([
    -0.15, 0.2,
     0.15, 0.2,
     0.0,  0.45
  ]);

  // LEFT EAR
  drawTriangle([
    -0.125, 0.25,
    -0.025, 0.4,
    -0.125, 0.55
  ]);

  // RIGHT EAR
  drawTriangle([
     0.125, 0.25,
     0.025, 0.4,
     0.125, 0.55
  ]);

  // TAIL (ORANGE PART)
  drawTriangle([
     0.2, -0.3,
     0.5, -0.2,
     0.3,  0.0
  ]);

  drawTriangle([
     0.2, -0.3,
     0.3,  0.0,
     0.1, -0.2
  ]);

  // LEGS
  drawTriangle([
    -0.1, -0.6,
    -0.05, -0.8,
     0.0, -0.6
  ]);

  drawTriangle([
     0.1, -0.6,
     0.05, -0.8,
     0.0, -0.6
  ]);

  // SWITCH TO WHITE
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);

  // FACE WHITE
  drawTriangle([
    -0.1, 0.2,
     0.1, 0.2,
     0.0, 0.05
  ]);

  // BELLY
  drawTriangle([
    -0.1, -0.2,
     0.1, -0.2,
     0.0, -0.5
  ]);

  // TAIL TIP
  drawTriangle([
     0.5, -0.2,
     0.6, -0.35,
     0.4, -0.35
  ]);

  // FEET
  drawTriangle([
    -0.05, -0.8,
    -0.1, -0.85,
     0.0, -0.85
  ]);

  drawTriangle([
     0.05, -0.8,
     0.0, -0.85,
     0.1, -0.85
  ]);

  // EYES (BLACK)
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);

  drawTriangle([
    -0.05, 0.3,
    -0.02, 0.3,
    -0.035, 0.27
  ]);

  drawTriangle([
     0.05, 0.3,
     0.02, 0.3,
     0.035, 0.27
  ]);
}

function renderAllShapes(){

  var startTime = performance.now();

  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {

    g_shapesList[i].render();

  }

  if(g_previewPos && g_selectedType == TRIANGLE){
        drawPreviewTriangle(g_previewPos);
  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + "ms: " + Math.floor(duration) + "fps: " + Math.floor(10000/duration), "numdot");
}

function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}