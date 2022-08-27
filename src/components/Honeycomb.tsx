import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Canvas,
  Group,
  vec,
  Points,
  LinearGradient,
  useComputedValue,
  useTouchHandler,
  useValue,
  runSpring,
  Rect,
} from '@shopify/react-native-skia';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

function Honeycomb() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['5%', '50%'], []);
  const [boardWidth, setBoardWidth] = useState(5);
  const [boardHeight, setBoardHeight] = useState(5);
  const [sideLength, setSideLength] = useState(10); // defines the size of the hexagon

  const hexagonAngle = 0.523598776; // 30 degrees in radians

  const hexHeight = Math.sin(hexagonAngle) * sideLength;
  const hexRadius = Math.cos(hexagonAngle) * sideLength;
  const hexRectangleHeight = sideLength + 2 * hexHeight;
  const hexRectangleWidth = 2 * hexRadius;

  const origin = {
    x: (boardWidth * hexRectangleWidth) / 2,
    y: (boardHeight * hexRectangleWidth) / 2,
  };

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

  const translateX = useValue(0);
  const translateY = useValue(0);
  const rotation = useValue(0);

  const translateHoneycomb = useCallback(
    (x: number, y: number) => {
      const config = {velocity: 10, mass: 1};
      runSpring(translateX, x, config);
      runSpring(translateY, y, config);
      runSpring(rotation, rotation.current + 10, config);
    },
    [translateX, translateY, rotation],
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

  const honeycombRotationTransform = useComputedValue(
    () => [
      {
        rotate: rotation.current,
      },
    ],
    [rotation],
  );

  const onTouch = useTouchHandler(
    {
      onStart: ({x, y}) => {
        translateHoneycomb(
          x - (boardWidth * hexRectangleWidth) / 2,
          y - (boardHeight * hexRectangleWidth) / 2,
        );
      },
    },
    [],
  );

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} onTouch={onTouch}>
        <Rect x={0} y={0} width={screenWidth} height={screenHeight}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(screenWidth, screenWidth)}
            colors={['#E38B29', '#FFD8A9']}
          />
        </Rect>
        <Group transform={honeycombYTransform} origin={origin}>
          <Group transform={honeycombXTransform} origin={origin}>
            <Group transform={honeycombRotationTransform} origin={origin}>
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
                      colors={['#F1A661', 'gray']}
                      start={vec(0, 0)}
                      end={vec(256, 256)}
                    />
                  }
                </Points>
              ))}
            </Group>
          </Group>
        </Group>
      </Canvas>

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        handleStyle={styles.handleStyle}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Configuration</Text>
          <View style={styles.configurationRow}>
            <Text>Board width: </Text>
            <Button title="-" onPress={() => setBoardWidth(v => v - 1)} />
            <Text>{boardWidth}</Text>
            <Button title="+" onPress={() => setBoardWidth(v => v + 1)} />
          </View>
          <View style={styles.configurationRow}>
            <Text>Board height: </Text>
            <Button title="-" onPress={() => setBoardHeight(v => v - 1)} />
            <Text>{boardHeight}</Text>
            <Button title="+" onPress={() => setBoardHeight(v => v + 1)} />
          </View>

          <View style={styles.configurationRow}>
            <Text>Hexagon side size: </Text>
            <Button title="-" onPress={() => setSideLength(v => v - 1)} />
            <Text>{sideLength}</Text>
            <Button title="+" onPress={() => setSideLength(v => v + 1)} />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

interface ButtonProps {
  onPress(): void;
  title: string;
}

function Button({onPress, title}: ButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  handleStyle: {
    backgroundColor: '#FDEEDC',
    borderTopRadius: 8,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FDEEDC',
  },
  configurationRow: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  title: {
    fontWeight: 'bold',
  },
  button: {
    paddingHorizontal: 4,
    background: '#3F4E4F',
  },
  canvas: {
    width: screenWidth,
    height: screenHeight,
  },
});

export default Honeycomb;
