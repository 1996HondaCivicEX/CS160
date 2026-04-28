class Cylinder {
    constructor() {
        this.type = 'cylinder';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.segments = 8; // Number of sides
        this.vertexBuffer = null;
        this.numVertices = 0;
        this.isGenerated = false;
    }

    generateCylinder() {
        let vertices = [];
        let n = this.segments;

        // Generate cylinder along Y axis (0 to 1)
        for (let i = 0; i < n; i++) {
            let angle1 = (i * 2 * Math.PI) / n;
            let angle2 = ((i + 1) * 2 * Math.PI) / n;

            let x1 = Math.cos(angle1);
            let z1 = Math.sin(angle1);
            let x2 = Math.cos(angle2);
            let z2 = Math.sin(angle2);

            // Side face (two triangles per segment)
            // Bottom triangle
            vertices.push(x1, 0, z1);
            vertices.push(x2, 0, z2);
            vertices.push(x1, 1, z1);

            // Top triangle
            vertices.push(x2, 0, z2);
            vertices.push(x2, 1, z2);
            vertices.push(x1, 1, z1);

            // Bottom cap
            vertices.push(0, 0, 0);
            vertices.push(x2, 0, z2);
            vertices.push(x1, 0, z1);

            // Top cap
            vertices.push(0, 1, 0);
            vertices.push(x1, 1, z1);
            vertices.push(x2, 1, z2);
        }

        this.numVertices = vertices.length / 3;

        // Create buffer
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        this.isGenerated = true;
    }

    render() {
        
        if (!this.isGenerated) {
            this.generateCylinder();
        }

        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Bind buffer and draw
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }
}
