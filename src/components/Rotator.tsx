import React, {useState} from 'react';
import {
  Canvas,
  Group,
  Skia,
  ImageSVG,
  useComputedValue,
  useTiming,
  Easing,
  Path,
  Rect,
  LinearGradient,
  vec,
  DiscretePathEffect,
} from '@shopify/react-native-skia';
import {Dimensions, Text, TouchableOpacity} from 'react-native';

const initialSize = 300;
const finalSize = 1000;

const coldPalette = {
  primary: '#395B64',
  secondary: '#2C3333',
  text: '#A5C9CA',
};

const secondPalette = {
  primary: '#42032C',
  secondary: '#9C9EFE',
  text: '#AFB4FF',
};

function Rotator() {
  const [size, setSize] = useState(initialSize);
  const [paletteVal, setPaletteVal] = useState(0);
  const half = size / 2;

  const palette = paletteVal === 0 ? coldPalette : secondPalette;

  const svg = Skia.SVG.MakeFromString(
    `<svg x="0px" y="0px" width="${size}px" height="${size}px" viewBox="0 0 ${size} ${size}" enable-background="new 0 0 ${size} ${size}" xml:space="preserve">
    <defs>
        <path id="criclePath" d=" M ${half}, ${half} m -120, 0 a 120,120 0 0,1 240,0 a 120,120 0 0,1 -240,0 "/>
    </defs>
    
    <!-- <circle cx="${half}" cy="${half}" r="${half}" fill="${palette.text}" /> -->
    <g>
        <use xlink:href="#criclePath" fill="none"/>
        <text fill="${palette.text}">
            <textPath xlink:href="#criclePath">ton si ti esuaceb ytilaer eht nioj ot tnaw uoy taht erus uoy era optus lmao</textPath>
        </text>
    </g>
  </svg>`,
  );

  const textRotation = useTiming(
    {
      to: 360,
    },
    {
      duration: 980000,
      easing: Easing.linear,
    },
  );

  const textRotationTransform = useComputedValue(
    () => [
      {
        rotate: textRotation.current,
        scale: 0.1,
      },
    ],
    [textRotation],
  );

  const figureRotationTransform = useComputedValue(
    () => [
      {
        rotate: -textRotation.current,
      },
    ],
    [textRotation],
  );

  const skBaseTransformPositive = useComputedValue(
    () => [
      {
        skewX: paletteVal === 0 ? 1 : 10,
      },
    ],
    [paletteVal],
  );

  return (
    <>
      <Canvas
        style={{
          width: Dimensions.get('screen').width,
          height: Dimensions.get('screen').height,
        }}>
        <Rect
          x={0}
          y={0}
          width={Dimensions.get('screen').width}
          height={Dimensions.get('screen').height}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(size, size)}
            colors={[palette.primary, palette.secondary]}
          />
        </Rect>

        <Group
          transform={[
            {
              translateX: Dimensions.get('screen').width * 0.125,
            },
          ]}>
          <Group
            transform={[
              {
                translateY: Dimensions.get('screen').height * 0.1,
              },
            ]}>
            <Group
              origin={{x: half, y: half}}
              transform={textRotationTransform}>
              <ImageSVG svg={svg} x={0} y={0} width={size} height={size} />
            </Group>

            <Group
              origin={{x: half, y: half}}
              transform={textRotationTransform}>
              <Group
                origin={{x: half, y: half}}
                transform={textRotationTransform}>
                <Group
                  origin={{x: half, y: half}}
                  transform={skBaseTransformPositive}>
                  <Ring ringSize={half} paletteVal={paletteVal} />
                </Group>
              </Group>

              <Group
                origin={{x: half, y: half}}
                transform={textRotationTransform}>
                <Group origin={{x: half, y: half}} transform={[{skewX: -1}]}>
                  <Ring ringSize={half} paletteVal={paletteVal} />
                </Group>
              </Group>
            </Group>

            <Group
              origin={{x: half, y: half}}
              transform={figureRotationTransform}>
              <Group
                origin={{x: half, y: half}}
                transform={figureRotationTransform}>
                <Group
                  origin={{x: half, y: half}}
                  transform={skBaseTransformPositive}>
                  <Ring ringSize={half} paletteVal={paletteVal} />
                </Group>
              </Group>

              <Group
                origin={{x: half, y: half}}
                transform={figureRotationTransform}>
                <Group origin={{x: half, y: half}} transform={[{skewX: -1}]}>
                  <Ring ringSize={half} paletteVal={paletteVal} />
                </Group>
              </Group>
            </Group>
          </Group>
        </Group>
      </Canvas>

      <TouchableOpacity
        onPress={() => {
          setSize(s => (s === finalSize ? initialSize : finalSize));
          setPaletteVal(val => (val === 0 ? 1 : 0));
        }}
        style={{
          position: 'absolute',
          zIndex: 100,
          width: '100%',
          bottom: 100,
          alignItems: 'center',
        }}>
        <Text style={{fontSize: 30, color: palette.text}}>
          {paletteVal === 0 ? `Exit Reality` : 'Join the world'}
        </Text>
      </TouchableOpacity>
    </>
  );
}

interface RingProps {
  ringSize: number;
  paletteVal: number;
}

function Ring({ringSize, paletteVal}: RingProps) {
  const withEffect = paletteVal === 1;

  const width = useTiming(
    {
      to: 10,
      from: 1,
      yoyo: true,
      loop: true,
    },
    {
      duration: 100,
      easing: Easing.linear,
    },
  );

  const widthVal = useComputedValue(() => width.current, [width]);

  return (
    <Path
      path={`M ${ringSize}, ${ringSize} m -${ringSize / 2}, 0 a ${
        ringSize / 2
      },${ringSize / 2} 0 1,0 ${ringSize},0 a ${ringSize / 2},${
        ringSize / 2
      } 0 1,0 -${ringSize},0`}
      color={withEffect ? secondPalette.text : coldPalette.text}
      style="stroke"
      strokeWidth={widthVal}>
      {withEffect ? <DiscretePathEffect length={1} deviation={2} /> : null}
    </Path>
  );
}

export default Rotator;
