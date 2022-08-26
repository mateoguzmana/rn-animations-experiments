import React, {useState} from 'react';
import {
  Canvas,
  Group,
  useComputedValue,
  useTiming,
  Easing,
  vec,
  Circle,
  useTouchHandler,
  useValue,
  runTiming,
} from '@shopify/react-native-skia';

const w = 400;
const h = 400;

const cx = w / 2;
const cy = h / 2;

const circles = 255;
const golden_ratio = (Math.sqrt(6) + 1) / 2 - 1;
const golden_angle = golden_ratio * (2 * Math.PI);
const circle_rad = w * 0.5 - 20;

function fromRadians(angle: number) {
  return angle * (180.0 / Math.PI);
}

function circlesToDraw() {
  const circlesToDrawX = [];

  for (let i = 1; i <= circles; ++i) {
    const dot_rad = 0.006 * i;
    const ratio = i / circles;
    const angle = i * golden_angle;
    const spiral_rad = ratio * circle_rad;

    const x = cx + Math.cos(fromRadians(angle)) * spiral_rad;
    const y = cy + Math.sin(fromRadians(angle)) * spiral_rad;

    // Normal variants
    // const initialPosX = cx;
    // const initialPosY = cy;
    // Variants for the cilinder effect I did by mistake
    const initialPosX = w * Math.cos((2 * Math.PI * i) / circles);
    const initialPosY = h * Math.cos((2 * Math.PI * i) / circles);

    // Pin effect, by mistake again lol
    // const initialPosX = cx - 20 * Math.sin((2 * Math.PI * i) / circles);
    // const initialPosY = cy - 20 * Math.sin((2 * Math.PI * i) / circles);

    const color = `rgba(100, ${i % 256}, ${(i % 256) + 20}, 1)`;

    circlesToDrawX.push({x, y, color, r: dot_rad, initialPosX, initialPosY});
  }

  return circlesToDrawX;
}

const rotationGap = 2;

function Phyllotaxis() {
  const rotation = useValue(0);
  const changeRotation = () =>
    runTiming(rotation, rotation.current + rotationGap, {duration: 1000});

  const rotationTransform = useComputedValue(
    () => [
      {
        rotate: rotation.current,
        translateY: 100,
      },
    ],
    [rotation],
  );

  const [opening, setOpening] = useState(false);

  const touchHandler = useTouchHandler(
    {
      onStart: ({x, y}) => {
        if (x < cx + 300 && y < cy + 300) {
          setOpening(val => !val);
          changeRotation();
        }
      },
    },
    [],
  );

  return (
    <>
      <Canvas
        style={{
          width: w * 5,
          height: h * 5,
          marginTop: 100,
        }}
        onTouch={touchHandler}>
        <Group origin={{x: cx, y: cy}} transform={rotationTransform}>
          {circlesToDraw().map((c, i) => {
            return (
              <Particle
                key={i}
                x={c.initialPosX}
                y={c.initialPosY}
                finalPos={{
                  x: c.x,
                  y: c.y,
                }}
                r={c.r * 3}
                color={c.color}
                opening={opening}
              />
            );
          })}
        </Group>
      </Canvas>
    </>
  );
}

export interface ParticleProps {
  x: number;
  y?: number;
  finalPos: {
    x: number;
    y: number;
  };
  r?: number;
  color: string;
  opening: boolean;
}

function Particle({x, y = 0, finalPos, r = 8, color, opening}: ParticleProps) {
  const xM = useTiming(
    {
      to: opening ? finalPos.x : x,
      from: opening ? x : finalPos.x,
    },
    {
      duration: 1000,
      easing: Easing.linear,
    },
  );

  const yM = useTiming(
    {
      to: opening ? finalPos.y : y,
      from: opening ? y : finalPos.y,
    },
    {
      duration: 1000,
      easing: Easing.linear,
    },
  );

  const transformCircle = useComputedValue(
    () => vec(xM.current, yM.current),
    [xM, yM],
  );

  return <Circle c={transformCircle} r={r} color={color} />;
}

export default Phyllotaxis;
