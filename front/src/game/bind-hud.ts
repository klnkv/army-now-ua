import { FLIGHT_SECONDS, RADIO_LINES } from "./constants";
import { registerFlush, useHud, type HudContact } from "./hud-store";
import { droneGrid, sim } from "./sim";
import { kindLabel, unitGrid } from "./units";

registerFlush(() => {
  const battery = Math.max(6, Math.round(8 + 68 * (sim.timeLeft / FLIGHT_SECONDS)));
  const heading = ((-sim.yaw * (180 / Math.PI)) % 360 + 360) % 360;
  const radioCount =
    sim.phase === "flight"
      ? RADIO_LINES.filter((l) => l.t <= sim.flightAge + 0.05).length
      : 2;

  let infantryAlive = 0;
  let vehicleAlive = 0;
  const contacts: HudContact[] = [];
  for (const u of sim.units) {
    if (!u.alive) continue;
    if (u.kind === "infantry") infantryAlive += 1;
    else vehicleAlive += 1;
    contacts.push({
      id: u.id,
      name: u.name,
      kind: kindLabel(u.kind),
      grid: unitGrid(u),
      dist: Math.hypot(u.x - sim.x, u.y - sim.y, u.z - sim.z),
      vehicle: u.kind !== "infantry",
    });
  }
  contacts.sort((a, b) => a.dist - b.dist);
  if (sim.lockedId) {
    const i = contacts.findIndex((c) => c.id === sim.lockedId);
    if (i > 0) {
      const [hit] = contacts.splice(i, 1);
      contacts.unshift(hit);
    } else if (i < 0) {
      const t = sim.targets.find((tg) => tg.id === sim.lockedId);
      if (t) {
        contacts.unshift({
          id: t.id,
          name: t.name,
          kind: t.kind,
          grid: t.grid,
          dist: Math.hypot(t.x - sim.x, t.y - sim.y, t.z - sim.z),
          vehicle: true,
        });
      }
    }
  }

  useHud.setState({
    phase: sim.phase,
    result: sim.result,
    altitude: sim.y,
    speedKmh: Math.abs(sim.speed) * 3.6,
    battery,
    heading,
    timeLeft: sim.timeLeft,
    grid: droneGrid(),
    lat: 48.3792 + sim.z * -0.00008,
    lon: 37.8021 + sim.x * 0.00011,
    wireframe: sim.wireframe,
    night: sim.night,
    lockedId: sim.lockedId,
    ping: 34 + Math.round((sim.x + sim.z) % 7),
    radio: RADIO_LINES.slice(0, Math.max(1, radioCount)).map(({ who, text }) => ({
      who,
      text,
    })),
    targets: sim.targets.map((t) => ({
      id: t.id,
      name: t.name,
      kind: t.kind,
      grid: t.grid,
      dist: Math.hypot(t.x - sim.x, t.y - sim.y, t.z - sim.z),
    })),
    contacts: contacts.slice(0, 8),
    kills: sim.kills,
    infantryAlive,
    vehicleAlive,
    remaining: infantryAlive + vehicleAlive,
    shake: sim.shake,
  });
});
