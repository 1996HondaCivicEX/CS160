// DrawRectangle.js
function main() {
    var canvas = document.getElementById('example');
    if(!canvas){
        console.log('failed to retrieve the <canvas> element');
        return false;
    }

    var v1 = new Vector3([2.25, 2.25, 0]);

    var ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, 400, 400);

    drawVector(v1, "red");
}

//function drawVector that takes in a Vector 3 "v" and a string "color"
/*This draws a single line going in a direction that I CHOOSE, likely as
    some sort of debug tool for whatever vector I feed into this function and others

    Regarding the console.log statements, I needed to check their values.
*/
function drawVector(v, color){
    console.log(v);

    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.strokeStyle = color;

    let vx = v.elements[0] * 20;
    console.log(vx);
    let vy = v.elements[1] * 20;
    console.log(vy);
    
    let cx = canvas.width/2;
    let cy = canvas.height/2;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(vx + cx, cy - vy);
    ctx.stroke();
}

//handle draw event prints out the result of two vectors given input
function handleDrawEvent(){
    let x1 = document.getElementById('x1').value;
    let y1 = document.getElementById('y1').value;

    let x2 = document.getElementById('x2').value;
    let y2 = document.getElementById('y2').value;


    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, 400, 400);

    var v1 = new Vector3([x1, y1, 0]);
    var v2 = new Vector3([x2, y2, 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");
}

//handledrawoperationevent functions like the previous function, with an operators slidedown
function handleDrawOperationEvent(){
    let x1 = Number(document.getElementById('x1').value);
    let y1 = Number(document.getElementById('y1').value);

    let x2 = Number(document.getElementById('x2').value);
    let y2 = Number(document.getElementById('y2').value);

    let scale = Number(document.getElementById('scalar').value);
    

    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
    ctx.fillRect(0, 0, 400, 400);

    var v1 = new Vector3([x1, y1, 0]);
    var v2 = new Vector3([x2, y2, 0]);

    drawVector(v1, "red");
    drawVector(v2, "blue");

    let op = document.getElementById('operations').value;
    console.log(op);

    //---------------------------------------------------------------------------
    var v3;
    var v4;
   
    scale = Number(scale);
    console.log(typeof(scale));

    if(op == 'add'){
        v3 = new Vector3([0,0,0]);
        v3.set(v1);
        v3.add(v2);
        drawVector(v3, "green");
    }
    if(op == 'sub'){
        v3 = new Vector3([0,0,0]);
        v3.set(v1);
        v3.sub(v2);
        drawVector(v3, "green");
    }
    if(op == 'mul'){
        v3 = new Vector3([0,0,0]);
        v3.set(v1);
        v3.mul(scale);
        v4 = new Vector3([0,0,0]);
        v4.set(v2);
        v4.mul(scale);

        drawVector(v3, "green");
        drawVector(v4, "green");
    }
    if(op == 'div'){
        v3 = new Vector3([0,0,0]);
        v3.set(v1);
        v3.div(scale);
        v4 = new Vector3([0,0,0]);
        v4.set(v2);
        v4.div(scale);

        drawVector(v3, "green");
        drawVector(v4, "green");
    }
    if(op == 'mag'){
        v3 = new Vector3([0,0,0]);
        v3.set(v1);
        console.log("Magnitude v1: " + v3.magnitude());
        v4 = new Vector3([0,0,0]);
        v4.set(v2);
        console.log("Magnitude v2: " + v4.magnitude());
    }
    if(op == 'nor'){
        v3 = new Vector3([0,0,0]);
        v3.set(v1);
        console.log(v3.normalize());
        v4 = new Vector3([0,0,0]);
        v4.set(v2);
        console.log(v4.normalize());

        drawVector(v3, "green");
        drawVector(v4, "green");
    }
    if(op == 'dot'){
        angleBetween(v1, v2);
    }
    if(op == 'area'){
        areaTriangle(v1, v2);
    }
    
}

function angleBetween(v1, v2){
    let dot = Vector3.dot(v1, v2);
    let m1 = v1.magnitude();
    let m2 = v2.magnitude();
    
    let cosAlpha = dot/(m1 * m2);
    let angle = Math.acos(cosAlpha) * (180 / Math.PI);
    console.log("Angle: " + angle);
}

function areaTriangle(v1, v2){
    let crossP = Vector3.cross(v1, v2);
    let area = crossP.magnitude() / 2;

    console.log("Area of the triangle: " +  area);
}





