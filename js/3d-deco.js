import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

const host = document.querySelector("#deco-3d-layer");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const smallScreen = window.matchMedia("(max-width: 760px)").matches;

if (host && !reducedMotion) {
  const scene = new THREE.Scene();
  const width = window.innerWidth;
  const height = window.innerHeight;
  const camera = new THREE.OrthographicCamera(0, width, 0, height, 0.1, 2000);
  camera.position.z = 1000;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2);
  keyLight.position.set(-3, 5, 8);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0xD12244, 1.3, 500);
  rimLight.position.set(0, 0, 160);
  scene.add(rimLight);

  const placements = [
    { selector: ".hero", x: 0.91, y: 0.78, size: 70, phase: 0.3 },
    { selector: ".updates-section", x: 0.92, y: 0.22, size: 58, phase: 1.8 },
    { selector: ".projects-section", x: 0.08, y: 0.76, size: 76, phase: 2.7 },
    { selector: ".values-section", x: 0.92, y: 0.22, size: 66, phase: 4.1 },
    { selector: ".goals-section", x: 0.89, y: 0.72, size: 56, phase: 5.2 }
  ].map(item => ({ ...item, element: document.querySelector(item.selector), group: null, baseY: 0 }));

  if (smallScreen) {
    placements.forEach(item => {
      item.x = item.x > 0.5 ? 0.91 : 0.09;
      item.size *= 0.72;
    });
  }

  const loader = new OBJLoader();
  loader.load(
    "assets/U-deco-3D.obj",
    model => {
      const bounds = new THREE.Box3().setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      const dimensions = bounds.getSize(new THREE.Vector3());
      const maxDimension = Math.max(dimensions.x, dimensions.y, dimensions.z) || 1;
      model.position.sub(center);
      model.scale.setScalar(1 / maxDimension);

      const material = new THREE.MeshStandardMaterial({
        color: 0xCC092F,
        metalness: 0.2,
        roughness: 0.36,
        side: THREE.DoubleSide
      });

      model.traverse(child => {
        if (!child.isMesh) return;
        child.material = material;
        child.castShadow = false;
        child.receiveShadow = false;
        child.geometry.computeVertexNormals();
      });

      placements.forEach((item, index) => {
        if (!item.element) return;
        const group = new THREE.Group();
        const object = model.clone(true);
        object.rotation.set(0.22, 0.38, index % 2 ? -0.16 : 0.16);
        group.add(object);
        group.scale.setScalar(item.size);
        group.visible = false;
        scene.add(group);
        item.group = group;
      });

      updatePositions();
      animate();
    },
    undefined,
    error => {
      console.warn("No se pudo cargar el objeto decorativo 3D:", error);
      renderer.dispose();
      host.remove();
    }
  );

  function updatePositions() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    renderer.setSize(viewportWidth, viewportHeight);
    camera.left = 0;
    camera.right = viewportWidth;
    camera.top = 0;
    camera.bottom = viewportHeight;
    camera.updateProjectionMatrix();

    placements.forEach(item => {
      if (!item.group || !item.element) return;
      const rect = item.element.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < viewportHeight;
      item.group.visible = visible;
      if (!visible) return;

      item.baseY = rect.top + rect.height * item.y;
      const margin = smallScreen ? 30 : 42;
      const x = Math.max(margin, Math.min(viewportWidth - margin, viewportWidth * item.x));
      item.group.position.set(x, item.baseY, 0);
    });
  }

  let scrollPosition = window.scrollY;
  let frame = 0;
  let positionFrame = 0;

  window.addEventListener("scroll", () => {
    scrollPosition = window.scrollY;
    if (!positionFrame) {
      positionFrame = requestAnimationFrame(() => {
        updatePositions();
        positionFrame = 0;
      });
    }
  }, { passive: true });

  window.addEventListener("resize", updatePositions, { passive: true });

  function animate() {
    frame += 0.012;
    const rotationFromScroll = scrollPosition * 0.0022;

    placements.forEach(item => {
      if (!item.group || !item.group.visible) return;
      item.group.rotation.x = item.phase + rotationFromScroll;
      item.group.rotation.y = Math.sin(frame * 0.55 + item.phase) * 0.18;
      item.group.rotation.z = Math.cos(frame * 0.42 + item.phase) * 0.07;
      item.group.position.y = item.baseY + Math.sin(frame + item.phase) * 8;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
}
