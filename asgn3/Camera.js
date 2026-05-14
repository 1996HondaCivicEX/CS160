class Camera {
    constructor() {
        this.eye = new Vector(0, 0, 3);
        this.at = new Vector(0, 0, 0); // look at origin, better for your scene
        this.up = new Vector(0, 1, 0);
        this.pitch = 0;
        this.yaw = -90;
    }

    updateAt() {
        let radYaw = this.yaw * Math.PI / 180;
        let radPitch = this.pitch * Math.PI / 180;

        let x = Math.cos(radYaw) * Math.cos(radPitch);
        let y = Math.sin(radPitch);
        let z = Math.sin(radYaw) * Math.cos(radPitch);

        this.at = new Vector(
            this.eye.x + x,
            this.eye.y + y,
            this.eye.z + z
        );
    }

    forward(step = 0.1) {
        // Direction from eye to at
        let f = this.at.subtract(this.eye).normalize().multiply(step);
        this.eye = this.eye.add(f);
        this.at = this.at.add(f);
    }

    back(step = 0.1) {
        let f = this.eye.subtract(this.at).normalize().multiply(step);
        this.eye = this.eye.add(f);
        this.at = this.at.add(f);
    }

    right(step = 0.1) {
        let f = this.at.subtract(this.eye).normalize();
        let s = f.cross(this.up).normalize().multiply(step);
        this.eye = this.eye.add(s);
        this.at = this.at.add(s);
    }

    left(step = 0.1) {
        let f = this.at.subtract(this.eye).normalize();
        let s = this.up.cross(f).normalize().multiply(step); // reversed cross for right
        this.eye = this.eye.add(s);
        this.at = this.at.add(s);
    }

    panLeft(angle) {
        this.yaw -= angle;
        this.yaw = this.yaw % 360;
        this.updateAt();
    }

    panRight(angle) {
        this.yaw += angle;
        this.yaw = this.yaw % 360;
        this.updateAt();
    }

    pitchCamera(angle) {
        this.pitch += angle;

        if (this.pitch > 89) this.pitch = 89;
        if (this.pitch < -89) this.pitch = -89;

        this.updateAt();
    }
}