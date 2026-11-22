// The Last Waltz Job — configuration: arena, palette, speeds, sensors.
// Guards, cameras and lasers all feed one alarm meter; every number
// they use lives here so world.js and render.js read the same truth.

export const W = 1280;
export const H = 720;

export const COLORS = {
  floor: "#171b22",
  floorAlt: "#141920",
  clean: "#232b36",
  wall: "#39424f",
  wallTop: "#6e7e90",
  cover: "#4c4438",
  coverTop: "#77694f",
  player: "#ffb340",
  playerDark: "#8a5a17",
  guard: "#bfe9ff",
  guardDark: "#5b7a8c",
  camera: "#9b8cff",
  loot: "#ffd23f",
  exit: "#3ddc84",
  exitDark: "#14532d",
  laser: "#ff5f56",
  coneCalm: "255, 210, 63",
  coneSuspect: "255, 138, 61",
  coneAlert: "255, 77, 77",
  camCone: "155, 140, 255",
  text: "#e8eef5",
  muted: "#93a5bb",
  danger: "#ff5f56",
};

export const SPEED = {
  walk: 136,
  sneak: 62,
  patrol: 58,
  investigate: 90,
  chase: 122,
  return: 74,
  converge: 96,
};

// Guard eyes: a wide warm cone. Detection is per guard, 0..100.
export const SIGHT = {
  range: 228,
  halfAngle: 0.61,
  innerRange: 114,
  fillInner: 112,
  fillOuter: 40,
  fillProximity: 85,
  proximityRange: 42,
  drain: 28,
  holdBeforeDrain: 0.4,
  suspectAt: 40,
  alertAt: 100,
};

// Cameras: a narrow violet fan that sweeps and never blinks. What a
// camera sees feeds the alarm meter directly.
export const CAMERA = {
  range: 178,
  halfAngle: 0.31,
  fillInner: 38,
  fillOuter: 18,
  innerRange: 88,
  deadRadius: 30, // directly beneath the housing is blind
};

// The one alarm meter, 0..100, fed by every sensor in the building.
export const ALARM = {
  guardSpike: 25, // a guard's meter reaching 100 shouts this much in
  laserSpike: 34,
  drain: 9,
  drainDelay: 2.5, // seconds with no sensor contact before it falls
  lockdownLatch: 12, // seconds pinned at 100 once it maxes
  lockdownDecay: 16,
  getawaySeconds: 45, // reach the van before this runs out
  tierSuspect: 30,
  tierAlarm: 60,
};

// Loot weight: every bag is score in the hand and speed off the feet.
export const LOOT = {
  bagSlowdown: 0.06,
  mainSlowdown: 0.04,
  minSpeedFactor: 0.58,
  walkNoiseBase: 26,
  walkNoisePerBag: 13,
};

export const SCORE = {
  cleanGetaway: 2000, // alarm never reached 100
  ghost: 3500, // alarm never rose at all; replaces cleanGetaway
  alarmTrigger: -750,
  spotted: -200,
  timePerSecond: 15,
  timeCap: 1500,
};
