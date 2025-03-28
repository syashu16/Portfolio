// Global variables for animations
let scene, camera, renderer, composer;
let dataParticles, neuralNetwork, floatingLabels = [];
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let currentSection = 'hero';
let clock = null;
let animationFrameId;
let glowEffectStrength = 0.3;
let isLightTheme = false;
let lightOrbs = [];

// Initialize everything when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Ensure content visibility no matter what
        ensureContentIsVisible();
        
        // Initialize clock
        if (typeof THREE !== 'undefined') {
            clock = new THREE.Clock();
        } else {
            console.warn("THREE.js not loaded - some visualizations may not work");
            clock = { getElapsedTime: () => performance.now() / 1000 };
        }
        
        // Check if theme was previously set
        isLightTheme = localStorage.getItem('theme') === 'light';
        if (isLightTheme) {
            document.body.classList.add('light-theme');
            const themeSwitch = document.getElementById('theme-switch');
            if (themeSwitch) themeSwitch.checked = true;
        }
        
        // Initialize animations, effects, and UI components
        initLoadingSequence();
        
        // These functions don't depend on Three.js
        initNavigationAndUI();
        initScrollEffects();
        initTypingEffect();
        initContactForm();
        
        // Initialize Three.js if available
        if (typeof THREE !== 'undefined') {
            try {
                initThreeJS();
                
                // Defer other Three.js-dependent initializations
                waitForElement('#skill-radar', initSkillRadarChart);
                waitForElement('#github-graph', initGitHubContributionGraph);
                waitForElement('#demo-canvas', initInteractiveMLDemo);
                waitForElement('#sentiment-viz, #maintenance-viz', initCaseStudyVisualizations);
            } catch (e) {
                console.error("Three.js initialization error:", e);
            }
        }
        
        // Update timestamp
        const updateElement = document.querySelector('.last-update');
        if (updateElement) {
            updateElement.textContent = `Last updated: ${new Date("2025-03-28 17:10:07").toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}`;
        }
    } catch (error) {
        console.error("Initialization error:", error);
        ensureContentIsVisible();
    }
});

// Ensure content visibility regardless of JavaScript errors
function ensureContentIsVisible() {
    // Make all sections visible even if JS fails
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '1';
        section.style.transform = 'none';
    });
    
    document.querySelectorAll('.reveal-on-load, .reveal-on-scroll').forEach(el => {
        el.classList.add('revealed');
    });
    
    // Hide loading screen after a timeout
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }
}

// Utility to wait for an element before initializing
function waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
        try {
            callback();
        } catch (error) {
            console.warn(`Error initializing ${selector}:`, error);
        }
    } else {
        setTimeout(() => waitForElement(selector, callback), 500);
    }
}

// Loading sequence with progress counter
function initLoadingSequence() {
    const loadingScreen = document.querySelector('.loading-screen');
    const progressBar = document.querySelector('.progress-bar');
    const loadingText = document.querySelector('.loading-text');
    
    if (!loadingScreen || !progressBar || !loadingText) return;
    
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
    
    try {
        if (typeof renderer.outputEncoding !== 'undefined') {
            renderer.outputEncoding = THREE.sRGBEncoding;
        }
    } catch (e) {
        console.warn("Renderer encoding error:", e);
    }
    
    // Add overlay for better contrast
    createCanvasOverlay();
    
    try {
        // Add post-processing effects (if not on mobile/low-performance device)
        if (!isMobile && !isLowPerformance && 
            typeof THREE.EffectComposer !== 'undefined' && 
            typeof THREE.RenderPass !== 'undefined' && 
            typeof THREE.UnrealBloomPass !== 'undefined') {
            initPostProcessing();
        } else {
            // Simple render pass for low-performance devices
            composer = { render: () => renderer.render(scene, camera) };
            glowEffectStrength = 0.1; // Reduce glow for performance
        }
    } catch (e) {
        console.warn("Post-processing initialization error:", e);
        composer = { render: () => renderer.render(scene, camera) };
    }
    
    // Add scene elements with performance considerations
    try {
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
    } catch (e) {
        console.warn("Scene element initialization error:", e);
        
        // Add minimal scene to prevent complete failure
        try {
            const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
            scene.add(ambientLight);
            
            const pointLight = new THREE.PointLight(0x4046e0, 1.0, 100);
            pointLight.position.set(0, 0, 10);
            scene.add(pointLight);
        } catch (e) {
            console.error("Minimal scene setup failed:", e);
        }
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
    const container = document.querySelector('.canvas-container');
    if (!container) return;
    
    // Check if overlay already exists
    if (!container.querySelector('.canvas-overlay')) {
        const overlay = document.createElement('div');
        overlay.classList.add('canvas-overlay');
        container.appendChild(overlay);
    }
}

// Add post-processing effects for better visuals
function initPostProcessing() {
    try {
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
        if (typeof THREE.FXAAShader !== 'undefined') {
            const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
            fxaaPass.uniforms.resolution.value.set(
                1 / (window.innerWidth * renderer.getPixelRatio()),
                1 / (window.innerHeight * renderer.getPixelRatio())
            );
            composer.addPass(fxaaPass);
        }
    } catch (e) {
        console.error("Post-processing error:", e);
        composer = { render: () => renderer.render(scene, camera) };
    }
}

// Add dynamic lighting to the scene
function addLighting(simplified) {
    try {
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
                    colors[i], // Different colors
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
    } catch (e) {
        console.error("Lighting initialization error:", e);
    }
}

// Create interactive data visualization
function addDataVisualization(simplified) {
    try {
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
            const particleCount = simplified ? 40 : 80;
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
                particleSizes[i] = 0.1 + Math.random() * 0.2;
            }
            
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
            particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
            
            // Create particle material based on capabilities
            let particleMaterial;
            
            if (simplified || !THREE.ShaderMaterial) {
                // Simplified material for low-performance devices
                particleMaterial = new THREE.PointsMaterial({
                    color: cluster.color,
                    size: 0.3,
                    transparent: true,
                    opacity: 0.7,
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
            
            // Add cluster label
            if (!simplified) {
                const labelSprite = createTextSprite(cluster.name, cluster.color);
                if (labelSprite) {
                    labelSprite.position.set(
                        cluster.position.x,
                        cluster.position.y + 2.5,
                        cluster.position.z
                    );
                    dataParticles.add(labelSprite);
                }
            }
        });
        
        // Create connections between clusters
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
                        color: 0xffffff,
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
    } catch (e) {
        console.error("Data visualization error:", e);
    }
}

// Create neural network visualization
function addNeuralNetworkVisualization(simplified) {
    try {
        neuralNetwork = new THREE.Group();
        neuralNetwork.position.z = -25; // Position behind other elements
        scene.add(neuralNetwork);
        
        // Layer configuration [input, hidden layers, output]
        const layerSizes = simplified ? [3, 4, 3] : [5, 8, 8, 4];
        const layerDistance = 5;
        const nodeDistance = 1.5;
        const nodeSize = 0.25;
        
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
                
                // Create node geometry with appropriate detail level
                const nodeGeometry = new THREE.SphereGeometry(
                    nodeSize, 
                    simplified ? 8 : 16, 
                    simplified ? 8 : 16
                );
                
                const nodeMaterial = new THREE.MeshStandardMaterial({
                    color: isLightTheme ? 0x0ea5e9 : 0x17d1ac,
                    emissive: isLightTheme ? 0x0ea5e9 : 0x17d1ac,
                    emissiveIntensity: 0.5,
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
        
        // Create connections between layers
        for (let layerIndex = 0; layerIndex < layerSizes.length - 1; layerIndex++) {
            const currentLayerNodes = nodes[layerIndex];
            const nextLayerNodes = nodes[layerIndex + 1];
            
            const connectionGroup = new THREE.Group();
            neuralNetwork.add(connectionGroup);
            
            // Connect each node to all nodes in the next layer (with reduced connections for simplified mode)
            const connectionStep = simplified ? 2 : 1;
            
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
        
        // Create pulse wave effect animation if not simplified
        if (!simplified && typeof window.gsap !== 'undefined') {
            simulateNeuralActivation();
        }
    } catch (e) {
        console.error("Neural network visualization error:", e);
    }
}

// Simulate data flowing through the neural network
function simulateNeuralActivation() {
    try {
        // Propagate activation through the network
        setInterval(() => {
            if (!neuralNetwork) return;
            
            // Generate random input values for the first layer
            neuralNetwork.children.forEach(layer => {
                if (layer instanceof THREE.Group) {
                    layer.children.forEach(node => {
                        if (node.userData && node.userData.layerIndex === 0) {
                            // Set random activation for input layer
                            node.userData.activationValue = Math.random();
                            
                            // Visually pulse the node
                            if (window.gsap && node.material) {
                                gsap.to(node.material, {
                                    emissiveIntensity: 0.5 + node.userData.activationValue * 0.5,
                                    duration: 0.5,
                                    ease: "power2.out"
                                });
                            }
                        }
                    });
                }
            });
        }, 2000);
    } catch (e) {
        console.warn("Neural activation simulation error:", e);
    }
}

// Create floating tech labels
function addFloatingTechLabels(simplified) {
    try {
        const techSkills = [
            { text: "Python", position: new THREE.Vector3(-18, 10, -5), color: isLightTheme ? 0x2563eb : 0x4046e0 },
            { text: "TensorFlow", position: new THREE.Vector3(18, -8, -12), color: isLightTheme ? 0xec4899 : 0xff5678 },
            { text: "SQL", position: new THREE.Vector3(-15, -12, -15), color: isLightTheme ? 0x0ea5e9 : 0x17d1ac },
            { text: "React.js", position: new THREE.Vector3(15, 12, -10), color: 0x61DAFB },
            { text: "AWS", position: new THREE.Vector3(5, 15, -8), color: isLightTheme ? 0xf59e0b : 0xf5a742 },
            { text: "Docker", position: new THREE.Vector3(-12, 0, -20), color: 0x0db7ed }
        ];
        
        // For simplified view, show fewer labels
        const labelsToShow = simplified ? techSkills.slice(0, 3) : techSkills;
        
        labelsToShow.forEach(skill => {
            const sprite = createTextSprite(skill.text, skill.color, 0.8);
            if (sprite) {
                sprite.position.copy(skill.position);
                sprite.userData = {
                    originalPosition: skill.position.clone(),
                    floatSpeed: 0.3 + Math.random() * 0.3,
                    floatPhase: Math.random() * Math.PI * 2
                };
                
                scene.add(sprite);
                floatingLabels.push(sprite);
            }
        });
    } catch (e) {
        console.error("Floating tech labels error:", e);
    }
}

// Create text sprite with improved styling
function createTextSprite(text, color = 0xffffff, opacity = 1.0) {
    try {
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
            depthWrite: false
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(5, 2.5, 1);
        return sprite;
    } catch (e) {
        console.warn("Text sprite creation error:", e);
        return null;
    }
}

// Window resize handler
function onWindowResize() {
    try {
        if (!camera || !renderer) return;
        
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update composer size if it exists and is valid
        if (composer && typeof composer.setSize === 'function') {
            composer.setSize(window.innerWidth, window.innerHeight);
            
            // Update FXAA pass resolution if it exists
            if (composer.passes && composer.passes.length > 2 && 
                composer.passes[2].uniforms && composer.passes[2].uniforms.resolution) {
                composer.passes[2].uniforms.resolution.value.set(
                    1 / (window.innerWidth * renderer.getPixelRatio()),
                    1 / (window.innerHeight * renderer.getPixelRatio())
                );
            }
        }
    } catch (e) {
        console.warn("Window resize handler error:", e);
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
    try {
        animationFrameId = requestAnimationFrame(animate);
        
        if (!scene || !camera || !renderer) return;
        
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
                if (child instanceof THREE.Line && child.userData && child.userData.pulseTime !== undefined) {
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
                        if (connection instanceof THREE.Line && connection.userData && connection.userData.sourceNode) {
                            const { sourceNode, targetNode, weight } = connection.userData;
                            
                            // If source node has activation, propagate to target with some delay
                            if (sourceNode.userData && sourceNode.userData.activationValue > 0.1) {
                                const pulse = Math.sin(time * 2 + connection.userData.pulsePhase) * 0.5 + 0.5;
                                
                                // Visualize data flow with opacity
                                connection.material.opacity = 0.05 + pulse * 0.1;
                                targetNode.userData.activationValue = Math.max(
                                    targetNode.userData.activationValue,
                                    sourceNode.userData.activationValue * weight
                                );
                            }
                        }
                    });
                }
            });
        }
        
        // Animate floating tech labels
        floatingLabels.forEach(label => {
            if (label.userData) {
                // Make labels float up and down
                label.position.y = label.userData.originalPosition.y + 
                    Math.sin(time * label.userData.floatSpeed + label.userData.floatPhase) * 0.5;
            }
        });
        
        // Animate light orbs
        lightOrbs.forEach(orb => {
            if (orb.userData) {
                // Circular motion
                orb.position.x = orb.userData.originalPosition.x + 
                    Math.sin(time * orb.userData.speed + orb.userData.phase) * orb.userData.amplitude;
                orb.position.y = orb.userData.originalPosition.y + 
                    Math.cos(time * orb.userData.speed + orb.userData.phase) * orb.userData.amplitude;
            }
        });
        
        // Render scene
        if (composer && typeof composer.render === 'function') {
            composer.render();
        } else if (renderer) {
            renderer.render(scene, camera);
        }
    } catch (e) {
        console.error("Animation loop error:", e);
    }
}

// Function to update scene based on current section
function updateSceneForSection(section, time) {
    try {
        // Different camera behaviors for different sections
        switch(section) {
            case 'hero':
                // More dynamic camera for hero section
                camera.position.z = 30 + Math.sin(time * 0.1) * 2;
                break;
            case 'about':
                // Closer view for about section
                camera.position.z = 25;
                break;
            case 'skills':
                // Focus on data visualization
                if (dataParticles) {
                    dataParticles.rotation.y = time * 0.1;
                }
                break;
            case 'projects':
                // Focus on neural network
                if (neuralNetwork) {
                    neuralNetwork.rotation.y = time * 0.15;
                }
                break;
            default:
                // Default camera position
                camera.position.z = 30;
        }
    } catch (e) {
        console.warn("Scene update error:", e);
    }
}

// Add post-processing effects for better visuals
function initPostProcessing() {
    if (!THREE.EffectComposer || !THREE.RenderPass || !THREE.UnrealBloomPass) {
        throw new Error('Required Three.js post-processing modules not loaded');
    }
    
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
    if (THREE.FXAAShader) {
        const fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
        fxaaPass.uniforms.resolution.value.set(
            1 / (window.innerWidth * renderer.getPixelRatio()),
            1 / (window.innerHeight * renderer.getPixelRatio())
        );
        composer.addPass(fxaaPass);
    }
}

// Add dynamic lighting to the scene
function addLighting(simplified) {
    try {
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
    } catch (error) {
        console.error('Error adding lighting:', error);
    }
}

// Create interactive data visualization
function addDataVisualization(simplified) {
    try {
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
            const particleCount = simplified ? 20 : 50; // Reduce count for mobile
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
            
            // Determine which material to use based on device capability
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
                try {
                    const labelSprite = createTextSprite(cluster.name, cluster.color);
                    labelSprite.position.set(
                        cluster.position.x,
                        cluster.position.y + 2.5,
                        cluster.position.z
                    );
                    dataParticles.add(labelSprite);
                } catch (error) {
                    console.error('Error creating cluster label:', error);
                }
            }
        });
    } catch (error) {
        console.error('Error creating data visualization:', error);
    }
}

// Create neural network visualization
function addNeuralNetworkVisualization(simplified) {
    try {
        neuralNetwork = new THREE.Group();
        neuralNetwork.position.z = -25; // Position behind other elements
        scene.add(neuralNetwork);
        
        // Layer configuration - simplified for better performance
        const layerSizes = simplified ? [3, 4, 3] : [4, 6, 4]; 
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
        
        // Create connections - skip some connections on mobile
        const connectionStep = simplified ? 2 : 1;
        
        for (let layerIndex = 0; layerIndex < layerSizes.length - 1; layerIndex++) {
            const currentLayerNodes = nodes[layerIndex];
            const nextLayerNodes = nodes[layerIndex + 1];
            
            for (let i = 0; i < currentLayerNodes.length; i += connectionStep) {
                for (let j = 0; j < nextLayerNodes.length; j += connectionStep) {
                    try {
                        // Calculate world positions
                        const sourcePos = new THREE.Vector3();
                        currentLayerNodes[i].getWorldPosition(sourcePos);
                        
                        const targetPos = new THREE.Vector3();
                        nextLayerNodes[j].getWorldPosition(targetPos);
                        
                        // Create line
                        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                            sourcePos,
                            targetPos
                        ]);
                        
                        const lineMaterial = new THREE.LineBasicMaterial({
                            color: isLightTheme ? 0x0ea5e9 : 0x17d1ac,
                            transparent: true,
                            opacity: 0.05 + Math.random() * 0.05
                        });
                        
                        const line = new THREE.Line(lineGeometry, lineMaterial);
                        neuralNetwork.add(line);
                    } catch (error) {
                        console.error('Error creating neural connection:', error);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error creating neural network:', error);
    }
}

// Create floating tech labels
function addFloatingTechLabels(simplified) {
    try {
        const techSkills = [
            { text: "Python", position: new THREE.Vector3(-18, 10, -5), color: isLightTheme ? 0x2563eb : 0x4046e0 },
            { text: "TensorFlow", position: new THREE.Vector3(18, -8, -12), color: isLightTheme ? 0xec4899 : 0xff5678 },
            { text: "SQL", position: new THREE.Vector3(-15, -12, -15), color: isLightTheme ? 0x0ea5e9 : 0x17d1ac }
        ];
        
        if (!simplified) {
            techSkills.push(
                { text: "React.js", position: new THREE.Vector3(15, 12, -10), color: 0x61DAFB },
                { text: "AWS", position: new THREE.Vector3(5, 15, -8), color: isLightTheme ? 0xf59e0b : 0xf5a742 }
            );
        }
        
        techSkills.forEach(skill => {
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
    } catch (error) {
        console.error('Error creating floating tech labels:', error);
    }
}

// Create text sprite with improved styling
function createTextSprite(text, color = 0xffffff, opacity = 1.0) {
    try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get 2D context');
        
        canvas.width = 256;
        canvas.height = 128;
        
        // Clear background
        context.fillStyle = 'rgba(0,0,0,0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw text
        context.font = 'bold 32px "Poppins", sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Text glow effect
        const colorStr = typeof color === 'number' ? 
            '#' + new THREE.Color(color).getHexString() : color;
        
        context.shadowColor = colorStr;
        context.shadowBlur = 15;
        
        // Main text
        context.fillStyle = colorStr;
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
    } catch (error) {
        console.error('Error creating text sprite:', error);
        // Return a simple sprite as fallback
        const material = new THREE.SpriteMaterial({ color: 0xffffff });
        return new THREE.Sprite(material);
    }
}

// Window resize handler
function onWindowResize() {
    if (!camera || !renderer) return;
    
    try {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update composer size if it exists
        if (composer && typeof composer.setSize === 'function') {
            composer.setSize(window.innerWidth, window.innerHeight);
            
            // Update FXAA pass resolution if it exists
            if (composer.passes && composer.passes.length > 2 && 
                composer.passes[2].uniforms && composer.passes[2].uniforms.resolution) {
                composer.passes[2].uniforms.resolution.value.set(
                    1 / (window.innerWidth * renderer.getPixelRatio()),
                    1 / (window.innerHeight * renderer.getPixelRatio())
                );
            }
        }
    } catch (error) {
        console.error('Error handling window resize:', error);
    }
}

// Mouse movement handler
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Navigation, scrolling, and UI interactions
function initNavigationAndUI() {
    try {
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
                
                // Update Three.js theme colors if initialized
                if (threeJsInitialized) {
                    try {
                        updateThemeColors(isLightTheme);
                    } catch (error) {
                        console.error('Error updating theme colors:', error);
                    }
                }
            });
        }
        
        // Mobile menu toggle
        if (toggleBtn && nav) {
            toggleBtn.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        }
        
        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                }
                
                // Smooth scroll to section
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
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
        if (resumeDownloadBtn && threeJsInitialized) {
            resumeDownloadBtn.addEventListener('mouseenter', () => {
                try {
                    createResumeDownloadEffect();
                } catch (error) {
                    console.error('Error creating resume download effect:', error);
                }
            });
        }
    } catch (error) {
        console.error('Error initializing navigation and UI:', error);
    }
}

// Create flying paper animation when hovering over resume button
function createResumeDownloadEffect() {
    if (!scene || !camera) return;
    
    try {
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
        
        // Animate paper flying
        if (typeof gsap !== 'undefined') {
            // Use GSAP if available
            gsap.to(paper.position, {
                x: 10,
                y: -5,
                z: 5,
                duration: 1.5,
                ease: "power3.inOut",
                onComplete: () => {
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
            
            // Add rotation
            gsap.to(paper.rotation, {
                x: Math.PI * 2,
                y: Math.PI,
                duration: 1.5,
                ease: "power2.inOut"
            });
        } else {
            // Fallback animation without GSAP
            setTimeout(() => {
                scene.remove(paper);
                paper.geometry.dispose();
                paper.material.dispose();
            }, 2000);
            
            // Add to animation loop
            paper.userData = {
                animating: true,
                startTime: Date.now(),
                startPos: paper.position.clone()
            };
        }
    } catch (error) {
        console.error('Error creating paper animation:', error);
    }
}

// Update theme colors for 3D elements
function updateThemeColors(isLight) {
    if (!scene) return;
    
    try {
        // Update ambient light
        scene.traverse(child => {
            if (child instanceof THREE.AmbientLight) {
                child.color.set(isLight ? 0xcccccc : 0x404040);
            }
        });
        
        // Update data particles
        if (dataParticles) {
            dataParticles.traverse(object => {
                if (object instanceof THREE.Points && object.material) {
                    // Try to update color
                    if (object.material.color) {
                        const newColor = isLight ? 0x2563eb : 0x4046e0;
                        object.material.color.set(newColor);
                    }
                }
            });
        }
        
        // Update neural network
        if (neuralNetwork) {
            neuralNetwork.traverse(object => {
                if ((object instanceof THREE.Mesh || object instanceof THREE.Line) && object.material) {
                    if (object.material.color) {
                        const newColor = isLight ? 0x0ea5e9 : 0x17d1ac;
                        object.material.color.set(newColor);
                    }
                    if (object.material.emissive) {
                        const newColor = isLight ? 0x0ea5e9 : 0x17d1ac;
                        object.material.emissive.set(newColor);
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error updating theme colors:', error);
    }
}

// Scroll effects
function initScrollEffects() {
    try {
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
            if (header) {
                if (scrollPosition > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
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
    } catch (error) {
        console.error('Error initializing scroll effects:', error);
        // Make all sections visible as fallback
        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            el.classList.add('revealed');
        });
    }
}

// Typing effect for hero section
function initTypingEffect() {
    try {
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
            
            try {
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
            } catch (error) {
                console.error('Error in typing animation:', error);
                // Display full text as fallback
                typingElement.textContent = "Insights_";
            }
        }
        
        // Start typing effect
        setTimeout(typeText, 1000);
    } catch (error) {
        console.error('Error initializing typing effect:', error);
    }
}

// Contact form handling
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    try {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            
            // Simulate form submission with visual feedback
            const submitButton = contactForm.querySelector('button[type="submit"]');
            if (!submitButton) return;
            
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Sending...';
            
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
    } catch (error) {
        console.error('Error initializing contact form:', error);
    }
}

// Clean up resources when page is unloaded
window.addEventListener('beforeunload', () => {
    try {
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
        }
        
        if (renderer) {
            renderer.dispose();
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});

// Skill radar chart initialization
function initSkillRadarChart() {
    // Implementation abbreviated for brevity
    console.log('Skill radar chart initialized');
}

// GitHub contribution graph
function initGitHubContributionGraph() {
    // Implementation abbreviated for brevity
    console.log('GitHub contribution graph initialized');
}

// ML demo initialization 
function initInteractiveMLDemo() {
    // Implementation abbreviated for brevity
    console.log('ML demo initialized');
}

// Case study visualizations
function initCaseStudyVisualizations() {
    // Implementation abbreviated for brevity
    console.log('Case study visualizations initialized');
}

// Set current date in UTC format
document.addEventListener('DOMContentLoaded', () => {
    try {
        const dateElements = document.querySelectorAll('.current-date');
        if (dateElements.length > 0) {
            const now = new Date();
            const formattedDate = now.toISOString().replace('T', ' ').substring(0, 19);
            dateElements.forEach(element => {
                element.textContent = formattedDate;
            });
        }
        
        // Set current user if available
        const userElements = document.querySelectorAll('.current-user');
        if (userElements.length > 0) {
            userElements.forEach(element => {
                element.textContent = 'syashu16';
            });
        }
    } catch (error) {
        console.error('Error setting date or user:', error);
    }
});