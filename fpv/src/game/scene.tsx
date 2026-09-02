import { useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { WATER_LEVEL, WORLD } from "./constants";
import { flushHud, useHud } from "./hud-store";
import {
  buildApcGeometry,
  buildBarrelGeometry,
  buildPickupGeometry,
  buildRubbleGeometry,
  buildRuinGeometry,
  buildSandbagGeometry,
  buildSoldierGeometry,
  buildTankGeometry,
  buildTruckGeometry,
} from "./models";
import { getQuality } from "./quality";
import { cinematicPose, sim, step, tickAudio } from "./sim";
import {
  buildTerrainGeometry,
  makeCobbleMaps,
  scatterBarrels,
  scatterBuildings,
  scatterPickups,
  scatterPuddles,
  scatterRubble,
  scatterSandbags,
  scatterTrees,
} from "./terrain";
import { unitScale, type UnitKind } from "./units";

const _dummy = new THREE.Object3D();
const _shake = new THREE.Vector3();
const QUALITY = getQuality();
let rainEnv: THREE.Texture | null | undefined;

function useRainEnv() {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    if (!QUALITY.cobblePbr) return null;
    if (rainEnv !== undefined) return rainEnv;
    const pmrem = new THREE.PMREMGenerator(gl);
    const sc = new THREE.Scene();
    sc.background = new THREE.Color("#3c3c44");
    sc.add(new THREE.HemisphereLight(0xc4c6ce, 0x1a1816, 1.15));
    const key = new THREE.DirectionalLight(0xf0ece4, 0.9);
    key.position.set(4, 8, 2);
    sc.add(key);
    rainEnv = pmrem.fromScene(sc, 0.04).texture;
    pmrem.dispose();
    return rainEnv;
  }, [gl]);
}

function useWireframe(ref: RefObject<THREE.Material | null>, on: boolean) {
  useEffect(() => {
    const m = ref.current;
    if (m && "wireframe" in m) (m as THREE.MeshLambertMaterial).wireframe = on;
  }, [ref, on]);
}

function TerrainMesh({ wireframe }: { wireframe: boolean }) {
  const geo = useMemo(() => buildTerrainGeometry(QUALITY.terrainSegments), []);
  const maps = useMemo(() => makeCobbleMaps(), []);
  const env = useRainEnv();
  const matRef = useRef<THREE.MeshLambertMaterial | THREE.MeshStandardMaterial>(null);
  useWireframe(matRef, wireframe);
  useEffect(
    () => () => {
      geo.dispose();
      maps.map.dispose();
      maps.normalMap?.dispose();
      maps.roughnessMap?.dispose();
    },
    [geo, maps],
  );
  return (
    <mesh geometry={geo} frustumCulled={false}>
      {QUALITY.cobblePbr && maps.normalMap && maps.roughnessMap ? (
        <meshStandardMaterial
          ref={matRef}
          map={maps.map}
          normalMap={maps.normalMap}
          roughnessMap={maps.roughnessMap}
          envMap={env}
          vertexColors
          roughness={1}
          metalness={0.08}
          envMapIntensity={0.55}
          normalScale={[1.55, 1.55]}
          precision={QUALITY.precision}
        />
      ) : (
        <meshLambertMaterial
          ref={matRef}
          map={maps.map}
          vertexColors
          flatShading
          precision={QUALITY.precision}
        />
      )}
    </mesh>
  );
}

function Water({ night, wireframe }: { night: boolean; wireframe: boolean }) {
  const matRef = useRef<THREE.MeshLambertMaterial>(null);
  useWireframe(matRef, wireframe);
  const opaque = QUALITY.mobile;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_LEVEL, 0]}>
      <planeGeometry args={[WORLD * (opaque ? 0.72 : 0.98), WORLD * (opaque ? 0.72 : 0.98), 1, 1]} />
      <meshLambertMaterial
        ref={matRef}
        color={night ? "#050506" : "#0a0b0e"}
        transparent={!opaque}
        opacity={opaque ? 1 : 0.82}
        depthWrite={opaque}
        precision={QUALITY.precision}
      />
    </mesh>
  );
}

function DeadPoles({ wireframe }: { wireframe: boolean }) {
  const trees = useMemo(() => scatterTrees(), []);
  const ref = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshLambertMaterial>(null);
  const geo = useMemo(() => new THREE.CylinderGeometry(0.14, 0.22, 1, QUALITY.mobile ? 4 : 5), []);
  useWireframe(matRef, wireframe);
  useEffect(() => () => geo.dispose(), [geo]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < trees.length; i++) {
      const t = trees[i];
      const th = 2.4 * t.sy;
      _dummy.position.set(t.x, t.y + th * 0.5, t.z);
      _dummy.rotation.set(0.08 * (i % 3), t.r, 0.04);
      _dummy.scale.set(t.sx, th, t.sz);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.count = trees.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [trees]);
  if (!trees.length) return null;
  return (
    <instancedMesh ref={ref} args={[geo, undefined, trees.length]}>
      <meshLambertMaterial ref={matRef} color="#1c1c1a" flatShading precision={QUALITY.precision} />
    </instancedMesh>
  );
}

function CityRuins({ wireframe }: { wireframe: boolean }) {
  const matRef = useRef<THREE.MeshLambertMaterial>(null);
  useWireframe(matRef, wireframe);
  const geo = useMemo(() => {
    const buildings = scatterBuildings();
    const variants = [0, 1, 2, 3].map((v) => buildRuinGeometry(v));
    const parts: THREE.BufferGeometry[] = [];
    for (const b of buildings) {
      const g = variants[b.variant].clone();
      g.rotateY(b.rot);
      g.translate(b.x, b.y, b.z);
      parts.push(g);
    }
    const merged = mergeGeometries(parts, false);
    for (const g of parts) g.dispose();
    for (const g of variants) g.dispose();
    if (!merged) throw new Error("city merge failed");
    merged.computeVertexNormals();
    merged.computeBoundingBox();
    merged.computeBoundingSphere();
    return merged;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} frustumCulled={false}>
      <meshLambertMaterial ref={matRef} vertexColors flatShading precision={QUALITY.precision} />
    </mesh>
  );
}

function InstancedProps({
  items,
  geo,
  color,
  wireframe,
  yOff = 0,
}: {
  items: { x: number; y: number; z: number; sx: number; sy: number; sz: number; r: number }[];
  geo: THREE.BufferGeometry;
  color?: string;
  wireframe: boolean;
  yOff?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshLambertMaterial>(null);
  useWireframe(matRef, wireframe);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < items.length; i++) {
      const t = items[i];
      _dummy.position.set(t.x, t.y + yOff, t.z);
      _dummy.rotation.set(0, t.r, 0);
      _dummy.scale.set(t.sx, t.sy, t.sz);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.count = items.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items, yOff]);
  if (!items.length) return null;
  return (
    <instancedMesh ref={ref} args={[geo, undefined, items.length]}>
      {color ? (
        <meshLambertMaterial ref={matRef} color={color} flatShading precision={QUALITY.precision} />
      ) : (
        <meshLambertMaterial ref={matRef} vertexColors flatShading precision={QUALITY.precision} />
      )}
    </instancedMesh>
  );
}

function StreetProps({ wireframe }: { wireframe: boolean }) {
  const bags = useMemo(() => scatterSandbags(), []);
  const barrels = useMemo(() => scatterBarrels(), []);
  const rubble = useMemo(() => scatterRubble(), []);
  const pickups = useMemo(() => scatterPickups(), []);
  const bagGeo = useMemo(() => buildSandbagGeometry(), []);
  const barrelGeo = useMemo(() => buildBarrelGeometry(), []);
  const rubbleGeo = useMemo(() => buildRubbleGeometry(), []);
  const pickupGeo = useMemo(() => buildPickupGeometry(), []);
  useEffect(
    () => () => {
      bagGeo.dispose();
      barrelGeo.dispose();
      rubbleGeo.dispose();
      pickupGeo.dispose();
    },
    [bagGeo, barrelGeo, rubbleGeo, pickupGeo],
  );
  return (
    <group>
      <InstancedProps items={bags} geo={bagGeo} wireframe={wireframe} />
      <InstancedProps items={barrels} geo={barrelGeo} wireframe={wireframe} />
      <InstancedProps items={rubble} geo={rubbleGeo} wireframe={wireframe} />
      <InstancedProps items={pickups} geo={pickupGeo} wireframe={wireframe} />
      <Puddles />
    </group>
  );
}

function Puddles() {
  const env = useRainEnv();
  const items = useMemo(() => scatterPuddles(), []);
  const geo = useMemo(() => {
    if (!items.length) return null;
    const base = new THREE.CircleGeometry(1, QUALITY.mobile ? 8 : 14);
    base.rotateX(-Math.PI / 2);
    const parts: THREE.BufferGeometry[] = [];
    for (const t of items) {
      const g = base.clone();
      g.scale(t.sx, 1, t.sz);
      g.rotateY(t.r);
      g.translate(t.x, t.y, t.z);
      parts.push(g);
    }
    const merged = mergeGeometries(parts, false);
    for (const g of parts) g.dispose();
    base.dispose();
    if (merged) {
      merged.computeBoundingSphere();
    }
    return merged;
  }, [items]);
  useEffect(() => () => geo?.dispose(), [geo]);
  if (!geo) return null;
  return (
    <mesh geometry={geo} frustumCulled={false} renderOrder={1}>
      {QUALITY.cobblePbr ? (
        <meshStandardMaterial
          color="#07090c"
          roughness={0.12}
          metalness={0.42}
          envMap={env}
          envMapIntensity={0.85}
          transparent
          opacity={0.72}
          depthWrite={false}
          precision={QUALITY.precision}
        />
      ) : (
        <meshLambertMaterial color="#07090c" precision={QUALITY.precision} />
      )}
    </mesh>
  );
}

function SkyDome({ night }: { night: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 20, 12);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = Math.max(0, Math.min(1, y * 0.5 + 0.5));
      if (night) {
        const v = 0.018 + t * 0.03;
        col[i * 3] = v;
        col[i * 3 + 1] = v;
        col[i * 3 + 2] = v + 0.01;
      } else {
        const h = 0.34 - t * 0.14;
        col[i * 3] = h * 0.94;
        col[i * 3 + 1] = h * 0.94;
        col[i * 3 + 2] = h;
      }
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [night]);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(({ camera }) => {
    const m = ref.current;
    if (!m) return;
    m.position.copy(camera.position);
    m.scale.setScalar(QUALITY.far * 0.86);
  });
  return (
    <mesh ref={ref} geometry={geo} frustumCulled={false} renderOrder={-2}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
}

function Rain() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = QUALITY.rain;
  const geo = useMemo(() => {
    const g = new THREE.BoxGeometry(0.03, 1.45, 0.03);
    g.rotateX(0.18);
    g.rotateZ(0.05);
    return g;
  }, []);
  const drops = useMemo(() => {
    const out = [];
    for (let i = 0; i < n; i++) {
      out.push({
        ox: (Math.sin(i * 12.9898) * 43758.5453) % 1,
        oz: (Math.sin(i * 78.233) * 23421.631) % 1,
        y: (i * 13.7) % 48,
        s: 0.7 + (i % 5) * 0.12,
      });
    }
    return out;
  }, [n]);
  useEffect(() => () => geo.dispose(), [geo]);
  const skip = useRef(0);
  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < n; i++) {
      const d = drops[i];
      d.y -= dt * 34 * d.s;
      if (d.y < -8) d.y += 48;
    }
    if (QUALITY.mobile) {
      skip.current += 1;
      if (skip.current % 2 === 1) return;
    }
    const cx = sim.phase === "brief" ? 8 : sim.x;
    const cz = sim.phase === "brief" ? 12 : sim.z;
    const cy = sim.phase === "brief" ? 28 : sim.y;
    for (let i = 0; i < n; i++) {
      const d = drops[i];
      const ox = (d.ox - 0.5) * 90;
      const oz = (d.oz - 0.5) * 90;
      _dummy.position.set(cx + ox, cy - 12 + d.y, cz + oz);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.set(1, d.s, 1);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  if (n <= 0) return null;
  return (
    <instancedMesh ref={ref} args={[geo, undefined, n]} frustumCulled={false}>
      <meshBasicMaterial color="#b4b6ba" transparent opacity={0.34} depthWrite={false} />
    </instancedMesh>
  );
}

function UnitLayer({
  kind,
  geo,
  indices,
  wireframe,
}: {
  kind: UnitKind;
  geo: THREE.BufferGeometry;
  indices: number[];
  wireframe: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshLambertMaterial>(null);
  const scale = unitScale(kind);
  useWireframe(matRef, wireframe);
  function writeMatrices(mesh: THREE.InstancedMesh) {
    for (let i = 0; i < indices.length; i++) {
      const u = sim.units[indices[i]];
      if (!u) {
        _dummy.scale.setScalar(0);
      } else if (!u.alive) {
        if (kind === "infantry") {
          _dummy.position.set(u.x, u.y, u.z);
          _dummy.rotation.set(0, u.yaw, 0);
          _dummy.scale.setScalar(0);
        } else {
          _dummy.position.set(u.x, u.y + 0.4, u.z);
          _dummy.rotation.set(0.55, u.yaw, 1.15);
          _dummy.scale.setScalar(scale);
        }
      } else {
        _dummy.position.set(u.x, u.y, u.z);
        _dummy.rotation.set(0, u.yaw, 0);
        _dummy.scale.setScalar(scale);
      }
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (mesh) writeMatrices(mesh);
  }, [indices, scale]);
  useFrame(() => {
    const mesh = meshRef.current;
    if (mesh) writeMatrices(mesh);
  });
  if (!indices.length) return null;
  return (
    <instancedMesh ref={meshRef} args={[geo, undefined, indices.length]} frustumCulled={false}>
      <meshLambertMaterial ref={matRef} vertexColors flatShading precision={QUALITY.precision} />
    </instancedMesh>
  );
}

function Contacts() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.OctahedronGeometry(1.2, 0), []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const n = sim.units.length;
    for (let i = 0; i < n; i++) {
      const u = sim.units[i];
      if (!u || !u.alive) {
        _dummy.scale.setScalar(0);
      } else {
        _dummy.position.set(u.x, u.y + (u.kind === "infantry" ? 5.6 : 4.2), u.z);
        _dummy.rotation.set(0, 0, 0);
        _dummy.scale.setScalar(u.kind === "infantry" ? 1 : 1.4);
      }
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  const n = sim.units.length;
  if (!n) return null;
  return (
    <instancedMesh ref={meshRef} args={[geo, undefined, n]} frustumCulled={false}>
      <meshBasicMaterial color="#c41e1e" />
    </instancedMesh>
  );
}

function Enemies({ wireframe }: { wireframe: boolean }) {
  const soldierGeo = useMemo(() => buildSoldierGeometry(), []);
  const tankGeo = useMemo(() => buildTankGeometry(), []);
  const apcGeo = useMemo(() => buildApcGeometry(), []);
  const truckGeo = useMemo(() => buildTruckGeometry(), []);
  useEffect(
    () => () => {
      soldierGeo.dispose();
      tankGeo.dispose();
      apcGeo.dispose();
      truckGeo.dispose();
    },
    [soldierGeo, tankGeo, apcGeo, truckGeo],
  );
  const groups = useMemo(() => {
    const infantry: number[] = [];
    const tank: number[] = [];
    const apc: number[] = [];
    const truck: number[] = [];
    sim.units.forEach((u, i) => {
      if (u.kind === "infantry") infantry.push(i);
      else if (u.kind === "tank") tank.push(i);
      else if (u.kind === "apc") apc.push(i);
      else truck.push(i);
    });
    return { infantry, tank, apc, truck };
  }, []);
  return (
    <group>
      <UnitLayer kind="infantry" geo={soldierGeo} indices={groups.infantry} wireframe={wireframe} />
      <UnitLayer kind="tank" geo={tankGeo} indices={groups.tank} wireframe={wireframe} />
      <UnitLayer kind="apc" geo={apcGeo} indices={groups.apc} wireframe={wireframe} />
      <UnitLayer kind="truck" geo={truckGeo} indices={groups.truck} wireframe={wireframe} />
      <Contacts />
    </group>
  );
}

function LockMarker() {
  const diamond = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const pulse = useRef(0);
  useFrame((_, dt) => {
    pulse.current += dt;
    const d = diamond.current;
    const r = ring.current;
    if (!d || !r) return;
    const u = sim.units.find((unit) => unit.id === sim.lockedId && unit.alive);
    const t = !u ? sim.targets.find((tg) => tg.id === sim.lockedId) : null;
    if (!u && !t) {
      d.visible = false;
      r.visible = false;
      return;
    }
    d.visible = true;
    r.visible = true;
    const x = u ? u.x : t!.x;
    const y = u ? u.y + (u.kind === "infantry" ? 7.2 : 6.4) : t!.y + 8;
    const z = u ? u.z : t!.z;
    d.position.set(x, y, z);
    r.position.set(x, y - 1.2, z);
    const s = 1.15 + Math.sin(pulse.current * 7) * 0.18;
    d.scale.setScalar(s);
    r.scale.setScalar(1.4 + Math.sin(pulse.current * 7) * 0.18);
  });
  return (
    <group>
      <mesh ref={diamond} visible={false}>
        <octahedronGeometry args={[1.6, 0]} />
        <meshBasicMaterial color="#ff3a3a" />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[1.6, 2.1, 12]} />
        <meshBasicMaterial color="#e6e1d4" side={THREE.DoubleSide} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function Targets() {
  const pulse = useRef(0);
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    pulse.current += dt;
    const s = 1 + Math.sin(pulse.current * 4.2) * 0.12;
    const g = group.current;
    if (!g) return;
    for (const child of g.children) {
      child.scale.setScalar(s);
    }
  });
  return (
    <group ref={group}>
      {sim.targets.map((t) => (
        <group key={t.id} position={[t.x, t.y + 10, t.z]}>
          <mesh>
            <octahedronGeometry args={[1.8, 0]} />
            <meshBasicMaterial color="#c41e1e" />
          </mesh>
          <mesh position={[0, 10, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 20, 4]} />
            <meshBasicMaterial color="#ff3a3a" transparent opacity={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Explosion() {
  const ref = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const e = sim.explosion;
    const mesh = ref.current;
    const r = ring.current;
    if (!mesh || !r) return;
    mesh.visible = e.active;
    r.visible = e.active;
    if (!e.active) return;
    mesh.position.set(e.x, e.y, e.z);
    r.position.set(e.x, e.y + 0.4, e.z);
    const k = Math.min(1, e.t / 0.7);
    mesh.scale.setScalar(2 + k * 28);
    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - k);
    r.scale.setScalar(4 + k * 40);
    (r.material as THREE.MeshBasicMaterial).opacity = 0.55 * (1 - k);
  });
  return (
    <group>
      <mesh ref={ref} visible={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color="#c41e1e" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[0.7, 1, 16]} />
        <meshBasicMaterial
          color="#e6e1d4"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function Lights({ night }: { night: boolean }) {
  const q = QUALITY;
  return night ? (
    <>
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", q.fogNear, q.fogFar]} />
      <hemisphereLight args={["#2e2e38", "#060606", q.mobile ? 0.52 : 0.38]} />
      <directionalLight position={[36, 70, -16]} intensity={q.mobile ? 0.78 : 0.62} color="#c4ccd8" />
      {q.stars > 0 ? (
        <Stars radius={220} depth={50} count={q.stars} factor={3.2} fade speed={0.4} />
      ) : null}
    </>
  ) : (
    <>
      <color attach="background" args={["#1a1a1e"]} />
      <fog attach="fog" args={["#1c1c20", q.fogNear, q.fogFar]} />
      <hemisphereLight args={["#7a7a82", "#121214", q.mobile ? 1.05 : 0.92]} />
      <directionalLight position={[48, 54, 26]} intensity={q.mobile ? 1.22 : 1.55} color="#efeae2" />
      {q.extraFillLight ? (
        <directionalLight position={[-34, 22, -26]} intensity={0.32} color="#9aa6b4" />
      ) : null}
      <ambientLight intensity={q.mobile ? 0.52 : 0.42} />
    </>
  );
}

function Loop() {
  const acc = useRef(0);
  const hudClock = useRef(0);
  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    acc.current += d;
    const STEP = 1 / 60;
    while (acc.current >= STEP) {
      step(STEP);
      acc.current -= STEP;
    }
    tickAudio();
    hudClock.current += d;
    if (hudClock.current > 0.08) {
      hudClock.current = 0;
      flushHud();
    }

    const cam = state.camera;
    if (cam.far !== QUALITY.far) {
      cam.far = QUALITY.far;
      cam.updateProjectionMatrix();
    }
    if (sim.phase === "brief") {
      const p = cinematicPose(state.clock.elapsedTime);
      cam.position.set(p.x, p.y, p.z);
      cam.lookAt(p.tx, p.ty, p.tz);
      return;
    }

    cam.position.set(sim.x, sim.y, sim.z);
    cam.rotation.order = "YXZ";
    cam.rotation.y = sim.yaw;
    cam.rotation.x = sim.pitch;
    cam.rotation.z = sim.roll;
    if (sim.shake > 0.02) {
      _shake.set(
        (Math.random() - 0.5) * sim.shake * 1.6,
        (Math.random() - 0.5) * sim.shake * 1.1,
        (Math.random() - 0.5) * sim.shake * 1.6,
      );
      cam.position.add(_shake);
    }
  });
  return null;
}

export function GameScene() {
  const night = useHud((s) => s.night);
  const wireframe = useHud((s) => s.wireframe);
  return (
    <>
      <Lights night={night} />
      <SkyDome night={night} />
      <TerrainMesh wireframe={wireframe} />
      <Water night={night} wireframe={wireframe} />
      <DeadPoles wireframe={wireframe} />
      <CityRuins wireframe={wireframe} />
      <StreetProps wireframe={wireframe} />
      <Rain />
      <Enemies wireframe={wireframe} />
      <Targets />
      <LockMarker />
      <Explosion />
      <Loop />
    </>
  );
}
