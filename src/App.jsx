import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GradientText } from './components/GradientText.jsx';

const chapters = [
  ['01 / INTRO', <>SOUND.<br />SCULPTED.</>, 'Знаковый дизайн. Настоящая текстурированная 3D-модель.'],
  ['02 / DESIGN', <>DESIGNED<br />TO FEEL.</>, 'Плавный поворот открывает форму чашек и оголовья.'],
  ['03 / EXPLODED', <>EVERY<br />DETAIL.</>, 'Отдельные компоненты расходятся в пространстве.'],
  ['04 / ENGINEERING', <>INSIDE<br />THE SOUND.</>, 'Рассмотри конструкцию в разборе.'],
  ['05 / REASSEMBLY', <>ONE<br />COMPLETE FORM.</>, 'Детали собираются обратно в целый продукт.'],
];
const offsets = {
  left: [-3.4, -0.6, 0], right: [3.4, -0.6, 0],
  left_pad: [-5, -1.4, 3.2], right_pad: [5, -1.4, 3.2], headband: [0, 4.3, 0],
};
const smooth = (a, b, value) => {
  const x = THREE.MathUtils.clamp((value - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

function AirpodsScene({ canvasRef, progressRef, setLoadError }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    scene.add(new THREE.HemisphereLight(0xcbe5ff, 0x142633, 2.7));
    const key = new THREE.DirectionalLight(0xffffff, 5);
    key.position.set(-10, 15, 25);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x78b8ef, 4);
    rim.position.set(10, 8, -18);
    scene.add(rim);
    const root = new THREE.Group();
    scene.add(root);
    let parts = {};
    let disposed = false;
    let model;
    const loader = new GLTFLoader();
    loader.load('/scene.gltf', (gltf) => {
      if (disposed) {
        gltf.scene.traverse((object) => {
          if (object.isMesh) {
            object.geometry.dispose();
            for (const material of [].concat(object.material)) material.dispose();
          }
        });
        return;
      }
      model = gltf.scene;
      model.traverse((object) => {
        if (!object.isMesh) return;
        parts[object.name] = object;
        for (const material of [].concat(object.material)) material.side = THREE.DoubleSide;
      });
      root.add(model);
      setLoadError(false);
    }, undefined, () => setLoadError(true));

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    const frame = () => {
      if (disposed) return;
      const p = progressRef.current;
      const explode = smooth(0.3, 0.55, p) * (1 - smooth(0.72, 0.94, p));
      Object.entries(parts).forEach(([name, object]) => {
        const offset = offsets[name] || [0, 0, 0];
        object.position.set(offset[0] * explode, offset[1] * explode, offset[2] * explode);
      });
      root.rotation.y = -0.35 + smooth(0.08, 0.3, p) * 1.25 + explode * 0.25;
      root.rotation.x = 0.05 + explode * 0.14;
      root.scale.setScalar(0.39);
      root.position.set(window.innerWidth < 750 ? 1.4 : 3.2, -1.3, 0);
      camera.position.set(0, 0, window.innerWidth < 750 ? 22 : 19);
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
    };
    window.addEventListener('resize', resize);
    resize();
    rafId = requestAnimationFrame(frame);
    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
      model?.traverse((object) => {
        if (!object.isMesh) return;
        object.geometry.dispose();
        for (const material of [].concat(object.material)) {
          for (const value of Object.values(material)) if (value?.isTexture) value.dispose();
          material.dispose();
        }
      });
    };
  }, [canvasRef, progressRef, setLoadError]);
  return null;
}

export default function App() {
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const experienceRef = useRef(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const chapter = chapters[chapterIndex];

  useEffect(() => {
    let ticking = false;
    const update = () => {
      if (!experienceRef.current) return;
      const element = experienceRef.current;
      const range = element.offsetHeight - window.innerHeight;
      const progress = THREE.MathUtils.clamp(-element.getBoundingClientRect().top / range, 0, 1);
      progressRef.current += (progress - progressRef.current) * 0.24;
      setChapterIndex(Math.min(4, Math.floor(progress * 5)));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <header className="nav">
        <a href="/"><b>FORM—LAB.</b></a>
        <a href="/#work">ВСЕ ПРОЕКТЫ ↗</a>
      </header>
      <section className="experience" id="experience" ref={experienceRef}>
        <div className="sticky">
          <div className="ambient-glow" aria-hidden="true" />
          <canvas ref={canvasRef} aria-label="Интерактивная 3D-модель AirPods Max" />
          <AirpodsScene canvasRef={canvasRef} progressRef={progressRef} setLoadError={setLoadError} />
          <div className="copy">
            <div className="eyebrow">{chapter[0]}</div>
            <h1><GradientText animationSpeed={5} showBorder={false} className="chapter-title">{chapter[1]}</GradientText></h1>
            <p>{loadError ? 'Не удалось загрузить 3D-модель. Обнови страницу или проверь соединение.' : chapter[2]}</p>
            <a className="buy" href="https://www.apple.com/airpods-max/" target="_blank" rel="noreferrer">КУПИТЬ ↗</a>
          </div>
          <div className="hint">SCROLL TO EXPLODE ↓</div>
        </div>
      </section>
      <section className="below" id="work">
        <div className="eyebrow">APPLE / AIRPODS MAX</div>
        <h2>DESIGN<br />TO FEEL.</h2>
        <p>В этой версии используется текстурированная модель AirPods Max от DJM. Детали отделены по связным компонентам исходной геометрии. Это художественная анимация, а не инженерная схема устройства.</p>
        <h3>FAQ</h3>
        <details><summary>Это официальный сайт Apple?</summary><p>Нет, независимый дизайн-концепт FORM—LAB.</p></details>
        <details><summary>Можно купить наушники?</summary><p>Кнопка ведёт на официальный сайт Apple.</p></details>
        <p className="credit">3D model: <a href="https://sketchfab.com/3d-models/airpods-max-3400db28f6da41d08304ff20b29c3883">AirPods Max by DJM</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Model adapted for animation.</p>
      </section>
    </>
  );
}

