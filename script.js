// Global variables for animations
let scene, camera, renderer, composer;
let dataParticles, neuralNetwork, floatingLabels = [], lightOrbs = [];
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let currentSection = 'hero';
let clock;
let animationFrameId;
let glowEffectStrength = 0.3;
let isLightTheme = false;

// Initialize everything when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize clock
    clock = new THREE.Clock();
    
    // Check if theme was previously set
    isLightTheme = localStorage.getItem('theme') === 'light';
    if (isLightTheme) {
        document.body.classList.add('light-theme');
        document.getElementById('theme-switch').checked = true;
    }
    
    // Initialize animations, effects, and UI components
    initLoadingSequence();
    initThreeJS();
    initNavigationAndUI();
    initScrollEffects();
    initTypingEffect();
    initSkillRadarChart();
    initGitHubContributionGraph();
    initInteractiveMLDemo();
    initCaseStudyVisualizations();
    initContactForm();
    
    // Update timestamp
    document.querySelector('.last-update').textContent = 
        `Last updated: ${new Date("2025-03-28 16:25:40").toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}`;
});

// Loading sequence with progress counter
function initLoadingSequence() {
    const loadingScreen = document.querySelector('.loading-screen');
    const progressBar = document.querySelector('.progress-bar');
    const loadingText = document.querySelector('.loading-text');
    const progressTexts = [
        "Initializing data pipeline...",
        "Loading neural networks...",
        "Calibrating algorithms...",
        "Preparing visualizations...",
        "Ready to explore data universe!"
    ];
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 5 + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Fade out loading screen
            setTimeout(() => {
                loadingScreen.style.opacity = "0";
                setTimeout(() => {
                    loadingScreen.style.display = "none";
                    
                    // Reveal content with animation
                    document.querySelectorAll('.reveal-on-load').forEach((el, i) => {
                        setTimeout(() => {
                            el.classList.add('revealed');
                        }, i * 200);
                    });
                }, 500);
            }, 500);
        }
        
        // Update progress bar width
        progressBar.style.width = `${progress}%`;
        
        // Update loading text
        const textIndex = Math.min(Math.floor(progress / 20), progressTexts.length - 1);
        loadingText.textContent = progressTexts[textIndex];
    }, 100);
}

// Initialize Three.js scene and effects
function initThreeJS() {
    const canvas = document.getElementById('bg');
    if (!canvas) return;
    
    // Performance optimizations for mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowPerformance = window.navigator.hardwareConcurrency && window.navigator.hardwareConcurrency < 4;
    
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    // Renderer setup with antialiasing and appropriate settings
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobile,
        alpha: true,
        powerPreference: 'high-performance'
    });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    // Add overlay for better contrast
    createCanvasOverlay();
    
    // Add post-processing effects (if not on mobile/low-performance device)
    if (!isMobile && !isLowPerformance) {
        initPostProcessing();
    } else {
        // Simple render pass for low-performance devices
        composer = { render: () => renderer.render(scene, camera) };
        glowEffectStrength = 0.1; // Reduce glow for performance
    }
    
    // Add scene elements with performance considerations
    if (isMobile || isLowPerformance) {
        // Simplified scene for low-performance devices
        addLighting(true);
        addDataVisualization(true);
        addNeuralNetworkVisualization(true);
        addFloatingTechLabels(true);
    } else {
        // Full scene for high-performance devices
        addLighting(false);
        addDataVisualization(false);
        addNeuralNetworkVisualization(false);
        addFloatingTechLabels(false);
    }
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Handle mouse movement for interactive effects
    document.addEventListener('mousemove', onMouseMove);
    
    // Start animation loop
    animate();
}

// Create a semi-transparent overlay for better text visibility
function createCanvasOverlay() {
    const overlay = document.createElement('div');
    overlay.classList.add('canvas-overlay');
    document.querySelector('.canvas-container').appendChild(overlay);
}

// Add post-processing effects for better visuals
function initPostProcessing() {
    composer = new THREE.EffectComposer(renderer);
    
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Bloom effect for glow
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        glowEffectStrength, // Intensity
        0.4, // Radius
        0.85  // Threshold
    );
    composer.addPass(bloomPass);
    
    // FXAA for antialiasing
    const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
    fxaaPass.uniforms.resolution.value.set(
        1 / (window.innerWidth * renderer.getPixelRatio()),
        1 / (window.innerHeight * renderer.getPixelRatio())
    );
    composer.addPass(fxaaPass);
}

// Add dynamic lighting to the scene
function addLighting(simplified) {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(isLightTheme ? 0xcccccc : 0x404040, 0.3);
    scene.add(ambientLight);
    
    // Primary directional light
    const mainLight = new THREE.DirectionalLight(isLightTheme ? 0x2563eb : 0x4046e0, 0.8);
    mainLight.position.set(10, 10, 10);
    scene.add(mainLight);
    
    // Accent light
    const accentLight = new THREE.PointLight(isLightTheme ? 0x0ea5e9 : 0x17d1ac, 1.0, 100);
    accentLight.position.set(-10, -10, -10);
    scene.add(accentLight);
    
    if (!simplified) {
        // Create light orbs for visual interest
        const orbCount = 3;
        const colors = isLightTheme 
            ? [0x2563eb, 0x0ea5e9, 0xec4899]
            : [0x4046e0, 0x17d1ac, 0xff5678];
            
        for (let i = 0; i < orbCount; i++) {
            const lightOrb = new THREE.PointLight(
                colors[i],
                0.5, 
                30
            );
            
            // Position orbs in different locations
            const angle = (i / orbCount) * Math.PI * 2;
            const radius = 20;
            lightOrb.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                -5
            );
            
            scene.add(lightOrb);
            
            // Store for animation
            lightOrb.userData = {
                originalPosition: lightOrb.position.clone(),
                speed: 0.3 + Math.random() * 0.2,
                amplitude: 3 + Math.random(),
                phase: Math.random() * Math.PI * 2
            };
            
            lightOrbs.push(lightOrb);
        }
    }
}

// Create interactive data visualization
function addDataVisualization(simplified) {
    // Create 4 distinct data clusters representing different skill domains
    const clusters = [
        { name: "Machine Learning", color: isLightTheme ? 0x2563eb : 0x4046e0, position: new THREE.Vector3(-10, -8, -10) },
        { name: "Data Analysis", color: isLightTheme ? 0x0ea5e9 : 0x17d1ac, position: new THREE.Vector3(10, -8, -15) },
        { name: "Web Development", color: isLightTheme ? 0xec4899 : 0xff5678, position: new THREE.Vector3(-8, 8, -12) },
        { name: "Cloud & DevOps", color: isLightTheme ? 0xf59e0b : 0xf5a742, position: new THREE.Vector3(8, 8, -18) }
    ];
    
    // Group for all data particles
    dataParticles = new THREE.Group();
    scene.add(dataParticles);
    
    // Create particles for each cluster
    clusters.forEach(cluster => {
        const particleCount = simplified ? 40 : 80; // Reduce count for mobile
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);
        
        // Generate particles around cluster center
        for (let i = 0; i < particleCount; i++) {
            // Position with Gaussian distribution around cluster center
            const spreadFactor = 5;
            const x = cluster.position.x + (Math.random() - 0.5) * spreadFactor;
            const y = cluster.position.y + (Math.random() - 0.5) * spreadFactor;
            const z = cluster.position.z + (Math.random() - 0.5) * spreadFactor;
            
            particlePositions[i * 3] = x;
            particlePositions[i * 3 + 1] = y;
            particlePositions[i * 3 + 2] = z;
            
            // Random sizes for visual interest
            particleSizes[i] = simplified ? 0.1 + Math.random() * 0.1 : 0.1 + Math.random() * 0.2;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
        
        // Determine which shader to use based on device capability
        let particleMaterial;
        
        if (simplified) {
            // Simplified material for low-performance devices
            particleMaterial = new THREE.PointsMaterial({
                color: cluster.color,
                size: 0.15,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
        } else {
            // Custom shader material for better looking particles
            particleMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    color: { value: new THREE.Color(cluster.color) },
                    time: { value: 0 }
                },
                vertexShader: `
                    attribute float size;
                    uniform float time;
                    varying float vAlpha;
                    
                    void main() {
                        vec3 pos = position;
                        // Add subtle movement
                        pos.x += sin(time * 0.5 + position.z) * 0.1;
                        pos.y += cos(time * 0.5 + position.x) * 0.1;
                        pos.z += sin(time * 0.3 + position.y) * 0.1;
                        
                        // Calculate distance from center for alpha
                        float dist = length(pos - vec3(${cluster.position.x}, ${cluster.position.y}, ${cluster.position.z}));
                        vAlpha = 1.0 - min(1.0, dist / 8.0);
                        
                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        gl_PointSize = size * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform vec3 color;
                    varying float vAlpha;
                    
                    void main() {
                        // Circle shape with soft edge
                        float r = distance(gl_PointCoord, vec2(0.5));
                        if (r > 0.5) discard;
                        
                        // Add glow effect
                        float alpha = vAlpha * (1.0 - pow(r * 2.0, 2.0));
                        gl_FragColor = vec4(color, alpha * 0.7);
                    }
                `,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
        }
        
        // Create and add particle system
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        particles.userData = { 
            clusterName: cluster.name,
            originalPositions: [...particlePositions],
            phase: Math.random() * Math.PI * 2
        };
        dataParticles.add(particles);
        
        // Add cluster label if not simplified
        if (!simplified) {
            const labelSprite = createTextSprite(cluster.name, cluster.color);
            labelSprite.position.set(
                cluster.position.x,
                cluster.position.y + 2.5,
                cluster.position.z
            );
            dataParticles.add(labelSprite);
        }
    });
    
    // Create connections between clusters if not simplified
    if (!simplified) {
        clusters.forEach((cluster, i) => {
            for (let j = i + 1; j < clusters.length; j++) {
                const targetCluster = clusters[j];
                
                // Create line geometry
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    cluster.position,
                    targetCluster.position
                ]);
                
                // Glowing line material
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: isLightTheme ? 0x2563eb : 0xffffff,
                    transparent: true,
                    opacity: 0.15,
                    blending: THREE.AdditiveBlending
                });
                
                const line = new THREE.Line(lineGeometry, lineMaterial);
                line.userData = {
                    startPoint: cluster.position.clone(),
                    endPoint: targetCluster.position.clone(),
                    pulseTime: Math.random() * Math.PI * 2
                };
                
                dataParticles.add(line);
            }
        });
    }
}

// Create neural network visualization
function addNeuralNetworkVisualization(simplified) {
    neuralNetwork = new THREE.Group();
    neuralNetwork.position.z = -25; // Position behind other elements
    scene.add(neuralNetwork);
    
    // Layer configuration [input, hidden layers, output]
    const layerSizes = simplified ? [3, 4, 3] : [5, 8, 8, 4]; // Simplified for mobile
    const layerDistance = 5;
    const nodeDistance = 1.5;
    const nodeSize = simplified ? 0.2 : 0.25;
    
    // Create layers and nodes
    const nodes = [];
    const layers = [];
    
    layerSizes.forEach((size, layerIndex) => {
        const layer = new THREE.Group();
        const layerNodes = [];
        
        // Position layer along Z axis
        const layerPos = (layerIndex - (layerSizes.length - 1) / 2) * layerDistance;
        layer.position.z = layerPos;
        
        // Create nodes for this layer
        for (let i = 0; i < size; i++) {
            const nodeY = (i - (size - 1) / 2) * nodeDistance;
            
            // Create node geometry
            const nodeGeometry = new THREE.SphereGeometry(nodeSize, simplified ? 8 : 16, simplified ? 8 : 16);
            const nodeMaterial = new THREE.MeshStandardMaterial({
                color: isLightTheme ? 0x0ea5e9 : 0x17d1ac,
                emissive: isLightTheme ? 0x0ea5e9 : 0x17d1ac,
                emissiveIntensity: 0.3,
                metalness: 0.8,
                roughness: 0.2
            });
            
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.set(0, nodeY, 0);
            
            // Store reference and data for animation
            node.userData = {
                layerIndex,
                nodeIndex: i,
                pulsePhase: Math.random() * Math.PI * 2,
                activationValue: 0
            };
            
            layer.add(node);
            layerNodes.push(node);
        }
        
        neuralNetwork.add(layer);
        nodes.push(layerNodes);
        layers.push(layer);
    });
    
    // Create connections between layers (simplified for mobile)
    for (let layerIndex = 0; layerIndex < layerSizes.length - 1; layerIndex++) {
        const currentLayerNodes = nodes[layerIndex];
        const nextLayerNodes = nodes[layerIndex + 1];
        
        const connectionGroup = new THREE.Group();
        neuralNetwork.add(connectionGroup);
        
        // Connect nodes with reduced connection count for mobile
        const connectionStep = simplified ? 2 : 1; // Skip connections on mobile
        
        for (let i = 0; i < currentLayerNodes.length; i += connectionStep) {
            for (let j = 0; j < nextLayerNodes.length; j += connectionStep) {
                // Create line between nodes
                const sourcePosWorld = new THREE.Vector3();
                currentLayerNodes[i].getWorldPosition(sourcePosWorld);
                
                const targetPosWorld = new THREE.Vector3();
                nextLayerNodes[j].getWorldPosition(targetPosWorld);
                
                const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                    sourcePosWorld,
                    targetPosWorld
                ]);
                
                // Line material with glow effect
                const lineMaterial = new THREE.LineBasicMaterial({ 
                    color: isLightTheme ? 0x0ea5e9 : 0x17d1ac,
                    transparent: true,
                    opacity: 0.05 + Math.random() * 0.1
                });
                
                const connection = new THREE.Line(lineGeometry, lineMaterial);
                connection.userData = {
                    sourceNode: currentLayerNodes[i],
                    targetNode: nextLayerNodes[j],
                    pulsePhase: Math.random() * Math.PI * 2,
                    weight: Math.random() * 2 - 1 // Random weight between -1 and 1
                };
                
                connectionGroup.add(connection);
            }
        }
    }
    
    // Create pulse wave effect animation if not on mobile
    if (!simplified) {
        simulateNeuralActivation();
    }
}

// Simulate data flowing through the neural network
function simulateNeuralActivation() {
    // Propagate activation through the network
    setInterval(() => {
        // Generate random input values for the first layer
        neuralNetwork.children.forEach(layer => {
            if (layer instanceof THREE.Group) {
                layer.children.forEach(node => {
                    if (node.userData && node.userData.layerIndex === 0) {
                        // Set random activation for input layer
                        node.userData.activationValue = Math.random();
                        
                        // Visually pulse the node
                        const intensity = 0.3 + node.userData.activationValue * 0.5;
                        gsap.to(node.material, {
                            emissiveIntensity: intensity,
                            duration: 0.5,
                            ease: "power2.out"
                        });
                    }
                });
            }
        });
    }, 2000);
}

// Create floating tech labels
function addFloatingTechLabels(simplified) {
    const techSkills = [
        { text: "Python", position: new THREE.Vector3(-18, 10, -5), color: isLightTheme ? 0x2563eb : 0x4046e0 },
        { text: "TensorFlow", position: new THREE.Vector3(18, -8, -12), color: isLightTheme ? 0xec4899 : 0xff5678 },
        { text: "SQL", position: new THREE.Vector3(-15, -12, -15), color: isLightTheme ? 0x0ea5e9 : 0x17d1ac },
        { text: "React.js", position: new THREE.Vector3(15, 12, -10), color: 0x61DAFB },
        { text: "AWS", position: new THREE.Vector3(5, 15, -8), color: isLightTheme ? 0xf59e0b : 0xf5a742 }
    ];
    
    // For simplified view, show fewer labels
    const labelsToShow = simplified ? techSkills.slice(0, 3) : techSkills;
    
    labelsToShow.forEach(skill => {
        const sprite = createTextSprite(skill.text, skill.color, simplified ? 0.6 : 0.8);
        sprite.position.copy(skill.position);
        sprite.userData = {
            originalPosition: skill.position.clone(),
            floatSpeed: 0.3 + Math.random() * 0.3,
            floatPhase: Math.random() * Math.PI * 2
        };
        
        scene.add(sprite);
        floatingLabels.push(sprite);
    });
}

// Create text sprite with improved styling
function createTextSprite(text, color = 0xffffff, opacity = 1.0) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;
    
    // Background with gradient
    context.fillStyle = '#00000000'; // Transparent background
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw text
    context.font = 'bold 32px JetBrains Mono, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Text glow effect
    context.shadowColor = typeof color === 'number' ? 
        '#' + new THREE.Color(color).getHexString() : color;
    context.shadowBlur = 15;
    
    // Main text
    context.fillStyle = typeof color === 'number' ? 
        '#' + new THREE.Color(color).getHexString() : color;
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    // Create sprite
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(5, 2.5, 1);
    return sprite;
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update composer size if it exists
    if (composer.setSize) {
        composer.setSize(window.innerWidth, window.innerHeight);
        
        // Update FXAA pass resolution if it exists
        if (composer.passes && composer.passes.length > 2 && composer.passes[2].uniforms && composer.passes[2].uniforms.resolution) {
            composer.passes[2].uniforms.resolution.value.set(
                1 / (window.innerWidth * renderer.getPixelRatio()),
                1 / (window.innerHeight * renderer.getPixelRatio())
            );
        }
    }
}

// Mouse movement handler
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Main animation loop
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    // Update scene based on current section
    updateSceneForSection(currentSection, time);
    
    // Mouse interaction: smooth camera movement
    targetX = mouseX * 0.3;
    targetY = mouseY * 0.3;
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    
    // Animate data particles
    if (dataParticles) {
        dataParticles.children.forEach(child => {
            // Update time uniform for shader materials
            if (child.material && child.material.uniforms && child.material.uniforms.time) {
                child.material.uniforms.time.value = time;
            }
            
            // Animate connection lines
            if (child instanceof THREE.Line && child.userData.pulseTime !== undefined) {
                const pulse = Math.sin(time * 0.5 + child.userData.pulseTime) * 0.5 + 0.5;
                child.material.opacity = 0.1 + pulse * 0.2;
            }
        });
        
        // Rotate the entire data visualization slowly
        dataParticles.rotation.y = time * 0.05;
    }
    
    // Animate neural network
    if (neuralNetwork) {
        // Subtle rotation for the network
        neuralNetwork.rotation.y = Math.sin(time * 0.1) * 0.2;
        
        // Propagate activations through connections
        neuralNetwork.children.forEach(child => {
            if (child instanceof THREE.Group) {
                // For each connection group
                child.children.forEach(connection => {
                    if (connection instanceof THREE.Line && connection.userData.sourceNode) {
                        const { sourceNode, targetNode, weight } = connection.userData;
                        
                        // If source node has activation, propagate to target with some delay
                        if (sourceNode.userData.activationValue > 0.1) {
                            const pulse = Math.sin(time * 2 + connection.userData.pulsePhase) * 0.5 + 0.5;
                            
                            // Visualize data flow with opacity
                            connection.material.opacity = 0.05 + pulse * sourceNode.userData.activationValue * 0.3;
                            
                            // Activate target node with delay
                            if (targetNode.userData.activationValue < sourceNode.userData.activationValue * Math.abs(weight)) {
                                targetNode.userData.activationValue += 0.01 * Math.abs(weight);
                                
                                // Update target node visual
                                const intensity = 0.2 + targetNode.userData.activationValue * 0.8;
                                targetNode.material.emissiveIntensity = intensity;
                            } else {
                                // Decay activation slowly
                                targetNode.userData.activationValue *= 0.99;
                            }
                        } else {
                            // Default subtle pulse
                            const pulse = Math.sin(time + connection.userData.pulsePhase) * 0.5 + 0.5;
                            connection.material.opacity = 0.05 + pulse * 0.05;
                        }
                    }
                });
            }
        });
    }
    
    // Animate floating tech labels
    floatingLabels.forEach(label => {
        if (label.userData) {
            const { originalPosition, floatSpeed, floatPhase } = label.userData;
            
            // Floating animation
            label.position.y = originalPosition.y + Math.sin(time * floatSpeed + floatPhase) * 1.0;
            
            // Face camera (billboarding)
            label.lookAt(camera.position);
        }
    });
    
    // Animate light orbs
    lightOrbs.forEach(orb => {
        if (orb.userData && orb.userData.originalPosition) {
            const { originalPosition, speed, amplitude, phase } = orb.userData;
            
            // Circular movement
            orb.position.x = originalPosition.x + Math.cos(time * speed + phase) * amplitude;
            orb.position.y = originalPosition.y + Math.sin(time * speed + phase) * amplitude;
        }
    });
    
    // Render with post-processing or regular rendering
    composer.render();
}

// Update scene based on current section
function updateSceneForSection(section, time) {
    // Adjust camera and effects based on current section
    switch(section) {
        case 'hero':
            camera.position.z = 30 + Math.sin(time * 0.3) * 2;
            break;
            
        case 'about':
            // Zoom in slightly on neural network
            const targetZ = 25;
            camera.position.z += (targetZ - camera.position.z) * 0.02;
            break;
            
        case 'skills':
            // Focus on data clusters
            if (dataParticles) {
                const targetZ = 28;
                camera.position.z += (targetZ - camera.position.z) * 0.02;
            }
            break;
            
        case 'projects':
            // More distant view
            const projectsZ = 32;
            camera.position.z += (projectsZ - camera.position.z) * 0.02;
            break;
    }
}

// Navigation, scrolling, and UI interactions
function initNavigationAndUI() {
    const toggleBtn = document.querySelector('.toggle-btn');
    const nav = document.querySelector('nav');
    const themeSwitch = document.getElementById('theme-switch');
    
    // Theme toggle
    if (themeSwitch) {
        themeSwitch.addEventListener('change', function() {
            document.body.classList.toggle('light-theme');
            isLightTheme = this.checked;
            
            // Save theme preference
            localStorage.setItem('theme', isLightTheme ? 'light' : 'dark');
            
            // Update Three.js theme colors
            updateThemeColors(isLightTheme);
        });
    }
    
    // Mobile menu toggle
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
            
            // Smooth scroll to section
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Smooth scroll
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Update active link
                    document.querySelectorAll('.nav-link').forEach(l => 
                        l.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Update current section for 3D effects
                    currentSection = targetId.substring(1);
                }
            }
        });
    });
    
    // Resume download animation
    const resumeDownloadBtn = document.querySelector('.resume-download');
    if (resumeDownloadBtn) {
        resumeDownloadBtn.addEventListener('mouseenter', createResumeDownloadEffect);
    }
}

// Create flying paper animation when hovering over resume button
function createResumeDownloadEffect() {
    // Create paper geometry
    const paperGeometry = new THREE.PlaneGeometry(2, 3);
    const paperMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    });
    
    const paper = new THREE.Mesh(paperGeometry, paperMaterial);
    paper.position.set(0, 0, 15);
    scene.add(paper);
    
    // Get button position in 3D space
    const resumeBtn = document.querySelector('.resume-download');
    const rect = resumeBtn.getBoundingClientRect();
    const btnX = (rect.left + rect.width/2) / window.innerWidth * 2 - 1;
    const btnY = -(rect.top + rect.height/2) / window.innerHeight * 2 + 1;
    
    // Convert 2D screen position to 3D world position
    const btnVector = new THREE.Vector3(btnX, btnY, 0.5);
    btnVector.unproject(camera);
    const dir = btnVector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const targetPosition = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // Animate paper flying to button
    gsap.to(paper.position, {
        x: targetPosition.x,
        y: targetPosition.y,
        z: targetPosition.z,
        duration: 1.5,
        ease: "power3.inOut",
        onComplete: () => {
            // Fade out and remove
            gsap.to(paper.material, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    scene.remove(paper);
                    paper.geometry.dispose();
                    paper.material.dispose();
                }
            });
        }
    });
    
    // Add rotation animation
    gsap.to(paper.rotation, {
        x: Math.PI * 2,
        y: Math.PI,
        duration: 1.5,
        ease: "power2.inOut"
    });
    
    // Scale paper down as it approaches button
    gsap.to(paper.scale, {
        x: 0.5,
        y: 0.5,
        z: 0.5,
        duration: 1.5,
        ease: "power2.in"
    });
}

// Update 3D scene colors when theme changes
function updateThemeColors(isLight) {
    // Update colors for all 3D objects based on theme
    const primaryColor = isLight ? 0x2563eb : 0x4046e0;
    const secondaryColor = isLight ? 0x0ea5e9 : 0x17d1ac;
    const accentColor = isLight ? 0xec4899 : 0xff5678;
    
    // Update light colors
    scene.children.forEach(child => {
        if (child instanceof THREE.DirectionalLight) {
            child.color.set(primaryColor);
        } else if (child instanceof THREE.PointLight) {
            child.color.set(secondaryColor);
        } else if (child instanceof THREE.AmbientLight) {
            child.color.set(isLight ? 0xcccccc : 0x404040);
        }
    });
    
    // Update neural network colors
    if (neuralNetwork) {
        neuralNetwork.traverse(object => {
            if (object instanceof THREE.Mesh) {
                object.material.color.set(secondaryColor);
                object.material.emissive.set(secondaryColor);
            } else if (object instanceof THREE.Line) {
                object.material.color.set(secondaryColor);
            }
        });
    }
    
    // Update data particles colors
    if (dataParticles) {
        dataParticles.traverse(object => {
            if (object instanceof THREE.Points && object.userData && object.userData.clusterName) {
                // Determine cluster color based on name
                let color;
                switch(object.userData.clusterName) {
                    case "Machine Learning":
                        color = primaryColor;
                        break;
                    case "Data Analysis":
                        color = secondaryColor;
                        break;
                    case "Web Development":
                        color = accentColor;
                        break;
                    case "Cloud & DevOps":
                        color = isLight ? 0xf59e0b : 0xf5a742;
                        break;
                    default:
                        color = primaryColor;
                }
                
                // Update color in shader material or point material
                if (object.material.uniforms && object.material.uniforms.color) {
                    object.material.uniforms.color.value.set(color);
                } else if (object.material.color) {
                    object.material.color.set(color);
                }
            } else if (object instanceof THREE.Line) {
                object.material.color.set(isLight ? primaryColor : 0xffffff);
            }
        });
    }
    
    // Update floating labels
    floatingLabels.forEach((label, index) => {
        // Recreate sprite with new color
        const colors = [primaryColor, accentColor, secondaryColor, 0x61DAFB, isLight ? 0xf59e0b : 0xf5a742];
        const originalPosition = label.userData.originalPosition;
        const originalPhase = label.userData.floatPhase;
        const originalSpeed = label.userData.floatSpeed;
        const labelText = label.material.map.image.getContext('2d').canvas.toDataURL();
        
        // Get text from sprite
        const originalText = {
            "Python": 0,
            "TensorFlow": 1,
            "SQL": 2,
            "React.js": 3, 
            "AWS": 4
        }[labelText] || index % colors.length;
        
        // Remove old sprite
        scene.remove(label);
        
        // Create new sprite with updated color
        const newLabel = createTextSprite(Object.keys(originalText)[originalText], colors[originalText], 0.8);
        newLabel.position.copy(originalPosition);
        newLabel.userData = {
            originalPosition,
            floatPhase: originalPhase,
            floatSpeed: originalSpeed
        };
        
        // Add new sprite to scene and update reference
        scene.add(newLabel);
        floatingLabels[index] = newLabel;
    });
}

// Scroll effects
function initScrollEffects() {
    // Create scroll progress indicator
    const scrollProgress = document.querySelector('.scroll-progress');
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.body.scrollHeight;
        
        // Update scroll progress bar
        if (scrollProgress) {
            const scrollPercentage = (scrollPosition / (docHeight - windowHeight)) * 100;
            scrollProgress.style.width = `${scrollPercentage}%`;
        }
        
        // Header style change on scroll
        if (scrollPosition > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Determine current section
        const sections = ['hero', 'about', 'skills', 'projects', 'case-studies', 'publications', 'experience', 'contact'];
        let currentSectionId = 'hero';
        
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element && window.scrollY >= element.offsetTop - 200) {
                currentSectionId = section;
                
                // Update active navigation link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${section}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
        
        // Update current section for 3D effects
        currentSection = currentSectionId;
        
        // Animate skill bars when skills section is visible
        if (currentSectionId === 'skills') {
            document.querySelectorAll('.skill-item').forEach(item => {
                item.classList.add('skill-visible');
            });
        }
        
        // Reveal elements on scroll
        document.querySelectorAll('.reveal-on-scroll:not(.revealed)').forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            
            if (rect.top <= windowHeight * 0.8) {
                el.classList.add('revealed');
            }
        });
    });
    
    // Trigger initial scroll check
    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 500);
}

// Typing effect for hero section
function initTypingEffect() {
    const typingTexts = ["Insights_", "Solutions_", "Predictions_", "Innovations_"];
    let currentTextIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 150;
    let newTextDelay = 2000;

    function typeText() {
        const typingElement = document.querySelector('.typing-text');
        if (!typingElement) return;
        
        const currentText = typingTexts[currentTextIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentText.substring(0, charIndex - 1) + "_";
            charIndex--;
            typingDelay = 50;
        } else {
            typingElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 150;
        }
        
        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typingDelay = newTextDelay;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            currentTextIndex = (currentTextIndex + 1) % typingTexts.length;
        }
        
        setTimeout(typeText, typingDelay);
    }

    // Start typing effect
    setTimeout(typeText, 1000);
}

// Create a 3D radar chart for skills visualization
function initSkillRadarChart() {
    // Wait for the skill radar container to be visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createRadarChart();
                observer.disconnect();
            }
        });
    });
    
    const radarContainer = document.getElementById('skill-radar');
    if (radarContainer) {
        observer.observe(radarContainer);
    }
}

function createRadarChart() {
    const container = document.getElementById('skill-radar');
    if (!container) return;
    
    // Create a new renderer for this visualization
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Create scene and camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 20;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);
    
    // Define skill categories and values
    const skillData = [
        { category: "Programming", value: 0.95, color: isLightTheme ? 0x2563eb : 0x4046e0 },
        { category: "ML/AI", value: 0.90, color: isLightTheme ? 0x0ea5e9 : 0x17d1ac },
        { category: "Data Eng.", value: 0.85, color: isLightTheme ? 0xec4899 : 0xff5678 },
        { category: "DevOps", value: 0.80, color: isLightTheme ? 0xf59e0b : 0xf5a742 },
        { category: "Visualization", value: 0.88, color: 0x10b981 }
    ];
    
    // Create radar chart
    const radarGroup = new THREE.Group();
    scene.add(radarGroup);
    
    // Create radar background polygon
    const segments = skillData.length;
    const radius = 10;
    const backgroundGeometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertices.push(x, y, 0);
    }
    
    backgroundGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    // Create radar background lines
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(x, y, 0)
        ]);
        
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.3 
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        radarGroup.add(line);
    }
    
    // Create concentric circles for scale
    for (let r = 2; r <= radius; r += 2) {
        const circleGeometry = new THREE.BufferGeometry();
        const circleVertices = [];
        
        for (let i = 0; i <= 32; i++) {
            const angle = (i / 32) * Math.PI * 2;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            circleVertices.push(x, y, 0);
        }
        
        circleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(circleVertices, 3));
        
        const circleMaterial = new THREE.LineBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.2 
        });
        
        const circle = new THREE.Line(circleGeometry, circleMaterial);
        radarGroup.add(circle);
    }
    
    // Create filled radar area for skill values
    const skillGeometry = new THREE.BufferGeometry();
    const skillVertices = [];
    
    skillData.forEach((skill, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = skill.value * radius * Math.cos(angle);
        const y = skill.value * radius * Math.sin(angle);
        skillVertices.push(x, y, 0);
    });
    
    // Close the shape
    skillVertices.push(skillVertices[0], skillVertices[1], skillVertices[2]);
    
    skillGeometry.setAttribute('position', new THREE.Float32BufferAttribute(skillVertices, 3));
    
    // Create filled shape with custom shader material
    const skillMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = position.xy / 10.0 + 0.5;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            
            void main() {
                vec2 p = vUv * 2.0 - 1.0;
                float dist = length(p);
                
                vec3 color1 = vec3(0.25, 0.42, 0.88); // Primary color
                vec3 color2 = vec3(0.09, 0.82, 0.67); // Secondary color
                
                // Gradient based on position
                vec3 color = mix(color1, color2, dist);
                
                // Pulsing effect
                float pulse = 0.5 + 0.5 * sin(time * 2.0);
                float alpha = 0.6 + 0.2 * pulse;
                
                // Edge highlight
                float edge = smoothstep(0.9, 1.0, dist);
                alpha = mix(alpha, alpha + 0.3, edge);
                
                gl_FragColor = vec4(color, alpha * (1.0 - dist * 0.5));
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const skillMesh = new THREE.Mesh(skillGeometry, skillMaterial);
    skillMesh.position.z = 0.1;
    radarGroup.add(skillMesh);
    
    // Create dots at each skill point
    skillData.forEach((skill, i) => {
        const angle = (i / segments) * Math.PI * 2;
        const x = skill.value * radius * Math.cos(angle);
        const y = skill.value * radius * Math.sin(angle);
        
        const dotGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const dotMaterial = new THREE.MeshStandardMaterial({
            color: skill.color,
            emissive: skill.color,
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(x, y, 0.2);
        radarGroup.add(dot);
        
        // Add label
        const labelSprite = createTextSprite(skill.category, skill.color, 0.8);
        const labelDistance = radius * 1.2;
        labelSprite.position.set(
            labelDistance * Math.cos(angle),
            labelDistance * Math.sin(angle),
            0.3
        );
        radarGroup.add(labelSprite);
    });
    
    // Mouse interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    container.addEventListener('mousedown', () => {
        isDragging = true;
    });
    
    container.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    container.addEventListener('mouseleave', () => {
        isDragging = false;
    });
    
    container.addEventListener('mousemove', (e) => {
        const rect = renderer.domElement.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        if (isDragging) {
            const deltaX = mouseX - previousMousePosition.x;
            const deltaY = mouseY - previousMousePosition.y;
            
            radarGroup.rotation.z += deltaX * 2;
            radarGroup.rotation.x += deltaY;
            
            // Limit x rotation to avoid flipping
            radarGroup.rotation.x = Math.max(-Math.PI/4, Math.min(Math.PI/4, radarGroup.rotation.x));
        }
        
        previousMousePosition = { x: mouseX, y: mouseY };
    });
    
    // Animation loop for radar chart
    function animateRadar() {
        requestAnimationFrame(animateRadar);
        
        // Update time uniform for shader
        skillMesh.material.uniforms.time.value = clock.getElapsedTime();
        
        // Gentle rotation when not interacting
        if (!isDragging) {
            radarGroup.rotation.z += 0.002;
        }
        
        renderer.render(scene, camera);
    }
    
    animateRadar();
    
    // Resize handler
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
    });
}

// Create GitHub contribution graph visualization
function initGitHubContributionGraph() {
    const container = document.getElementById('github-graph');
    if (!container) return;
    
    // Load it only when scrolled into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createGitHubGraph();
                observer.disconnect();
            }
        });
    });
    
    observer.observe(container);
}

function createGitHubGraph() {
    const container = document.getElementById('github-graph');
    if (!container) return;
    
    // Create canvas for 2D visualization
    const canvas = document.createElement('canvas');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Sample contribution data (would be fetched from GitHub API in production)
    const contributionData = generateSampleContributions();
    
    // Draw contribution graph
    const cellSize = 14;
    const cellPadding = 2;
    const columns = 52; // Weeks
    const rows = 7; // Days of week
    
    // Calculate starting position to center the graph
    const graphWidth = columns * (cellSize + cellPadding);
    const graphHeight = rows * (cellSize + cellPadding);
    const startX = (canvas.width - graphWidth) / 2;
    const startY = (canvas.height - graphHeight) / 2;
    
    // Draw cells
    for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows; row++) {
            const index = col * rows + row;
            const value = contributionData[index] || 0;
            
            // Determine color based on contribution count
            let color;
            if (value === 0) {
                color = isLightTheme ? 'rgba(235, 237, 240, 0.8)' : 'rgba(34, 39, 49, 0.8)';
            } else if (value < 5) {
                color = isLightTheme ? 'rgba(37, 99, 235, 0.2)' : 'rgba(64, 70, 224, 0.4)';
            } else if (value < 10) {
                color = isLightTheme ? 'rgba(37, 99, 235, 0.5)' : 'rgba(64, 70, 224, 0.6)';
            } else {
                color = isLightTheme ? 'rgba(37, 99, 235, 0.8)' : 'rgba(64, 70, 224, 0.9)';
            }
            
            // Draw cell
            ctx.fillStyle = color;
            ctx.fillRect(
                startX + col * (cellSize + cellPadding),
                startY + row * (cellSize + cellPadding),
                cellSize,
                cellSize
            );
            
            // Add hover effect interaction
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                
                // Check if mouse is over this cell
                const cellX = startX + col * (cellSize + cellPadding);
                const cellY = startY + row * (cellSize + cellPadding);
                
                if (
                    mouseX >= cellX && mouseX <= cellX + cellSize &&
                    mouseY >= cellY && mouseY <= cellY + cellSize
                ) {
                    // Show tooltip with contribution count
                    const tooltip = document.createElement('div');
                    tooltip.className = 'contribution-tooltip';
                    tooltip.textContent = `${value} contributions on Day ${row+1}, Week ${col+1}`;
                    tooltip.style.position = 'absolute';
                    tooltip.style.left = `${e.clientX + 10}px`;
                    tooltip.style.top = `${e.clientY + 10}px`;
                    tooltip.style.background = 'rgba(0, 0, 0, 0.8)';
                    tooltip.style.color = 'white';
                    tooltip.style.padding = '5px 10px';
                    tooltip.style.borderRadius = '5px';
                    tooltip.style.pointerEvents = 'none';
                    tooltip.style.zIndex = '1000';
                    
                    // Remove any existing tooltip
                    const existingTooltip = document.querySelector('.contribution-tooltip');
                    if (existingTooltip) {
                        existingTooltip.remove();
                    }
                    
                    document.body.appendChild(tooltip);
                }
            });
            
            canvas.addEventListener('mouseleave', () => {
                const tooltip = document.querySelector('.contribution-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        }
    }
    
    // Add animation effect - draw cells one by one
    let currentCell = 0;
    const totalCells = columns * rows;
    
    function animateCell() {
        if (currentCell >= totalCells) return;
        
        const col = Math.floor(currentCell / rows);
        const row = currentCell % rows;
        
        const index = col * rows + row;
        const value = contributionData[index] || 0;
        
        // Determine color based on contribution count
        let color;
        if (value === 0) {
            color = isLightTheme ? 'rgba(235, 237, 240, 0.8)' : 'rgba(34, 39, 49, 0.8)';
        } else if (value < 5) {
            color = isLightTheme ? 'rgba(37, 99, 235, 0.2)' : 'rgba(64, 70, 224, 0.4)';
        } else if (value < 10) {
            color = isLightTheme ? 'rgba(37, 99, 235, 0.5)' : 'rgba(64, 70, 224, 0.6)';
        } else {
            color = isLightTheme ? 'rgba(37, 99, 235, 0.8)' : 'rgba(64, 70, 224, 0.9)';
        }
        
        // Draw cell with animation
        ctx.fillStyle = color;
        ctx.fillRect(
            startX + col * (cellSize + cellPadding),
            startY + row * (cellSize + cellPadding),
            cellSize,
            cellSize
        );
        
        currentCell++;
        
        if (currentCell < totalCells) {
            setTimeout(animateCell, 5); // Adjust speed as needed
        }
    }
    
    // Start animation
    animateCell();
}

// Generate sample GitHub contribution data
function generateSampleContributions() {
    const data = [];
    const daysInYear = 365;
    
    // Generate realistic-looking contribution pattern
    for (let i = 0; i < daysInYear; i++) {
        // Weekend
        if (i % 7 === 0 || i % 7 === 6) {
            // Less likely to contribute on weekends
            data.push(Math.random() < 0.7 ? 0 : Math.floor(Math.random() * 5));
        } 
        // Weekday
        else {
            // More consistent contributions on weekdays
            const rand = Math.random();
            if (rand < 0.3) {
                data.push(0); // 30% chance of no contribution
            } else if (rand < 0.6) {
                data.push(Math.floor(Math.random() * 5) + 1); // 30% chance of 1-5 contributions
            } else if (rand < 0.9) {
                data.push(Math.floor(Math.random() * 5) + 5); // 30% chance of 5-10 contributions
            } else {
                data.push(Math.floor(Math.random() * 10) + 10); // 10% chance of 10-20 contributions
            }
        }
    }
    
    return data;
}

// Interactive ML Demo
function initInteractiveMLDemo() {
    const demoCanvas = document.getElementById('demo-canvas');
    if (!demoCanvas) return;
    
    // Load it only when scrolled into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createInteractiveMLDemo();
                observer.disconnect();
            }
        });
    });
    
    observer.observe(demoCanvas);
}

function createInteractiveMLDemo() {
    if (!window.tf) return; // TensorFlow.js is required
    
    const canvas = document.getElementById('demo-canvas');
    const ctx = canvas.getContext('2d');
    
    // Make canvas responsive
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Get UI elements
    const learningRateInput = document.getElementById('learning-rate');
    const epochsInput = document.getElementById('epochs');
    const noiseInput = document.getElementById('noise');
    const trainButton = document.getElementById('train-model');
    const resetButton = document.getElementById('reset-model');
    const accuracyValue = document.getElementById('accuracy-value');
    const lossValue = document.getElementById('loss-value');
    const iterationsValue = document.getElementById('iterations-value');
    
    // Update displayed values when sliders change
    learningRateInput.addEventListener('input', () => {
        learningRateInput.nextElementSibling.textContent = learningRateInput.value;
    });
    
    epochsInput.addEventListener('input', () => {
        epochsInput.nextElementSibling.textContent = epochsInput.value;
    });
    
    noiseInput.addEventListener('input', () => {
        noiseInput.nextElementSibling.textContent = noiseInput.value;
        generateData(); // Regenerate data with new noise level
        drawData();
    });
    
    // ML parameters
    let model;
    let data;
    let labels;
    let isTraining = false;
    
    // Generate synthetic data
    function generateData() {
        // Generate data with a non-linear decision boundary
        const numSamples = 200;
        data = [];
        labels = [];
        
        const noiseLevel = parseFloat(noiseInput.value);
        
        for (let i = 0; i < numSamples; i++) {
            const x = Math.random() * 2 - 1; // -1 to 1
            const y = Math.random() * 2 - 1; // -1 to 1
            
            // Circular decision boundary with noise
            const distance = Math.sqrt(x * x + y * y);
            const noiseAmount = (Math.random() * 2 - 1) * noiseLevel;
            const label = distance + noiseAmount < 0.6 ? 1 : 0;
            
            data.push([x, y]);
            labels.push(label);
        }
    }
    
    // Draw data points on canvas
    function drawData() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = isLightTheme ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        const gridSize = 20;
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw decision boundary if model exists
        if (model) {
            const resolution = 100;
            const xs = tf.linspace(-1, 1, resolution);
            const ys = tf.linspace(-1, 1, resolution);
            
            const xsgrid = xs.reshape([resolution, 1]).tile([1, resolution]).reshape([resolution * resolution, 1]);
            const ysgrid = ys.reshape([1, resolution]).tile([resolution, 1]).reshape([resolution * resolution, 1]);
            
            const grid = tf.concat([xsgrid, ysgrid], 1);
            const preds = model.predict(grid).dataSync();
            
            // Draw prediction heatmap
            const pixelSize = canvas.width / resolution;
            for (let i = 0; i < resolution; i++) {
                for (let j = 0; j < resolution; j++) {
                    const idx = i * resolution + j;
                    const prob = preds[idx];
                    
                    // Color based on prediction probability
                    const r = Math.round(255 * (1 - prob));
                    const g = Math.round(255 * prob);
                    const b = 100;
                    const alpha = 0.3; // Semi-transparent
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    ctx.fillRect(
                        j * pixelSize,
                        i * pixelSize,
                        pixelSize + 1,
                        pixelSize + 1
                    );
                }
            }
            
            // Draw decision boundary contour
            ctx.strokeStyle = isLightTheme ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            let started = false;
            for (let i = 0; i < resolution; i++) {
                for (let j = 0; j < resolution; j++) {
                    const idx = i * resolution + j;
                    const prob = preds[idx];
                    
                    if (Math.abs(prob - 0.5) < 0.05) {
                        const x = j * pixelSize;
                        const y = i * pixelSize;
                        
                        if (!started) {
                            ctx.moveTo(x, y);
                            started = true;
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                }
            }
            
            ctx.stroke();
        }
        
        // Draw data points
        for (let i = 0; i < data.length; i++) {
            const [x, y] = data[i];
            const label = labels[i];
            
            // Map coordinates to canvas
            const canvasX = ((x + 1) / 2) * canvas.width;
            const canvasY = ((y + 1) / 2) * canvas.height;
            
            // Draw point
            ctx.beginPath();
            ctx.arc(canvasX, canvasY, 5, 0, Math.PI * 2);
            ctx.fillStyle = label === 1 ? 
                isLightTheme ? 'rgba(16, 185, 129, 0.8)' : 'rgba(23, 209, 172, 0.8)' : 
                isLightTheme ? 'rgba(236, 72, 153, 0.8)' : 'rgba(255, 86, 120, 0.8)';
            ctx.fill();
            
            ctx.strokeStyle = isLightTheme ? 'black' : 'white';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }
    
    // Create neural network model
    function createModel() {
        model = tf.sequential();
        
        model.add(tf.layers.dense({
            units: 10,
            activation: 'relu',
            inputShape: [2]
        }));
        
        model.add(tf.layers.dense({
            units: 10,
            activation: 'relu'
        }));
        
        model.add(tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
        }));
        
        const learningRate = parseFloat(learningRateInput.value);
        
        model.compile({
            optimizer: tf.train.adam(learningRate),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });
    }
    
    // Train model
    async function trainModel() {
        if (isTraining) return;
        isTraining = true;
        
        if (!model) createModel();
        
        // Prepare tensors
        const xs = tf.tensor2d(data);
        const ys = tf.tensor2d(labels, [labels.length, 1]);
        
        // Get parameters
        const epochs = parseInt(epochsInput.value);
        
        // Disable controls during training
        trainButton.disabled = true;
        resetButton.disabled = true;
        
        // Update button text
        trainButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Training...';
        
        try {
            // Train the model
            await model.fit(xs, ys, {
                epochs: epochs,
                batchSize: 32,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        // Update metrics
                        accuracyValue.textContent = `${(logs.acc * 100).toFixed(1)}%`;
                        lossValue.textContent = logs.loss.toFixed(4);
                        iterationsValue.textContent = epoch + 1;
                        
                        // Redraw with updated model
                        drawData();
                    }
                }
            });
            
            // Re-enable controls
            trainButton.disabled = false;
            resetButton.disabled = false;
            trainButton.innerHTML = 'Train Model';
            
            // Final redraw
            drawData();
        } catch (error) {
            console.error('Training error:', error);
        }
        
        isTraining = false;
    }
    
    // Reset model
    function resetModel() {
        model = null;
        generateData();
        drawData();
        
        // Reset metrics
        accuracyValue.textContent = '0%';
        lossValue.textContent = '0';
        iterationsValue.textContent = '0';
    }
    
    // Add event listeners
    trainButton.addEventListener('click', trainModel);
    resetButton.addEventListener('click', resetModel);
    
    // Initialize
    generateData();
    drawData();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        drawData();
    });
}

// Create visualizations for case studies
function initCaseStudyVisualizations() {
    const sentimentViz = document.getElementById('sentiment-viz');
    const maintenanceViz = document.getElementById('maintenance-viz');
    
    if (sentimentViz) {
        createSentimentVisualization(sentimentViz);
    }
    
    if (maintenanceViz) {
        createMaintenanceVisualization(maintenanceViz);
    }
}

function createSentimentVisualization(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Sample sentiment data
    const sentiments = [
        { category: "Positive", value: 45, color: isLightTheme ? "rgba(16, 185, 129, 0.8)" : "rgba(23, 209, 172, 0.8)" },
        { category: "Neutral", value: 30, color: isLightTheme ? "rgba(59, 130, 246, 0.8)" : "rgba(64, 70, 224, 0.8)" },
        { category: "Negative", value: 25, color: isLightTheme ? "rgba(236, 72, 153, 0.8)" : "rgba(255, 86, 120, 0.8)" }
    ];
    
    // Draw sentiment distribution
    function drawChart() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Title
        ctx.font = "16px Poppins";
        ctx.fillStyle = isLightTheme ? "#1e293b" : "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("Sentiment Distribution", canvas.width / 2, 30);
        
        // Bar chart
        const barWidth = 60;
        const spacing = 40;
        const startX = (canvas.width - (barWidth * sentiments.length + spacing * (sentiments.length - 1))) / 2;
        const maxBarHeight = canvas.height - 100;
        
        sentiments.forEach((sentiment, i) => {
            const barHeight = (sentiment.value / 100) * maxBarHeight;
            const x = startX + i * (barWidth + spacing);
            const y = canvas.height - 50 - barHeight;
            
            // Draw bar
            ctx.fillStyle = sentiment.color;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw border
            ctx.strokeStyle = isLightTheme ? "#0f172a" : "#ffffff";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Draw value
            ctx.font = "bold 14px Poppins";
            ctx.fillStyle = isLightTheme ? "#0f172a" : "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText(`${sentiment.value}%`, x + barWidth / 2, y - 10);
            
            // Draw category
            ctx.font = "12px Poppins";
            ctx.fillText(sentiment.category, x + barWidth / 2, canvas.height - 20);
        });
        
        // Draw keywords
        const keywords = [
            { text: "Great", size: 18, sentiment: "Positive" },
            { text: "Excellent", size: 16, sentiment: "Positive" },
            { text: "Amazing", size: 14, sentiment: "Positive" },
            { text: "Okay", size: 16, sentiment: "Neutral" },
            { text: "Fine", size: 14, sentiment: "Neutral" },
            { text: "Poor", size: 16, sentiment: "Negative" },
            { text: "Terrible", size: 14, sentiment: "Negative" }
        ];
        
        keywords.forEach(keyword => {
            const color = sentiments.find(s => s.category === keyword.sentiment).color;
            
            ctx.font = `${keyword.size}px Poppins`;
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            
            const x = 50 + Math.random() * (canvas.width - 100);
            const y = 50 + Math.random() * (canvas.height - 150);
            
            ctx.fillText(keyword.text, x, y);
        });
    }
    
    // Add animation
    function animate() {
        drawChart();
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    });
}

function createMaintenanceVisualization(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Sample time series data
    const timeData = [];
    const normalData = [];
    const anomalyData = [];
    const predictionData = [];
    
    // Generate sample time series with anomalies
    for (let i = 0; i < 100; i++) {
        timeData.push(i);
        
        // Base signal
        const baseSignal = 50 + 20 * Math.sin(i * 0.1) + 5 * Math.sin(i * 0.05);
        
        // Add anomalies at specific points
        const isAnomaly = (i > 30 && i < 35) || (i > 70 && i < 75);
        
        if (isAnomaly) {
            normalData.push(null);
            anomalyData.push(baseSignal + 25 + Math.random() * 10);
            
            // Prediction slightly before anomaly
            if (i === 31 || i === 71) {
                predictionData.push(baseSignal + 25);
            } else {
                predictionData.push(null);
            }
        } else {
            normalData.push(baseSignal + Math.random() * 5);
            anomalyData.push(null);
            predictionData.push(null);
        }
    }
    
    // Draw time series chart
    function drawChart() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Title
        ctx.font = "16px Poppins";
        ctx.fillStyle = isLightTheme ? "#1e293b" : "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("Predictive Maintenance Model", canvas.width / 2, 30);
        
        // Set up chart dimensions
        const padding = { top: 40, right: 30, bottom: 50, left: 60 };
        const chartWidth = canvas.width - padding.left - padding.right;
        const chartHeight = canvas.height - padding.top - padding.bottom;
        
        // Scale data to fit chart
        const xScale = chartWidth / (timeData.length - 1);
        const yMin = 0;
        const yMax = 120;
        const yScale = chartHeight / (yMax - yMin);
        
        // Draw grid
        ctx.strokeStyle = isLightTheme ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let y = 0; y <= 100; y += 20) {
            const canvasY = padding.top + chartHeight - (y * yScale);
            
            ctx.beginPath();
            ctx.moveTo(padding.left, canvasY);
            ctx.lineTo(padding.left + chartWidth, canvasY);
            ctx.stroke();
            
            // Y-axis labels
            ctx.font = "12px Poppins";
            ctx.fillStyle = isLightTheme ? "#1e293b" : "#ffffff";
            ctx.textAlign = "right";
            ctx.fillText(y.toString(), padding.left - 10, canvasY + 5);
        }
        
        // Vertical grid lines
        for (let x = 0; x < timeData.length; x += 10) {
            const canvasX = padding.left + (x * xScale);
            
            ctx.beginPath();
            ctx.moveTo(canvasX, padding.top);
            ctx.lineTo(canvasX, padding.top + chartHeight);
            ctx.stroke();
            
            // X-axis labels
            ctx.font = "12px Poppins";
            ctx.fillStyle = isLightTheme ? "#1e293b" : "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText(x.toString(), canvasX, padding.top + chartHeight + 20);
        }
        
        // X and Y axis labels
        ctx.font = "14px Poppins";
        ctx.fillStyle = isLightTheme ? "#1e293b" : "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("Time (hours)", canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.fillText("Sensor Reading", 0, 0);
        ctx.restore();
        
        // Draw normal data
        ctx.strokeStyle = isLightTheme ? "rgba(16, 185, 129, 0.8)" : "rgba(23, 209, 172, 0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        let firstPoint = true;
        for (let i = 0; i < timeData.length; i++) {
            if (normalData[i] !== null) {
                const x = padding.left + (i * xScale);
                const y = padding.top + chartHeight - (normalData[i] * yScale);
                
                if (firstPoint) {
                    ctx.moveTo(x, y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            }
        }
        
        ctx.stroke();
        
        // Draw anomaly data
                // Draw anomaly data
                ctx.strokeStyle = isLightTheme ? "rgba(236, 72, 153, 0.8)" : "rgba(255, 86, 120, 0.8)";
                ctx.lineWidth = 3;
                
                for (let i = 0; i < timeData.length; i++) {
                    if (anomalyData[i] !== null) {
                        const x = padding.left + (i * xScale);
                        const y = padding.top + chartHeight - (anomalyData[i] * yScale);
                        
                        // Draw anomaly point as circle
                        ctx.beginPath();
                        ctx.arc(x, y, 5, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Connect adjacent anomaly points
                        if (i > 0 && anomalyData[i-1] !== null) {
                            ctx.beginPath();
                            ctx.moveTo(padding.left + ((i-1) * xScale), padding.top + chartHeight - (anomalyData[i-1] * yScale));
                            ctx.lineTo(x, y);
                            ctx.stroke();
                        }
                    }
                }
                
                // Draw prediction markers
                ctx.fillStyle = isLightTheme ? "rgba(59, 130, 246, 0.8)" : "rgba(64, 70, 224, 0.8)";
                
                for (let i = 0; i < timeData.length; i++) {
                    if (predictionData[i] !== null) {
                        const x = padding.left + (i * xScale);
                        const y = padding.top + chartHeight - (predictionData[i] * yScale);
                        
                        // Draw prediction triangle
                        ctx.beginPath();
                        ctx.moveTo(x, y - 10);
                        ctx.lineTo(x - 7, y);
                        ctx.lineTo(x + 7, y);
                        ctx.closePath();
                        ctx.fill();
                        
                        // Draw prediction label
                        ctx.font = "12px Poppins";
                        ctx.fillStyle = isLightTheme ? "#1e293b" : "#ffffff";
                        ctx.textAlign = "center";
                        ctx.fillText("Predicted Failure", x, y - 15);
                    }
                }
                
                // Draw legend
                const legendX = padding.left + 20;
                const legendY = padding.top + 30;
                
                // Normal data
                ctx.fillStyle = isLightTheme ? "rgba(16, 185, 129, 0.8)" : "rgba(23, 209, 172, 0.8)";
                ctx.fillRect(legendX, legendY, 20, 3);
                ctx.font = "12px Poppins";
                ctx.fillStyle = isLightTheme ? "#1e293b" : "#ffffff";
                ctx.textAlign = "left";
                ctx.fillText("Normal Operation", legendX + 30, legendY + 5);
                
                // Anomaly data
                ctx.fillStyle = isLightTheme ? "rgba(236, 72, 153, 0.8)" : "rgba(255, 86, 120, 0.8)";
                ctx.beginPath();
                ctx.arc(legendX + 10, legendY + 20, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillText("Failure Event", legendX + 30, legendY + 25);
                
                // Prediction
                ctx.fillStyle = isLightTheme ? "rgba(59, 130, 246, 0.8)" : "rgba(64, 70, 224, 0.8)";
                ctx.beginPath();
                ctx.moveTo(legendX + 10, legendY + 35);
                ctx.lineTo(legendX + 3, legendY + 45);
                ctx.lineTo(legendX + 17, legendY + 45);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = isLightTheme ? "#1e293b" : "#ffffff";
                ctx.fillText("Prediction (72h ahead)", legendX + 30, legendY + 45);
                
                // Animate data points
                const time = Date.now() * 0.001;
                const pulse = Math.sin(time * 2) * 0.5 + 0.5;
                
                // Pulse anomaly points
                ctx.fillStyle = isLightTheme ? 
                    `rgba(236, 72, 153, ${0.5 + pulse * 0.5})` : 
                    `rgba(255, 86, 120, ${0.5 + pulse * 0.5})`;
                    
                for (let i = 0; i < timeData.length; i++) {
                    if (anomalyData[i] !== null) {
                        const x = padding.left + (i * xScale);
                        const y = padding.top + chartHeight - (anomalyData[i] * yScale);
                        
                        // Draw glowing ring around anomaly
                        ctx.beginPath();
                        ctx.arc(x, y, 8 + pulse * 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
            
            // Animate the chart
            function animate() {
                drawChart();
                requestAnimationFrame(animate);
            }
            
            animate();
            
            // Handle resize
            window.addEventListener('resize', () => {
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
            });
        }
        
        // Contact form handling
        function initContactForm() {
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const formData = new FormData(contactForm);
                    const name = formData.get('name');
                    
                    // Simulate form submission with visual feedback
                    // Simulate form submission with visual feedback
                    const submitButton = contactForm.querySelector('button[type="submit"]');
                    
                    submitButton.disabled = true;
                    
                    setTimeout(() => {
                        // Success message
                        contactForm.innerHTML = `
                            <div class="success-message">
                                <i class="fas fa-check-circle"></i>
                                <h3>Message Sent!</h3>
                                <p>Thanks ${name}, your message has been received. I'll get back to you soon.</p>
                            </div>
                        `;
                    }, 1500);
                });
            }
        }
        
        // Clean up resources when page is unloaded
        window.addEventListener('beforeunload', () => {
            // Stop animation loop
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            
            // Dispose Three.js resources
            if (scene) {
                scene.traverse(object => {
                    if (object.geometry) object.geometry.dispose();
                    if (object.material) {
                        if (Array.isArray(object.material)) {
                            object.material.forEach(material => material.dispose());
                        } else {
                            object.material.dispose();
                        }
                    }
                });
                
                scene = null;
            }
            
            if (renderer) {
                renderer.dispose();
                renderer = null;
            }
        });
        
        // Set the last update time
        document.addEventListener('DOMContentLoaded', () => {
            const lastUpdateElement = document.querySelector('.last-update');
            if (lastUpdateElement) {
                lastUpdateElement.textContent = `Last updated: ${new Date("2025-03-28 16:47:43").toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}`;
            }
            
            // Set the logged-in user name if available
            const userElements = document.querySelectorAll('.current-user');
            if (userElements.length > 0) {
                userElements.forEach(element => {
                    element.textContent = 'syashu16';
                });
            }
        });