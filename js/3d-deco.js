import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

const host = document.querySelector("#deco-3d-layer");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const smallScreen = window.matchMedia("(max-width: 760px)").matches;

if (host && !reducedMotion) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, innerWidth, 0, innerHeight, 0.1, 2000);
  camera.position.z = 1000;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.45));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
  keyLight.position.set(-3, 5, 8);
  scene.add(keyLight);
  const redFill = new THREE.PointLight(0xD12244, 1.1, 460);
  redFill.position.set(0, 0, 160);
  scene.add(redFill);

  const placements = [
    { selector: ".hero", x: 0.91, y: 0.88, size: 54, phase: 0.35 },
    { selector: ".updates-section", x: 0.92, y: 0.2, size: 48, phase: 1.7 },
    { selector: ".projects-section", x: 0.08, y: 0.76, size: 58, phase: 2.6 },
    { selector: ".values-section", x: 0.92, y: 0.22, size: 52, phase: 3.9 },
    { selector: ".goals-section", x: 0.9, y: 0.72, size: 46, phase: 5.1 }
  ].map(item => ({ ...item, element: document.querySelector(item.selector), group: null, baseY: 0 }));

  if (smallScreen) placements.forEach(item => { item.size *= 0.72; });

  new OBJLoader().load("assets/U-deco-3D.obj", model => {
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const dimensions = bounds.getSize(new THREE.Vector3());
    const maxDimension = Math.max(dimensions.x, dimensions.y, dimensions.z) || 1;
    model.position.sub(center);
    model.scale.setScalar(1 / maxDimension);

    const material = new THREE.MeshStandardMaterial({
      color: 0xCC092F, metalness: 0.2, roughness: 0.36, side: THREE.DoubleSide
    });
    model.traverse(child => {
      if (!child.isMesh) return;
      child.material = material;
      child.geometry.computeVertexNormals();
    });

    placements.forEach(item => {
      if (!item.element) return;
      const group = new THREE.Group();
      const object = model.clone(true);
      object.rotation.set(0.22, 0.38, 0.12);
      group.add(object);
      group.scale.setScalar(item.size);
      group.visible = false;
      scene.add(group);
      item.group = group;
    });
    updatePositions();
    render();
  }, undefined, error => {
    console.warn("No se pudo cargar el objeto decorativo 3D:", error);
    renderer.dispose();
    host.remove();
  });

  function updatePositions() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h);
    camera.left = 0; camera.right = w; camera.top = 0; camera.bottom = h;
    camera.updateProjectionMatrix();
    placements.forEach(item => {
      if (!item.group || !item.element) return;
      const rect = item.element.getBoundingClientRect();
      item.group.visible = rect.bottom > 0 && rect.top < h;
      if (!item.group.visible) return;
      item.baseY = rect.top + rect.height * item.y;
      const margin = smallScreen ? 34 : 48;
      item.group.position.set(Math.max(margin, Math.min(w - margin, w * item.x)), item.baseY, 0);
    });
  }

  let scrollPosition = window.scrollY;
  let updateFrame = 0;
  window.addEventListener("scroll", () => {
    scrollPosition = window.scrollY;
    if (!updateFrame) updateFrame = requestAnimationFrame(() => { updatePositions(); updateFrame = 0; });
  }, { passive: true });
  window.addEventListener("resize", updatePositions, { passive: true });

  function render() {
    const scrollRotation = scrollPosition * 0.0022;
    placements.forEach(item => {
      if (!item.group || !item.group.visible) return;
      // El objeto permanece fijo: el único movimiento es la rotación en X ligada al scroll.
      item.group.rotation.x = item.phase + scrollRotation;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
}
