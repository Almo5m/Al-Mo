import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { onRobot, type RobotAction } from "./robotBus";

// إعدادات الإضاءة والكاميرا في مكان واحد عشان الضبط يبقى سهل
const STAGE = {
  model: "/models/almo-bot.glb",
  fov: 30,
  framing: 1.18, // أكبر = الروبوت أصغر في الكادر
  exposure: 1.05,
  envIntensity: 0.55,
  keyColor: 0xffe2b0,
  keyIntensity: 2.4,
  rimColor: 0xe3b04b,
  rimIntensity: 3.2,
};

// حركات بتشتغل مرة وترجع للـ Idle (Point بتثبت في آخرها لحد ما نقولها ترجع)
const ONE_SHOT = new Set(["Wave", "Point", "Success", "Error", "Surprised", "WakeUp"]);

export type RobotOptions = {
  lookAtCursor?: boolean; // الراس تتابع المؤشر
  ambient?: boolean; // الشرارة والحلقات تحت
  greet?: boolean; // يصحى ويسلّم أول ما يظهر
  listen?: boolean; // يسمع أحداث robotDo
  interactive?: boolean; // الضغط عليه بيفاجئه
  scrollHint?: boolean; // لو الزائر ساكت فوق، يشاور لتحت
};

export type RobotControl = {
  play(action: RobotAction): void;
  setWalking(walking: boolean): void;
  setFacing(radians: number): void;
  dispose(): void;
};

// الموديل بيتحمّل مرة واحدة وبيتشارك بين أي نسخة (الـ Hero وطريقة الشغل)
let modelPromise: Promise<GLTF> | null = null;
function loadModel(): Promise<GLTF> {
  if (!modelPromise) modelPromise = new GLTFLoader().loadAsync(STAGE.model);
  return modelPromise;
}

export async function createRobot(canvas: HTMLCanvasElement, opts: RobotOptions): Promise<RobotControl> {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gltf = await loadModel();

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = STAGE.exposure;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = STAGE.envIntensity;

  const key = new THREE.DirectionalLight(STAGE.keyColor, STAGE.keyIntensity);
  key.position.set(2.5, 3.5, 4);
  const rim = new THREE.DirectionalLight(STAGE.rimColor, STAGE.rimIntensity);
  rim.position.set(-3, 2.5, -3.5);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.25));

  const root = gltf.scene.clone(true);
  scene.add(root);

  // الكاميرا بتتظبط لوحدها على حجم الروبوت وشكل الكادر
  const camera = new THREE.PerspectiveCamera(STAGE.fov, 1, 0.1, 100);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  function resize() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const t = Math.tan(THREE.MathUtils.degToRad(STAGE.fov / 2));
    const dist = Math.max(size.y / 2 / t, size.x / 2 / (t * camera.aspect)) * STAGE.framing;
    camera.position.set(center.x, center.y + size.y * 0.04, center.z + dist);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ---- الحركات ----
  const mixer = new THREE.AnimationMixer(root);
  const act: Record<string, THREE.AnimationAction> = {};
  gltf.animations.forEach((clip: THREE.AnimationClip) => (act[clip.name] = mixer.clipAction(clip)));

  let main: THREE.AnimationAction | null = null;
  let afterFinish: string | null = null;
  let holdTimer = 0;

  function setMain(name: string) {
    const next = act[name];
    if (!next || next === main) return;
    clearTimeout(holdTimer);
    const loops = !ONE_SHOT.has(name);
    next.reset();
    next.setLoop(loops ? THREE.LoopRepeat : THREE.LoopOnce, loops ? Infinity : 1);
    next.clampWhenFinished = name === "Point";
    next.fadeIn(0.25).play();
    if (main) main.fadeOut(0.25);
    main = next;
  }
  mixer.addEventListener("finished", (e: { action: THREE.AnimationAction }) => {
    if (e.action !== main || e.action === act.Point) return;
    const next = afterFinish ?? "Idle";
    afterFinish = null;
    main = null;
    setMain(next);
  });

  function play(action: RobotAction) {
    afterFinish = null;
    if (action === "Talk") {
      setMain("Talk");
      holdTimer = window.setTimeout(() => setMain("Idle"), 4800); // 3 دورات كلام وبعدين يهدى
    } else {
      setMain(action);
    }
  }

  // ---- الراس تتابع المؤشر (إضافة فوق الحركة، مش بتتعارض معاها) ----
  const head = root.getObjectByName("Head");
  const lookQ = new THREE.Quaternion();
  const lookE = new THREE.Euler();
  let yaw = 0, pitch = 0, targetYaw = 0, targetPitch = 0;
  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5);
    const dy = (e.clientY - (r.top + r.height * 0.35)) / (window.innerHeight * 0.5);
    targetYaw = THREE.MathUtils.clamp(dx, -1, 1) * 0.65;
    targetPitch = THREE.MathUtils.clamp(dy, -1, 1) * 0.35;
  };
  if (opts.lookAtCursor && !reduced) window.addEventListener("pointermove", onPointer);

  let faceTarget = 0;
  let walking = false;

  // ---- البداية ----
  if (reduced) {
    // تقليل الحركة: وقفة ثابتة من غير تحريك
    act.Idle?.play();
    mixer.update(0);
  } else {
    if (opts.ambient !== false) {
      act.Sparkle?.play();
      act.Rings?.play();
    }
    if (opts.greet) {
      setMain("WakeUp");
      afterFinish = "Wave";
    } else {
      setMain("Idle");
    }
  }

  const offBus = opts.listen && !reduced ? onRobot(play) : () => {};
  const onDown = () => play("Surprised");
  if (opts.interactive && !reduced) canvas.addEventListener("pointerdown", onDown);

  // لو الزائر ساكت فوق بعد فترة، الرفيق يشاور لتحت
  let hintTimer = 0;
  const onScroll = () => {
    if (window.scrollY > 120 && main === act.Point) setMain("Idle");
  };
  if (opts.scrollHint && !reduced) {
    hintTimer = window.setTimeout(() => {
      if (window.scrollY < 80 && (main === act.Idle || main === null)) {
        setMain("Point");
        holdTimer = window.setTimeout(() => main === act.Point && setMain("Idle"), 5000);
      }
    }, 8000);
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ---- الرسم (بيقف لما الروبوت يطلع من الشاشة، وبيخفف نفسه لو الجهاز ضعيف) ----
  let raf = 0;
  let last = performance.now();
  let frames = 0;
  let acc = 0;
  let degraded = 0;

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    mixer.update(dt);

    root.rotation.y += (faceTarget - root.rotation.y) * 0.12;
    if (head && opts.lookAtCursor) {
      yaw += (targetYaw - yaw) * 0.08;
      pitch += (targetPitch - pitch) * 0.08;
      lookQ.setFromEuler(lookE.set(pitch, yaw, 0));
      head.quaternion.multiply(lookQ);
    }
    renderer.render(scene, camera);

    // شبكة الأمان: لو أقل من 28 إطار في الثانية، نخفف تدريجيًا
    frames++;
    acc += dt;
    if (acc > 2) {
      const fps = frames / acc;
      frames = 0;
      acc = 0;
      if (fps < 28 && degraded < 2) {
        degraded++;
        if (degraded === 1) {
          renderer.setPixelRatio(1);
          resize();
        } else {
          act.Sparkle?.stop();
          act.Rings?.stop();
        }
      }
    }
  };

  let io: IntersectionObserver | null = null;
  if (reduced) {
    renderer.render(scene, camera);
  } else {
    io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        last = performance.now();
        frames = 0;
        acc = 0;
        if (!raf) raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(canvas);
  }

  return {
    play,
    setWalking(w: boolean) {
      if (w === walking) return;
      walking = w;
      if (w) setMain("Walk");
      else if (main === act.Walk) setMain("Idle");
    },
    setFacing(rad: number) {
      faceTarget = rad;
    },
    dispose() {
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
      clearTimeout(hintTimer);
      io?.disconnect();
      ro.disconnect();
      offBus();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("pointerdown", onDown);
      mixer.stopAllAction();
      // الهندسة والخامات مشتركة بين النسخ فمش بنمسحها، بنمسح بس اللي بتاعنا
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
