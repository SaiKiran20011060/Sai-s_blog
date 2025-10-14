class CloudWebGL {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'cloud-webgl';
        this.canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
        document.body.appendChild(this.canvas);
        
        this.gl = this.canvas.getContext('webgl');
        this.clouds = [];
        this.time = 0;
        
        this.init();
        this.createClouds();
        this.animate();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        if (!this.gl) {
            this.fallbackToCanvas();
            return;
        }

        const vertexShader = `
            attribute vec2 a_position;
            attribute float a_size;
            attribute float a_alpha;
            uniform vec2 u_resolution;
            uniform float u_time;
            varying float v_alpha;
            
            void main() {
                vec2 pos = a_position;
                pos.x += sin(u_time * 0.0005 + a_position.y * 0.001) * 30.0;
                pos.y += cos(u_time * 0.0003 + a_position.x * 0.001) * 20.0;
                
                vec2 clipSpace = ((pos / u_resolution) * 2.0) - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                gl_PointSize = a_size + sin(u_time * 0.001 + a_position.x * 0.01) * 5.0;
                v_alpha = a_alpha * (0.3 + sin(u_time * 0.002) * 0.2);
            }
        `;

        const fragmentShader = `
            precision mediump float;
            varying float v_alpha;
            
            void main() {
                float dist = distance(gl_PointCoord, vec2(0.5));
                if (dist > 0.5) discard;
                float alpha = (1.0 - dist * 2.0) * v_alpha;
                gl_FragColor = vec4(0.8, 0.9, 1.0, alpha * 0.4);
            }
        `;

        this.program = this.createProgram(vertexShader, fragmentShader);
        this.setupBuffers();
    }

    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        return program;
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        return shader;
    }

    setupBuffers() {
        this.positionBuffer = this.gl.createBuffer();
        this.sizeBuffer = this.gl.createBuffer();
        this.alphaBuffer = this.gl.createBuffer();
        
        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.sizeLocation = this.gl.getAttribLocation(this.program, 'a_size');
        this.alphaLocation = this.gl.getAttribLocation(this.program, 'a_alpha');
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.timeLocation = this.gl.getUniformLocation(this.program, 'u_time');
    }

    createClouds() {
        for (let i = 0; i < 60; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 20 + Math.random() * 80,
                alpha: 0.2 + Math.random() * 0.6,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.2
            });
        }
    }

    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.x += cloud.vx;
            cloud.y += cloud.vy;
            
            if (cloud.x < -100) cloud.x = this.canvas.width + 100;
            if (cloud.x > this.canvas.width + 100) cloud.x = -100;
            if (cloud.y < -100) cloud.y = this.canvas.height + 100;
            if (cloud.y > this.canvas.height + 100) cloud.y = -100;
        });
    }

    render() {
        if (!this.gl) return;

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.timeLocation, this.time);

        const positions = [];
        const sizes = [];
        const alphas = [];
        
        this.clouds.forEach(cloud => {
            positions.push(cloud.x, cloud.y);
            sizes.push(cloud.size);
            alphas.push(cloud.alpha);
        });
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(sizes), this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(this.sizeLocation);
        this.gl.vertexAttribPointer(this.sizeLocation, 1, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.alphaBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(alphas), this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(this.alphaLocation);
        this.gl.vertexAttribPointer(this.alphaLocation, 1, this.gl.FLOAT, false, 0, 0);
        
        this.gl.drawArrays(this.gl.POINTS, 0, this.clouds.length);
    }

    fallbackToCanvas() {
        const ctx = this.canvas.getContext('2d');
        
        const animate = () => {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.clouds.forEach(cloud => {
                ctx.globalAlpha = cloud.alpha * 0.4;
                ctx.fillStyle = '#cce7ff';
                ctx.beginPath();
                ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            this.updateClouds();
            this.time += 16;
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    animate() {
        this.updateClouds();
        this.render();
        this.time += 16;
        requestAnimationFrame(() => this.animate());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CloudWebGL();
});