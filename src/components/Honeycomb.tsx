import React, {useCallback} from 'react';
import {
  Canvas,
  Group,
  vec,
  Points,
  LinearGradient,
  useComputedValue,
  Rect,
  useTouchHandler,
  useValue,
  runSpring,
} from '@shopify/react-native-skia';
import {Dimensions, StyleSheet} from 'react-native';

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

const hexagonAngle = 0.523598776; // 30 degrees in radians
const sideLength = 20; // defines the size of the hexagon
const boardWidth = 8;
const boardHeight = 8;

const hexHeight = Math.sin(hexagonAngle) * sideLength;
const hexRadius = Math.cos(hexagonAngle) * sideLength;
const hexRectangleHeight = sideLength + 2 * hexHeight;
const hexRectangleWidth = 2 * hexRadius;

function getHexagons(width: number, height: number) {
  const hexagonsToDraw = [];

  for (let i = 0; i < height; i++) {
    let hexagons = width - Math.abs(Math.floor(width / 2) - i);
    const xStart =
      (width - 3) % 4 === 0
        ? Math.ceil((width - hexagons) / 2)
        : Math.floor((width - hexagons) / 2);

    for (let j = xStart; j < xStart + hexagons; j++) {
      hexagonsToDraw.push({
        x: j * hexRectangleWidth + (i % 2) * hexRadius,
        y: i * (sideLength + hexHeight),
      });
    }
  }

  return hexagonsToDraw;
}

function drawHexagon({x, y}: {x: number; y: number}) {
  const points = [
    vec(x, y + hexHeight),
    vec(x + hexRadius, y),
    vec(x + hexRectangleWidth, y + hexHeight),
    vec(x + hexRectangleWidth, y + hexHeight + sideLength),
    vec(x + hexRadius, y + hexRectangleHeight),
    vec(x, y + sideLength + hexHeight),
    vec(x, y + hexHeight),
  ];

  return points;
}

function Honeycomb() {
  const translateX = useValue(0);
  const translateY = useValue(0);

  const changeSkewX = useCallback(
    (to: number) => runSpring(translateX, to, {velocity: 10, mass: 1}),
    [translateX],
  );

  const changeSkewY = useCallback(
    (to: number) => runSpring(translateY, to, {velocity: 10, mass: 1}),
    [translateY],
  );

  const honeycombXTransform = useComputedValue(
    () => [
      {
        translateX: translateX.current,
      },
    ],
    [translateX],
  );

  const honeycombYTransform = useComputedValue(
    () => [
      {
        translateY: translateY.current,
      },
    ],
    [translateY],
  );

  const onTouch = useTouchHandler(
    {
      onStart: ({x, y}) => {
        changeSkewX(x - (boardWidth * hexRectangleWidth) / 2);
        changeSkewY(y - (boardHeight * hexRectangleWidth) / 2);
      },
    },
    [],
  );

  return (
    <>
      <Canvas style={styles.canvas} onTouch={onTouch}>
        <Rect x={0} y={0} width={screenWidth} height={screenHeight}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(screenWidth, screenWidth)}
            colors={['black', 'red']}
          />
        </Rect>
        <Group
          transform={honeycombYTransform}
          origin={{
            x: (boardWidth * hexRectangleWidth) / 2,
            y: (boardHeight * hexRectangleWidth) / 2,
          }}>
          <Group
            transform={honeycombXTransform}
            origin={{
              x: (boardWidth * hexRectangleWidth) / 2,
              y: (boardHeight * hexRectangleWidth) / 2,
            }}>
            {getHexagons(boardWidth, boardHeight).map((hexagon, index) => (
              <Points
                points={drawHexagon(hexagon)}
                mode="polygon"
                style="fill"
                strokeWidth={2}
                strokeCap="round"
                key={index}>
                {
                  <LinearGradient
                    colors={['#2e2110', 'white']}
                    start={vec(0, 0)}
                    end={vec(256, 256)}
                  />
                }
              </Points>
            ))}
          </Group>
        </Group>
      </Canvas>
    </>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: screenWidth,
    height: screenHeight,
  },
});

export default Honeycomb;
