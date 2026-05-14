
class Triangle{
  constructor(){
    this.type = 'triangle';
    this.position = [0.0,0.0,0.0];
    this.color = [1.0,1.0,1.0,1.0];
    this.size = 5.0;
    this.vertDist = 1;
    this.height = 1;
  }

  render(){
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    //var xy = g_points[i];
    //var rgba = g_colors[i];
    //var size = g_sizes[i];

    // Pass the position of a point to a_Position variable
    //gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass the size of the point to u_Size variable
    gl.uniform1f(u_Size, size);
    // Draw
    //gl.drawArrays(gl.TRIANGLES, 0, 1);
    var d = this.size/200.0;
    var spread = this.vertDist / 500.0;
    var height = this.height / 500.0;
    drawTriangle( [xy[-1], xy[1], 
                   xy[-1], xy[-1], 
                   xy[1], xy[-1]]);
  }
}

function drawTriangle(vertices){
    var n = 3; //standard number of vertices

    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function drawTriangle3D(vertices){
    //creates a buffer of positions that feeds so we can draw the triangle
    var n = 3; //standard number of vertices

    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function drawTriangle3DUV(vertices, uv){
    var n = 3;
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('failed to create buffer object');
        return -1;
    }

    //bind the buffer object to the target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //write the date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    //assign the buffer object into a_position
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    //enable the assignment to the a_position var
    gl.enableVertexAttribArray(a_Position);


    var uvBuffer = gl.createBuffer();
    if(!uvBuffer){
        console.log('failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.DYNAMIC_DRAW);

    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_UV);


    gl.drawArrays(gl.TRIANGLES, 0, n);

}