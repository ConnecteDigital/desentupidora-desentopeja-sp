// Abertura 3D da home (gravada em vídeo, ver scripts/gravar-abertura.mjs).
// Roteiro: ralo do banheiro entupido, água suja voltando e borbulhando; a grelha sai,
// o cabo em espiral da máquina desentupidora entra girando, a água desce num redemoinho,
// a grelha volta e o piso desce, revelando o site por trás da cena.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';

export type IntroStage = 'leak' | 'fix' | 'ok';

export interface IntroCallbacks {
  onReady: () => void;
  onStage: (stage: IntroStage) => void;
  // Altura (px, do topo da tela) até onde o site já está revelado
  onReveal: (px: number) => void;
}

// Roteiro em segundos (os momentos das legendas ficam iguais em src/components/IntroVideo.astro)
export const T = {
  backup: 0.2, // água suja começa a voltar pelo ralo
  grateOff: 1.25, // grelha sai
  cableIn: 1.55, // cabo começa a entrar
  unclog: 2.35, // cabo chega no entupimento ("Desentope Já!")
  gulp: 2.75, // água começa a descer
  drained: 3.65, // ralo livre ("Atendimento 24 horas")
  cableOut: 3.7,
  grateBack: 4.05,
  pullBack: 4.1,
  descend: 5.0,
  end: 6.3,
};

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const phase = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Gerador pseudoaleatório com semente: cena sempre igual entre gravações
let seed = 0;
function rand() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function canvasTexture(size: number, draw: (g: CanvasRenderingContext2D, s: number) => void, srgb = false) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d')!, size);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Azulejos/porcelanato com rejunte. bump=true gera o relevo (rejunte escuro)
function tiles(g: CanvasRenderingContext2D, s: number, cols: number, base: [number, number, number], grout: string, groutPx: number, bump = false) {
  const step = s / cols;
  g.fillStyle = bump ? '#000' : grout;
  g.fillRect(0, 0, s, s);
  for (let y = 0; y < cols; y++) {
    for (let x = 0; x < cols; x++) {
      const v = bump ? 0 : (rand() - 0.5) * 10;
      g.fillStyle = bump ? '#fff' : `rgb(${base[0] + v},${base[1] + v},${base[2] + v})`;
      g.fillRect(x * step + groutPx / 2, y * step + groutPx / 2, step - groutPx, step - groutPx);
      if (!bump) {
        for (let k = 0; k < 6; k++) {
          g.strokeStyle = `rgba(255,255,255,${0.04 + rand() * 0.05})`;
          g.lineWidth = 1 + rand() * 3;
          g.beginPath();
          g.moveTo(x * step + rand() * step, y * step);
          g.bezierCurveTo(x * step + rand() * step, y * step + step * 0.4, x * step + rand() * step, y * step + step * 0.6, x * step + rand() * step, y * step + step);
          g.stroke();
        }
      }
    }
  }
}

// ---------- máquina desentupidora (carrinho vermelho com tambor) ----------
function buildMachine(red: THREE.Material, steel: THREE.Material, dark: THREE.Material, gray: THREE.Material) {
  const g = new THREE.Group();
  const tube = (pts: THREE.Vector3[], r = 0.022) =>
    new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1), 64, r, 12), red);
  // estrutura tubular em U dos dois lados
  for (const z of [-0.22, 0.22]) {
    g.add(
      tube([
        new THREE.Vector3(-0.32, 0.05, z),
        new THREE.Vector3(-0.3, 0.02, z),
        new THREE.Vector3(0.28, 0.02, z),
        new THREE.Vector3(0.32, 0.06, z),
        new THREE.Vector3(0.3, 0.7, z),
        new THREE.Vector3(0.24, 1.05, z),
      ]),
    );
  }
  // alça no alto
  g.add(tube([new THREE.Vector3(0.24, 1.05, -0.22), new THREE.Vector3(0.22, 1.12, 0), new THREE.Vector3(0.24, 1.05, 0.22)], 0.02));
  // travessas
  for (const [x, y] of [[-0.3, 0.03], [0.29, 0.4]]) {
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.44, 12), red);
    bar.rotation.x = Math.PI / 2;
    bar.position.set(x, y, 0);
    g.add(bar);
  }
  // tambor cinza (eixo de frente para o ralo, eixo X local)
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.34, 48), gray);
  drum.rotation.z = Math.PI / 2;
  drum.position.set(-0.02, 0.38, 0);
  g.add(drum);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.018, 10, 48), gray);
  rim.rotation.y = Math.PI / 2;
  rim.position.set(-0.19, 0.38, 0);
  g.add(rim);
  // furos do tambor
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), dark);
    hole.rotation.y = -Math.PI / 2;
    hole.position.set(-0.195, 0.38 + Math.sin(a) * 0.17, Math.cos(a) * 0.17);
    g.add(hole);
  }
  // motor preto em cima
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 32), dark);
  motor.rotation.x = Math.PI / 2;
  motor.position.set(0.05, 0.8, 0);
  const motorCap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 32), steel);
  motorCap.rotation.x = Math.PI / 2;
  motorCap.position.set(0.05, 0.8, 0.17);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.4), red);
  plate.position.set(0.02, 0.67, 0);
  g.add(motor, motorCap, plate);
  // guia de saída do cabo (na frente do tambor)
  const guide = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 16), steel);
  guide.rotation.z = Math.PI / 2;
  guide.position.set(-0.3, 0.38, 0);
  const guideBox = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.12), dark);
  guideBox.position.set(-0.24, 0.38, 0);
  g.add(guide, guideBox);
  // rodas
  for (const z of [-0.27, 0.27]) {
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.035, 14, 32), dark);
    tire.position.set(0.3, 0.12, z);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 20), gray);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(0.3, 0.12, z);
    g.add(tire, hub);
  }
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = o.receiveShadow = true;
  });
  return g;
}

export interface IntroOptions {
  record: { fps: number };
}

export function startIntro(canvas: HTMLCanvasElement, cb: IntroCallbacks, opts: IntroOptions) {
  const record = opts.record;
  const params = new URLSearchParams(location.search);
  // ?preview: sem desfoque de lente (gravação de teste mais rápida)
  const preview = params.has('preview');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    outputBufferType: THREE.HalfFloatType,
  });
  seed = 11;
  renderer.setPixelRatio(1);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0c0e);
  scene.fog = new THREE.FogExp2(0x0b0c0e, 0.06);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.03, 60);

  // ---------- luz ----------
  const key = new THREE.SpotLight(0xffe6c8, 60, 20, 0.65, 0.7, 1.6);
  key.position.set(1.6, 4.6, 2.4);
  key.target.position.set(0, 0, -0.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  const fill = new THREE.PointLight(0x9cc4ff, 4, 9, 1.6);
  fill.position.set(-2.2, 1.4, 1.8);
  scene.add(fill);
  const ceiling = new THREE.PointLight(0xfff4e6, 3, 12, 1.4);
  ceiling.position.set(-0.4, 3.6, 0.6);
  scene.add(ceiling);
  scene.add(new THREE.HemisphereLight(0xf2f5ff, 0x2a2622, 0.12));

  // tudo que desce no final fica dentro do "rig"
  const rig = new THREE.Group();
  scene.add(rig);

  const WALL_Z = -1.7;
  const HOLE = 0.34; // abertura quadrada do ralo

  // ---------- parede de azulejo ----------
  const wallMap = canvasTexture(512, (g, s) => tiles(g, s, 4, [198, 203, 209], '#80868d', 7), true);
  const wallBump = canvasTexture(512, (g, s) => tiles(g, s, 4, [0, 0, 0], '', 7, true));
  for (const tx of [wallMap, wallBump]) tx.repeat.set(40 / 2.4, 8 / 2.4);
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 8),
    new THREE.MeshStandardMaterial({ map: wallMap, bumpMap: wallBump, bumpScale: 1.2, roughness: 0.18 }),
  );
  wall.position.set(0, 4, WALL_Z);
  wall.receiveShadow = true;
  rig.add(wall);
  const skirting = new THREE.Mesh(new THREE.BoxGeometry(40, 0.16, 0.05), new THREE.MeshStandardMaterial({ color: 0xdfe3e8, roughness: 0.25 }));
  skirting.position.set(0, 0.08, WALL_Z + 0.025);
  skirting.receiveShadow = true;
  rig.add(skirting);

  // ---------- piso com o furo do ralo ----------
  const floorShape = new THREE.Shape();
  floorShape.moveTo(-20, -12);
  floorShape.lineTo(20, -12);
  floorShape.lineTo(20, 12);
  floorShape.lineTo(-20, 12);
  floorShape.lineTo(-20, -12);
  const holePath = new THREE.Path();
  const h = HOLE / 2;
  holePath.moveTo(-h, -h);
  holePath.lineTo(-h, h);
  holePath.lineTo(h, h);
  holePath.lineTo(h, -h);
  holePath.lineTo(-h, -h);
  floorShape.holes.push(holePath);
  const floorGeo = new THREE.ShapeGeometry(floorShape);
  const floorMap = canvasTexture(512, (g, s) => tiles(g, s, 2, [128, 124, 118], '#55514c', 5), true);
  const floorBump = canvasTexture(512, (g, s) => tiles(g, s, 2, [0, 0, 0], '', 5, true));
  // UV do ShapeGeometry = coordenadas em unidades: peças de 0,6 com o ralo no meio de uma peça
  for (const tx of [floorMap, floorBump]) {
    tx.repeat.set(1 / 1.2, 1 / 1.2);
    tx.offset.set(0.25, 0.25);
  }
  const floorMat = new THREE.MeshStandardMaterial({ map: floorMap, bumpMap: floorBump, bumpScale: 0.8, roughness: 0.42 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  rig.add(floor);

  // caixa do ralo (paredes escuras por dentro) e o cano no fundo
  const pit = new THREE.Mesh(
    new THREE.BoxGeometry(HOLE, 0.6, HOLE),
    new THREE.MeshStandardMaterial({ color: 0x2b2a27, roughness: 0.9, side: THREE.BackSide }),
  );
  pit.position.y = -0.3;
  pit.receiveShadow = true;
  rig.add(pit);
  const pipeHole = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32), new THREE.MeshBasicMaterial({ color: 0x050505 }));
  pipeHole.rotation.x = -Math.PI / 2;
  pipeHole.position.y = -0.595;
  rig.add(pipeHole);
  // moldura de inox em volta do furo
  const chrome = new THREE.MeshStandardMaterial({ color: 0xeef1f5, metalness: 1, roughness: 0.14 });
  for (const [x, z, w, d] of [
    [0, -h - 0.02, HOLE + 0.08, 0.04],
    [0, h + 0.02, HOLE + 0.08, 0.04],
    [-h - 0.02, 0, 0.04, HOLE],
    [h + 0.02, 0, 0.04, HOLE],
  ]) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, d), chrome);
    f.position.set(x, 0.006, z);
    f.receiveShadow = true;
    rig.add(f);
  }

  // grelha de inox com fendas (sai e volta)
  const grate = new THREE.Group();
  const slotMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 });
  const grateTop = new THREE.Mesh(new THREE.BoxGeometry(HOLE - 0.01, 0.014, HOLE - 0.01), chrome);
  grate.add(grateTop);
  for (let i = 0; i < 6; i++) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(HOLE - 0.09, 0.016, 0.022), slotMat);
    slot.position.z = -0.12 + i * 0.048;
    grate.add(slot);
  }
  grate.traverse((o) => ((o as THREE.Mesh).castShadow = (o as THREE.Mesh).receiveShadow = true));
  grate.position.y = 0.008;
  rig.add(grate);

  // ---------- água suja ----------
  // nível da água dentro da caixa do ralo
  const dirtyColor = new THREE.Color(0x5b4a33);
  const pitWater = new THREE.Mesh(
    new THREE.PlaneGeometry(HOLE, HOLE),
    new THREE.MeshStandardMaterial({ color: 0x3d3122, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.92 }),
  );
  pitWater.rotation.x = -Math.PI / 2;
  rig.add(pitWater);

  // poça no piso com redemoinho (textura girando quando a água desce)
  const swirlTex = canvasTexture(512, (g, s) => {
    g.fillStyle = 'rgb(92,76,54)';
    g.fillRect(0, 0, s, s);
    g.translate(s / 2, s / 2);
    for (let k = 0; k < 90; k++) {
      const a0 = rand() * Math.PI * 2;
      const r0 = 20 + rand() * (s / 2 - 30);
      g.strokeStyle = `rgba(${rand() < 0.5 ? '160,140,110' : '50,40,28'},${0.15 + rand() * 0.25})`;
      g.lineWidth = 2 + rand() * 6;
      g.beginPath();
      for (let j = 0; j <= 20; j++) {
        const a = a0 + j * 0.06;
        const r = r0 * (1 - j * 0.012);
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (j === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
  }, true);
  swirlTex.center.set(0.5, 0.5);
  const puddleMat = new THREE.MeshStandardMaterial({
    map: swirlTex,
    roughness: 0.04,
    metalness: 0.15,
    transparent: true,
    opacity: 0.8,
    alphaMap: canvasTexture(256, (g, s) => {
      const grad = g.createRadialGradient(s / 2, s / 2, s * 0.05, s / 2, s / 2, s / 2);
      grad.addColorStop(0, '#fff');
      grad.addColorStop(0.82, '#ddd');
      grad.addColorStop(1, '#000');
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
    }),
  });
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 96), puddleMat);
  puddle.rotation.x = -Math.PI / 2;
  puddle.position.set(0, 0.016, 0);
  puddle.receiveShadow = true;
  puddle.visible = false;
  rig.add(puddle);
  // borda irregular da poça: segunda camada mais clara, deslocada
  const puddleEdge = new THREE.Mesh(
    new THREE.CircleGeometry(1, 96),
    new THREE.MeshStandardMaterial({ color: 0x6b5a40, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35, depthWrite: false }),
  );
  puddleEdge.rotation.x = -Math.PI / 2;
  puddleEdge.position.set(0.12, 0.012, 0.18);
  puddleEdge.visible = false;
  rig.add(puddleEdge);

  // gotas/respingos de água suja e bolhas
  const waterMat = preview
    ? new THREE.MeshStandardMaterial({ color: 0x6d5a3e, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85 })
    : new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.03,
        transmission: 1,
        thickness: 0.06,
        ior: 1.33,
        attenuationColor: dirtyColor,
        attenuationDistance: 0.04,
        specularIntensity: 1,
        envMapIntensity: 1.5,
      });
  const MAX = 420;
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 10), waterMat, MAX);
  drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  drops.frustumCulled = false;
  rig.add(drops);
  const pos = new Float32Array(MAX * 3);
  const vel = new Float32Array(MAX * 3);
  const alive = new Uint8Array(MAX);
  const size = new Float32Array(MAX);

  const bubbleMat = preview
    ? new THREE.MeshStandardMaterial({ color: 0xb8a786, roughness: 0.02, metalness: 0.3, transparent: true, opacity: 0.55 })
    : new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.0,
        transmission: 1,
        thickness: 0.01,
        ior: 1.2,
        iridescence: 0.6,
        attenuationColor: new THREE.Color(0xc9b48c),
        attenuationDistance: 0.3,
        envMapIntensity: 2,
      });
  const BUB = 40;
  const bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), bubbleMat, BUB);
  bubbles.frustumCulled = false;
  rig.add(bubbles);
  const bub = Array.from({ length: BUB }, () => ({ x: 0, z: 0, life: -1, max: 0, s: 0 }));

  // ondinhas
  const RIPPLES = 16;
  const rippleGeo = new THREE.RingGeometry(0.94, 1, 48);
  const ripples: { mesh: THREE.Mesh; life: number; s: number }[] = [];
  for (let i = 0; i < RIPPLES; i++) {
    const m = new THREE.Mesh(rippleGeo, new THREE.MeshBasicMaterial({ color: 0xd8c8a8, transparent: true, opacity: 0, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.visible = false;
    rig.add(m);
    ripples.push({ mesh: m, life: -1, s: 0 });
  }
  let rippleNext = 0;
  function addRipple(x: number, z: number, s: number) {
    const r = ripples[rippleNext];
    rippleNext = (rippleNext + 1) % RIPPLES;
    r.life = 0;
    r.s = s;
    r.mesh.visible = true;
    r.mesh.position.set(x, 0.02, z);
  }

  // ---------- máquina e cabo em espiral ----------
  const red = new THREE.MeshStandardMaterial({ color: 0xc8140c, metalness: 0.25, roughness: 0.32 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xc3c9d1, metalness: 1, roughness: 0.28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x15171c, roughness: 0.7 });
  const gray = new THREE.MeshStandardMaterial({ color: 0x8d939b, metalness: 0.35, roughness: 0.45 });
  const machine = buildMachine(red, steel, dark, gray);
  // fica atrás e à direita do ralo, com a saída do cabo virada para ele
  const MACHINE_POS = new THREE.Vector3(1.05, 0, -0.85);
  machine.position.copy(MACHINE_POS);
  machine.rotation.y = Math.atan2(-MACHINE_POS.z, MACHINE_POS.x);
  rig.add(machine);
  machine.updateMatrixWorld(true);
  const outlet = new THREE.Vector3(-0.42, 0.38, 0);
  machine.localToWorld(outlet);
  rig.worldToLocal(outlet);

  // caminho do cabo: sai da máquina, faz uma barriga, entra no ralo e desce pelo cano
  const cablePath = new THREE.CatmullRomCurve3([
    outlet.clone(),
    outlet.clone().lerp(new THREE.Vector3(0, 0.3, 0), 0.45).add(new THREE.Vector3(0, 0.08, 0)),
    new THREE.Vector3(0.06, 0.22, -0.04),
    new THREE.Vector3(0, 0.02, 0),
    new THREE.Vector3(0, -0.4, 0),
    new THREE.Vector3(0.02, -1.4, 0.05),
  ]);
  const CABLE_LEN = cablePath.getLength();
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x8a6a45, metalness: 0.85, roughness: 0.35 });
  const cable = new THREE.Mesh(new THREE.BufferGeometry(), cableMat);
  cable.castShadow = true;
  cable.frustumCulled = false;
  rig.add(cable);
  // ponteira (cortador) na ponta do cabo
  const head = new THREE.Group();
  const headBody = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 0.08, 16), steel);
  head.add(headBody);
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.03, 0.008), steel);
    blade.rotation.y = (i / 3) * Math.PI;
    blade.position.y = -0.045;
    head.add(blade);
  }
  const headPivot = new THREE.Group();
  headPivot.add(head);
  headPivot.traverse((o) => ((o as THREE.Mesh).castShadow = true));
  rig.add(headPivot);

  const COIL_R = 0.02;
  const WIRE_R = 0.0075;
  const PITCH = 0.021;
  const frenetSteps = 1600;
  const frames = cablePath.computeFrenetFrames(frenetSteps, false);
  const coilPts: THREE.Vector3[] = [];
  const pTmp = new THREE.Vector3();
  function buildCable(visibleLen: number, spin: number) {
    cable.geometry.dispose();
    if (visibleLen < 0.02) {
      cable.geometry = new THREE.BufferGeometry();
      headPivot.visible = false;
      return;
    }
    coilPts.length = 0;
    const perTurn = 12;
    const turns = visibleLen / PITCH;
    const n = Math.max(8, Math.floor(turns * perTurn));
    for (let i = 0; i <= n; i++) {
      const L = (i / n) * visibleLen;
      const u = Math.min(1, L / CABLE_LEN);
      const fi = Math.min(frenetSteps, Math.round(u * frenetSteps));
      cablePath.getPointAt(u, pTmp);
      const a = (L / PITCH) * Math.PI * 2 + spin;
      const N = frames.normals[fi];
      const B = frames.binormals[fi];
      coilPts.push(
        new THREE.Vector3(
          pTmp.x + (N.x * Math.cos(a) + B.x * Math.sin(a)) * COIL_R,
          pTmp.y + (N.y * Math.cos(a) + B.y * Math.sin(a)) * COIL_R,
          pTmp.z + (N.z * Math.cos(a) + B.z * Math.sin(a)) * COIL_R,
        ),
      );
    }
    const curve = new THREE.CatmullRomCurve3(coilPts, false, 'catmullrom', 0.5);
    cable.geometry = new THREE.TubeGeometry(curve, n * 2, WIRE_R, 6, false);
    // ponteira na ponta, alinhada ao caminho
    const uTip = Math.min(1, visibleLen / CABLE_LEN);
    cablePath.getPointAt(uTip, pTmp);
    headPivot.position.copy(pTmp);
    const tan = cablePath.getTangentAt(uTip);
    headPivot.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), tan);
    head.rotation.y = spin;
    headPivot.visible = true;
  }

  // ---------- partículas ----------
  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const dir = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let cursor = 0;
  function freeSlot() {
    for (let k = 0; k < MAX; k++) {
      cursor = (cursor + 1) % MAX;
      if (!alive[cursor]) return cursor;
    }
    return -1;
  }
  // respingo saindo pelas fendas da grelha / pela boca do ralo
  function spawnSplash(i: number, strength: number) {
    pos[i * 3] = (rand() - 0.5) * (HOLE - 0.08);
    pos[i * 3 + 1] = 0.02;
    pos[i * 3 + 2] = (rand() - 0.5) * (HOLE - 0.08);
    const sp = (0.5 + rand() * 1.1) * strength;
    vel[i * 3] = pos[i * 3] * 3 + (rand() - 0.5) * 0.35;
    vel[i * 3 + 1] = sp;
    vel[i * 3 + 2] = pos[i * 3 + 2] * 3 + (rand() - 0.5) * 0.35;
    size[i] = rand() < 0.2 ? 0.014 + rand() * 0.012 : 0.005 + rand() * 0.008;
    alive[i] = 1;
  }

  // ---------- câmera ----------
  type Shot = { t: number; pos: THREE.Vector3; look: THREE.Vector3 };
  function shots(): Shot[] {
    const portrait = camera.aspect < 0.9;
    // plano final: ralo e máquina no quadro, encontro piso/parede a ~30% do topo
    const finalPos = portrait ? new THREE.Vector3(0.45, 0.95, 2.4) : new THREE.Vector3(0.45, 0.85, 2.2);
    const finalLook = portrait ? new THREE.Vector3(0.45, -0.35, -0.6) : new THREE.Vector3(0.45, -0.1, -0.6);
    return [
      { t: 0, pos: new THREE.Vector3(-0.62, 0.42, 0.7), look: new THREE.Vector3(0.02, 0.0, 0) },
      { t: 1.3, pos: new THREE.Vector3(0.35, 0.55, 0.85), look: new THREE.Vector3(0, 0.02, -0.02) },
      { t: 2.35, pos: new THREE.Vector3(0.95, 0.7, 0.9), look: new THREE.Vector3(0.12, 0.08, -0.12) },
      { t: 3.6, pos: new THREE.Vector3(0.5, 1.15, 1.6), look: new THREE.Vector3(0.15, 0.1, -0.3) },
      { t: 4.9, pos: finalPos, look: finalLook },
      { t: 99, pos: finalPos, look: finalLook },
    ];
  }
  let plan = shots();
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  function placeCamera(t: number, shake: number) {
    let i = 0;
    while (i < plan.length - 2 && t > plan[i + 1].t) i++;
    const a = plan[i];
    const b = plan[i + 1];
    const k = easeInOut(phase(t, a.t, b.t));
    camPos.lerpVectors(a.pos, b.pos, k);
    camLook.lerpVectors(a.look, b.look, k);
    const hand = 0.005;
    camPos.x += Math.sin(t * 2.1) * hand + (rand() - 0.5) * shake;
    camPos.y += Math.sin(t * 1.7 + 1) * hand + (rand() - 0.5) * shake;
    camera.position.copy(camPos);
    camera.lookAt(camLook);
  }
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = camera.aspect < 0.9 ? 58 : 42;
  camera.updateProjectionMatrix();
  plan = shots();

  // ---------- quadro ----------
  let elapsed = 0;
  let frames_ = 0;
  let splashAcc = 0;
  let bubbleAcc = 0;
  let spin = 0;
  let stage: IntroStage | '' = '';
  const projected = new THREE.Vector3();
  const bokeh = preview ? null : new BokehPass(scene, camera, { focus: 1.2, aperture: 0.009, maxblur: 0.012 });
  if (bokeh) renderer.setEffects([bokeh]);

  function setStage(s: IntroStage) {
    if (stage !== s) {
      stage = s;
      cb.onStage(s);
    }
  }

  function frame(render = true) {
    const dt = frames_++ === 0 ? 0 : 1 / record.fps;
    elapsed += dt;
    const t = elapsed;

    if (t > T.backup) setStage('leak');
    if (t > T.unclog) setStage('fix');
    if (t > T.drained) setStage('ok');

    // água voltando pelo ralo: forte no começo, para quando o cabo desentope
    const backflow = phase(t, T.backup, T.backup + 0.35) * (1 - smooth(phase(t, T.unclog, T.gulp + 0.2)));
    // descida da água
    const drain = smooth(phase(t, T.gulp, T.drained));

    // grelha: sai em arco para o lado e volta no fim
    const off = easeInOut(phase(t, T.grateOff, T.cableIn)) * (1 - easeInOut(phase(t, T.grateBack, T.grateBack + 0.45)));
    grate.position.set(-0.55 * off, 0.008 + Math.sin(off * Math.PI) * 0.22 + off * 0.004, 0.32 * off);
    grate.rotation.z = Math.sin(off * Math.PI) * 0.8;
    grate.rotation.y = off * 0.5;

    // cabo: entra girando, fica girando no entupimento e volta para a máquina
    const feed = easeOut(phase(t, T.cableIn, T.unclog)) * 0.88 + phase(t, T.unclog, T.drained) * 0.12;
    const retract = easeInOut(phase(t, T.cableOut, T.cableOut + 0.4));
    const visible = CABLE_LEN * Math.max(0, feed - retract * 1.05);
    const spinning = t > T.cableIn && t < T.cableOut + 0.4;
    spin += spinning ? dt * 38 : 0;
    buildCable(visible, spin);
    // tranco da máquina ao destravar o entupimento
    const kick = Math.max(0, Math.sin(phase(t, T.unclog, T.unclog + 0.45) * Math.PI * 3)) * (t < T.unclog + 0.45 ? 1 : 0);
    const shake = spinning ? 0.0018 + kick * 0.004 : 0;
    machine.position.x = MACHINE_POS.x + (spinning ? (rand() - 0.5) * 0.004 : 0);

    // nível da água na caixa do ralo
    pitWater.position.y = -0.004 - drain * 0.36;
    pitWater.visible = pitWater.position.y > -0.55;

    // poça cresce enquanto volta água, depois some num redemoinho
    const wet = clamp01((t - T.backup - 0.15) * 0.6);
    const radius = (0.22 + wet * 0.85) * (1 - drain * 0.97);
    puddle.scale.set(radius, radius * 0.92, 1);
    puddle.visible = radius > 0.03;
    puddleEdge.scale.set(radius * 0.8, radius * 0.65, 1);
    puddleEdge.position.set(0.12 * (1 - drain), 0.012, 0.16 * (1 - drain));
    puddleEdge.visible = puddle.visible;
    swirlTex.rotation += dt * (0.25 + drain * 9 * (1 - drain * 0.6));
    puddleMat.opacity = 0.82 - drain * 0.3;
    floorMat.roughness = 0.42 - Math.min(wet, 1 - drain * 0.8) * 0.3;

    placeCamera(t, shake);

    // respingos subindo pelo ralo
    splashAcc += dt * 160 * backflow;
    while (splashAcc >= 1) {
      splashAcc -= 1;
      const i = freeSlot();
      if (i >= 0) spawnSplash(i, 0.55 + backflow * 0.6);
    }
    for (let i = 0; i < MAX; i++) {
      if (!alive[i]) {
        dummy.position.set(0, -50, 0);
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        drops.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const ix = i * 3;
      vel[ix + 1] -= 9.8 * dt;
      pos[ix] += vel[ix] * dt;
      pos[ix + 1] += vel[ix + 1] * dt;
      pos[ix + 2] += vel[ix + 2] * dt;
      if (pos[ix + 1] <= 0.016 && vel[ix + 1] < 0) {
        if (size[i] > 0.01 && rand() < 0.6) addRipple(pos[ix], pos[ix + 2], 0.03 + size[i] * 3);
        alive[i] = 0;
        continue;
      }
      dir.set(vel[ix], vel[ix + 1], vel[ix + 2]);
      const sp = dir.length();
      dummy.position.set(pos[ix], pos[ix + 1], pos[ix + 2]);
      if (sp > 0.001) dummy.quaternion.setFromUnitVectors(up, dir.divideScalar(sp));
      const s = size[i];
      dummy.scale.set(s, s * (1 + Math.min(sp * 0.6, 2.5)), s);
      dummy.updateMatrix();
      drops.setMatrixAt(i, dummy.matrix);
    }
    drops.instanceMatrix.needsUpdate = true;

    // bolhas na poça (esgoto "gorgolejando")
    bubbleAcc += dt * 22 * backflow;
    while (bubbleAcc >= 1) {
      bubbleAcc -= 1;
      const b = bub.find((x) => x.life < 0);
      if (b) {
        const a = rand() * Math.PI * 2;
        const r = rand() * Math.max(0.05, radius * 0.6);
        b.x = Math.cos(a) * r;
        b.z = Math.sin(a) * r;
        b.life = 0;
        b.max = 0.35 + rand() * 0.5;
        b.s = 0.012 + rand() * 0.03;
      }
    }
    for (let i = 0; i < BUB; i++) {
      const b = bub[i];
      if (b.life >= 0) b.life += dt;
      if (b.life < 0 || b.life > b.max) {
        if (b.life > b.max) {
          addRipple(b.x, b.z, b.s * 2.2);
          b.life = -1;
        }
        dummy.position.set(0, -50, 0);
        dummy.scale.setScalar(0);
      } else {
        const k = b.life / b.max;
        const s = b.s * Math.min(1, k * 4);
        dummy.position.set(b.x, 0.016, b.z);
        dummy.quaternion.identity();
        dummy.scale.set(s, s * 0.8, s);
      }
      dummy.updateMatrix();
      bubbles.setMatrixAt(i, dummy.matrix);
    }
    bubbles.instanceMatrix.needsUpdate = true;

    for (const r of ripples) {
      if (r.life < 0) continue;
      r.life += dt;
      const k = r.life / 0.7;
      if (k >= 1) {
        r.life = -1;
        r.mesh.visible = false;
        continue;
      }
      const s = r.s * (0.3 + k * 2.2);
      r.mesh.scale.set(s, s, 1);
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.22;
    }

    // piso desce no fim, revelando o site por cima
    const fall = easeInOut(phase(t, T.descend, T.end));
    rig.position.y = -fall * 6;

    if (render) {
      if (bokeh) {
        tmp.set(0.05, rig.position.y + 0.05, -0.05);
        (bokeh.uniforms as { focus: THREE.IUniform<number> }).focus.value = camera.position.distanceTo(tmp);
      }
      renderer.render(scene, camera);
    }

    // linha de revelação: topo do rodapé (encontro do piso com a parede) projetado na tela
    if (t > T.descend - 0.05) {
      projected.set(0, rig.position.y + 0.16, WALL_Z + 0.05).project(camera);
      cb.onReveal(Math.max(0, (1 - (projected.y * 0.5 + 0.5)) * window.innerHeight));
    }
  }

  async function prepare() {
    grate.position.y = 0.2;
    puddle.visible = puddleEdge.visible = true;
    for (const r of ripples) r.mesh.visible = true;
    buildCable(CABLE_LEN * 0.5, 0);
    placeCamera(0, 0);
    try {
      await renderer.compileAsync(scene, camera);
    } catch {
      /* compila no primeiro quadro */
    }
    renderer.render(scene, camera);
    for (const r of ripples) r.mesh.visible = false;
    buildCable(0, 0);
    (window as unknown as { __introRecord: unknown }).__introRecord = {
      step: (render = true) => {
        frame(render);
        return { t: elapsed, done: elapsed >= T.end };
      },
      end: T.end,
    };
    cb.onReady();
  }
  prepare();
}
