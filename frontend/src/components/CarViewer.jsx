import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const DOTS = [
  { id: 'engine', label: 'Power Unit', x: '55%', y: '42%' },
  { id: 'halo', label: 'Halo', x: '53%', y: '30%' },
  { id: 'frontWing', label: 'Front Wing', x: '18%', y: '52%' },
  { id: 'rearWing', label: 'Rear Wing', x: '83%', y: '32%' },
  { id: 'tires', label: 'Tires', x: '30%', y: '62%' },
  { id: 'floor', label: 'Floor', x: '52%', y: '65%' },
  { id: 'sidepod', label: 'Sidepods', x: '63%', y: '50%' },
  { id: 'steeringWheel', label: 'Steering', x: '50%', y: '38%' },
];

export default function CarViewer({ modelPath, teamColor, onPartClick, selectedPart }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const animFrameRef = useRef(null);
  const keyLightRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [hoveredDot, setHoveredDot] = useState(null);
  const [lightAzimuth, setLightAzimuth] = useState(45);
  const [lightElevation, setLightElevation] = useState(45);

  useEffect(() => {
    const mount = mountRef.current;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060606');
    sceneRef.current = scene;

    // Camera — positioned for front-3/4 view
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
    camera.position.set(5, 2.5, 7);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.8;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LIGHTING — much brighter, 3-point setup
    // Ambient — base fill
    const ambient = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambient);

    // Key light — main light from upper front
    const keyLight = new THREE.DirectionalLight(0xffffff, 6.0);
    keyLight.position.set(6, 8, 6);
    keyLightRef.current = keyLight;
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 50;
    keyLight.shadow.camera.left = -10;
    keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10;
    keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    // Fill light — opposite side, softer
    const fillLight = new THREE.DirectionalLight(0xffffff, 3.5);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    // Rim light — from behind, creates edge definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.5);
    rimLight.position.set(0, 3, -8);
    scene.add(rimLight);

    // Under light — illuminates underfloor
    const underLight = new THREE.DirectionalLight(0xffffff, 2.0);
    underLight.position.set(0, -4, 0);
    scene.add(underLight);

    // Team color accent light
    const accentLight = new THREE.PointLight(teamColor, 2.0, 10);
    accentLight.position.set(-3, 2, 3);
    scene.add(accentLight);
    

    
    // Ground
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(0, 0),
      new THREE.MeshStandardMaterial({
        color: '#000000ff',
        roughness: 0.9,
        metalness: 0.1,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle grid

    const grid = new THREE.GridHelper(80, 80, '#191919ff', '#191919ff');
    grid.position.y = -1.49;
    scene.add(grid);

    

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.04;
    controls.minDistance = 3;
    controls.maxDistance = 14;
    controls.enablePan = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Animate
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Load model
    setLoading(true);
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;

        // Auto-center and scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5.0 / maxDim;

        model.scale.setScalar(scale);
        model.position.copy(center.multiplyScalar(-scale));
        model.position.y += 0.3;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);
        modelRef.current = model;
        setLoading(false);
      },
      null,
      (err) => {
        console.error('Load error:', err);
        setLoadError(true);
        setLoading(false);
      }
    );

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animFrameRef.current);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [modelPath, teamColor]);

  // Update light position based on UI controls
  useEffect(() => {
    if (keyLightRef.current) {
      const radius = 15;
      const phi = (90 - lightElevation) * (Math.PI / 180);
      const theta = lightAzimuth * (Math.PI / 180);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      keyLightRef.current.position.set(x, y, z);
    }
  }, [lightAzimuth, lightElevation]);

  // Slide car right when panel opens
  useEffect(() => {
    if (!modelRef.current) return;
    const targetX = selectedPart ? 1.8 : 0;
    let rafId;
    const slide = () => {
      if (!modelRef.current) return;
      const diff = targetX - modelRef.current.position.x;
      if (Math.abs(diff) > 0.005) {
        modelRef.current.position.x += diff * 0.1;
        rafId = requestAnimationFrame(slide);
      } else {
        modelRef.current.position.x = targetX;
      }
    };
    rafId = requestAnimationFrame(slide);
    return () => cancelAnimationFrame(rafId);
  }, [selectedPart]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Dots */}
      {!loading && !loadError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: selectedPart ? 0 : 1,
          transition: 'opacity 0.3s',
        }}>
          {DOTS.map(dot => (
            <div
              key={dot.id}
              onClick={() => onPartClick(dot.id)}
              onMouseEnter={() => setHoveredDot(dot.id)}
              onMouseLeave={() => setHoveredDot(null)}
              style={{
                pointerEvents: selectedPart ? 'none' : 'auto',
                position: 'absolute',
                left: dot.x,
                top: dot.y,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                zIndex: 5,
              }}
            >
              <div style={{
                width: hoveredDot === dot.id ? '16px' : '10px',
                height: hoveredDot === dot.id ? '16px' : '10px',
                borderRadius: '50%',
                background: teamColor,
                boxShadow: `0 0 ${hoveredDot === dot.id ? '20px' : '10px'} ${teamColor}88`,
                transition: 'all 0.2s',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  inset: '-5px',
                  borderRadius: '50%',
                  border: `1px solid ${teamColor}`,
                  opacity: 0.5,
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
              </div>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px',
                color: hoveredDot === dot.id ? teamColor : '#555',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                background: 'rgba(6,6,6,0.85)',
                padding: '3px 8px',
                transition: 'color 0.2s',
              }}>
                {dot.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#060606', gap: '20px',
        }}>
          <div style={{
            width: '52px', height: '52px',
            border: '2px solid #111',
            borderTop: `2px solid ${teamColor}`,
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: '24px',
              color: teamColor,
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}>
              Loading
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              color: '#222',
              letterSpacing: '3px',
              marginTop: '6px',
            }}>
              Preparing 3D Model
            </div>
          </div>
        </div>
      )}

      {loadError && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#060606', gap: '12px',
        }}>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: '20px',
            color: '#8b1a1a',
            letterSpacing: '3px',
          }}>
            Model Failed to Load
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            color: '#333',
            letterSpacing: '2px',
          }}>
            Check console for details
          </div>
        </div>
      )}

      {!loading && !selectedPart && (
        <div style={{
          position: 'absolute', bottom: '28px', left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px', color: '#252525',
          letterSpacing: '3px', textTransform: 'uppercase',
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>
          Drag to rotate · Click a dot to inspect
        </div>
      )}

      {/* Lighting Controls UI */}
      {!loading && !loadError && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          right: '32px',
          background: 'rgba(10, 10, 10, 0.85)',
          border: '1px solid #222',
          padding: '16px 20px',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 10,
          color: '#ccc',
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',
          letterSpacing: '1px',
          pointerEvents: selectedPart ? 'none' : 'auto',
          backdropFilter: 'blur(8px)',
          opacity: selectedPart ? 0 : 1,
          transition: 'opacity 0.3s, border-color 0.3s',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = teamColor; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#222'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600 }}>LIGHT ANGLE</span>
            <span style={{ color: teamColor }}>{lightAzimuth}°</span>
          </div>
          <input
            type="range" min="0" max="360" value={lightAzimuth}
            onChange={(e) => setLightAzimuth(Number(e.target.value))}
            style={{ accentColor: teamColor, width: '160px', cursor: 'grab' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600 }}>LIGHT HEIGHT</span>
            <span style={{ color: teamColor }}>{lightElevation}°</span>
          </div>
          <input
            type="range" min="-20" max="90" value={lightElevation}
            onChange={(e) => setLightElevation(Number(e.target.value))}
            style={{ accentColor: teamColor, width: '160px', cursor: 'grab' }}
          />
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}