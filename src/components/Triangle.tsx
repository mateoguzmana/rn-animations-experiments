import React from 'react';
import {
  Canvas,
  Group,
  vec,
  Points,
  LinearGradient,
  useTiming,
  useComputedValue,
  Rect,
} from '@shopify/react-native-skia';
import {Dimensions, StyleSheet} from 'react-native';

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;

function Triangle() {
  const points = [vec(0, 100), vec(50, 15), vec(100, 100), vec(0, 100)];
  const scale = useTiming(
    {
      to: 100,
      from: 1,
      yoyo: true,
      loop: true,
    },
    {
      duration: 1000000,
    },
  );

  const scaleTranformation = useComputedValue(
    () => [
      {
        scaleY: scale.current,
      },
    ],
    [scale],
  );

  return (
    <>
      <Canvas style={styles.canvas}>
        <Rect x={0} y={0} width={screenWidth} height={screenHeight}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(screenWidth, screenWidth)}
            colors={['#2e2110', 'white']}
          />
        </Rect>

        <Group
          transform={[{translateX: screenWidth / 2 - 100}]}
          origin={{x: 0, y: 0}}>
          <Group transform={scaleTranformation} origin={{x: 0, y: 0}}>
            <Points
              points={points}
              mode="polygon"
              style="fill"
              strokeWidth={2}
              strokeCap="round">
              <LinearGradient
                colors={['#2e2110', 'white']}
                start={vec(0, 0)}
                end={vec(256, 256)}
              />
            </Points>
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

export default Triangle;
