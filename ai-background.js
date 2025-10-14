class AIBackground {
    constructor() {
        this.canvas = document.getElementById('webgl-canvas');
        this.gl = this.canvas.getContext('webgl');
        this.nodes = [];
        this.connections = [];
        this.particles = [];
        this.time = 0;
        
        this.init();
        this.createNodes();
        this.createConnections();
        this.createParticles();
        this.animate();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        if (!this.gl) {
            console.warn('WebGL not supported, falling back to canvas');
            this.fallbackToCanvas();
            return;
        }

        // Vertex shader
        const vertexShaderSource = `
            attribute vec2 a_position;
            attribute float a_size;
            attribute vec3 a_color;
            uniform vec2 u_resolution;
            uniform float u_time;
            varying vec3 v_color;
            varying float v_alpha;
            
            void main() {
                vec2 position = a_position;
                position.x += sin(u_time * 0.001 + a_position.y * 0.01) * 20.0;
                position.y += cos(u_time * 0.0015 + a_position.x * 0.01) * 15.0;
                
                vec2 clipSpace = ((position / u_resolution) * 2.0) - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                gl_PointSize = a_size;
                v_color = a_color;
                v_alpha = 0.6 + sin(u_time * 0.002 + a_position.x * 0.01) * 0.4;
            }
        `;

        // Fragment shader
        const fragmentShaderSource = `
            precision mediump float;
            varying vec3 v_color;
            varying float v_alpha;
            
            void main() {
                float dist = distance(gl_PointCoord, vec2(0.5));
                if (dist > 0.5) discard;
                float alpha = (1.0 - dist * 2.0) * v_alpha;
                gl_FragColor = vec4(v_color, alpha);
            }
        `;

        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        this.setupBuffers();
    }

    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }

    setupBuffers() {
        this.positionBuffer = this.gl.createBuffer();
        this.sizeBuffer = this.gl.createBuffer();
        this.colorBuffer = this.gl.createBuffer();
        
        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.sizeLocation = this.gl.getAttribLocation(this.program, 'a_size');
        this.colorLocation = this.gl.getAttribLocation(this.program, 'a_color');
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.timeLocation = this.gl.getUniformLocation(this.program, 'u_time');
    }

    createNodes() {
        const nodeCount = 80;
        for (let i = 0; i < nodeCount; i++) {
            const nodeType = Math.random();
            let color, size;
            
            if (nodeType < 0.4) {
                // Primary AI nodes (green)
                color = [0, 1, 0.5 + Math.random() * 0.5];
                size = 4 + Math.random() * 10;
            } else if (nodeType < 0.7) {
                // Data nodes (cyan)
                color = [0, 0.8 + Math.random() * 0.2, 1];
                size = 2 + Math.random() * 6;
            } else if (nodeType < 0.9) {
                // Processing nodes (magenta)
                color = [1, 0, 0.5 + Math.random() * 0.5];
                size = 3 + Math.random() * 8;
            } else {
                // Neural nodes (purple)
                color = [0.5 + Math.random() * 0.5, 0, 1];
                size = 5 + Math.random() * 12;
            }
            
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: size,
                color: color,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.03
            });
        }
    }

    createConnections() {
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.connections.push({
                        from: i,
                        to: j,
                        strength: 1 - (distance / 150)
                    });
                }
            }
        }
    }

    createParticles() {
        const particleCount = 150;
        for (let i = 0; i < particleCount; i++) {
            const particleType = Math.random();
            let color, speed;
            
            if (particleType < 0.5) {
                // Data particles (green spectrum)
                color = [0, 0.8 + Math.random() * 0.2, 0.6 + Math.random() * 0.4];
                speed = 1 + Math.random() * 2;
            } else if (particleType < 0.8) {
                // Signal particles (cyan spectrum)
                color = [0, 0.9 + Math.random() * 0.1, 1];
                speed = 0.5 + Math.random() * 1.5;
            } else {
                // Energy particles (magenta spectrum)
                color = [1, 0, 0.7 + Math.random() * 0.3];
                speed = 1.5 + Math.random() * 2.5;
            }
            
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 0.5 + Math.random() * 2.5,
                color: color,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                life: Math.random(),
                trail: [],
                maxTrailLength: 5 + Math.random() * 10
            });
        }
    }

    updateNodes() {
        this.nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            
            // Update pulse for dynamic sizing
            node.pulse += node.pulseSpeed;
            node.currentSize = node.size + Math.sin(node.pulse) * 2;
            
            // Boundary collision with slight randomization
            if (node.x < 0 || node.x > this.canvas.width) {
                node.vx *= -0.8 - Math.random() * 0.2;
                node.vx += (Math.random() - 0.5) * 0.1;
            }
            if (node.y < 0 || node.y > this.canvas.height) {
                node.vy *= -0.8 - Math.random() * 0.2;
                node.vy += (Math.random() - 0.5) * 0.1;
            }
            
            node.x = Math.max(0, Math.min(this.canvas.width, node.x));
            node.y = Math.max(0, Math.min(this.canvas.height, node.y));
        });
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Store previous position for trail
            particle.trail.push({ x: particle.x, y: particle.y, alpha: 1 - particle.life });
            if (particle.trail.length > particle.maxTrailLength) {
                particle.trail.shift();
            }
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life += 0.008;
            
            // Add slight gravitational pull towards center
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const dx = centerX - particle.x;
            const dy = centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                particle.vx += (dx / distance) * 0.001;
                particle.vy += (dy / distance) * 0.001;
            }
            
            if (particle.x < 0 || particle.x > this.canvas.width || 
                particle.y < 0 || particle.y > this.canvas.height || 
                particle.life > 1) {
                particle.x = Math.random() * this.canvas.width;
                particle.y = Math.random() * this.canvas.height;
                particle.life = 0;
                particle.trail = [];
                particle.vx = (Math.random() - 0.5) * 2;
                particle.vy = (Math.random() - 0.5) * 2;
            }
        });
    }

    render() {
        if (!this.gl || !this.program) return;

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0, 0, 0, 0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.timeLocation, this.time);

        // Render connections
        this.renderConnections();
        
        // Render nodes
        const allPoints = [...this.nodes, ...this.particles];
        const positions = [];
        const sizes = [];
        const colors = [];
        
        allPoints.forEach(point => {
            positions.push(point.x, point.y);
            sizes.push(point.size);
            colors.push(...point.color);
        });
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.sizeBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(sizes), this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(this.sizeLocation);
        this.gl.vertexAttribPointer(this.sizeLocation, 1, this.gl.FLOAT, false, 0, 0);
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.DYNAMIC_DRAW);
        this.gl.enableVertexAttribArray(this.colorLocation);
        this.gl.vertexAttribPointer(this.colorLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.drawArrays(this.gl.POINTS, 0, allPoints.length);
    }

    renderConnections() {
        // Simple line rendering for connections
        const lineProgram = this.createLineProgram();
        if (!lineProgram) return;
        
        this.gl.useProgram(lineProgram);
        
        const linePositions = [];
        const lineColors = [];
        
        this.connections.forEach(conn => {
            const from = this.nodes[conn.from];
            const to = this.nodes[conn.to];
            
            linePositions.push(from.x, from.y, to.x, to.y);
            const alpha = conn.strength * 0.3;
            lineColors.push(0, 1, 0.5, alpha, 0, 1, 0.5, alpha);
        });
        
        if (linePositions.length > 0) {
            const lineBuffer = this.gl.createBuffer();
            const lineColorBuffer = this.gl.createBuffer();
            
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, lineBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(linePositions), this.gl.DYNAMIC_DRAW);
            
            const linePositionLocation = this.gl.getAttribLocation(lineProgram, 'a_position');
            this.gl.enableVertexAttribArray(linePositionLocation);
            this.gl.vertexAttribPointer(linePositionLocation, 2, this.gl.FLOAT, false, 0, 0);
            
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, lineColorBuffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(lineColors), this.gl.DYNAMIC_DRAW);
            
            const lineColorLocation = this.gl.getAttribLocation(lineProgram, 'a_color');
            this.gl.enableVertexAttribArray(lineColorLocation);
            this.gl.vertexAttribPointer(lineColorLocation, 4, this.gl.FLOAT, false, 0, 0);
            
            this.gl.uniform2f(this.gl.getUniformLocation(lineProgram, 'u_resolution'), this.canvas.width, this.canvas.height);
            
            this.gl.drawArrays(this.gl.LINES, 0, linePositions.length / 2);
        }
    }

    createLineProgram() {
        const vertexShader = `
            attribute vec2 a_position;
            attribute vec4 a_color;
            uniform vec2 u_resolution;
            varying vec4 v_color;
            
            void main() {
                vec2 clipSpace = ((a_position / u_resolution) * 2.0) - 1.0;
                gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
                v_color = a_color;
            }
        `;
        
        const fragmentShader = `
            precision mediump float;
            varying vec4 v_color;
            
            void main() {
                gl_FragColor = v_color;
            }
        `;
        
        return this.createProgram(vertexShader, fragmentShader);
    }

    fallbackToCanvas() {
        const ctx = this.canvas.getContext('2d');
        
        const animate = () => {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw connections
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.2)';
            ctx.lineWidth = 1;
            this.connections.forEach(conn => {
                const from = this.nodes[conn.from];
                const to = this.nodes[conn.to];
                ctx.globalAlpha = conn.strength * 0.3;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            });
            
            // Draw nodes
            this.nodes.forEach(node => {
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = `rgb(0, ${Math.floor(node.color[1] * 255)}, ${Math.floor(node.color[2] * 255)})`;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw particles
            this.particles.forEach(particle => {
                ctx.globalAlpha = 1 - particle.life;
                ctx.fillStyle = `rgb(0, ${Math.floor(particle.color[1] * 255)}, ${Math.floor(particle.color[2] * 255)})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            this.updateNodes();
            this.updateParticles();
            this.time += 16;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    animate() {
        this.updateNodes();
        this.updateParticles();
        this.render();
        this.time += 16;
        
        requestAnimationFrame(() => this.animate());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIBackground();
});