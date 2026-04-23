import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from 'remotion';
import { TapEffect } from './TapEffect';

export type Tap = {
  x: number;
  y: number;
  /** When this tap should fire, in seconds from start */
  atSecond: number;
  /** Override ring color (default: dark ink) */
  color?: string;
  /** Override ring size in px (default 110) */
  size?: number;
};

export type PhoneLoopProps = {
  image: string;
  taps: Tap[];
  /** Subtle ambient breathing scale on the whole frame (default true) */
  breathe?: boolean;
};

/**
 * A static app screenshot with sequenced tap pulses overlaid.
 * Intended to loop seamlessly — first/last frames are identical idle states.
 */
export const PhoneLoop: React.FC<PhoneLoopProps> = ({
  image,
  taps,
  breathe = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Optional subtle ambient scale — helps sell that it's not a frozen image
  const breatheScale = breathe
    ? interpolate(
        frame,
        [0, durationInFrames / 2, durationInFrames],
        [1, 1.008, 1],
        {
          easing: Easing.inOut(Easing.sin),
        }
      )
    : 1;

  return (
    <AbsoluteFill style={{ background: '#FFF8E7' }}>
      <AbsoluteFill
        style={{
          transform: `scale(${breatheScale})`,
          transformOrigin: '50% 50%',
        }}
      >
        <Img
          src={staticFile(image)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top',
          }}
        />
      </AbsoluteFill>

      {taps.map((t, i) => (
        <TapEffect
          key={i}
          x={t.x}
          y={t.y}
          startFrame={Math.round(t.atSecond * fps)}
          color={t.color}
          size={t.size}
        />
      ))}
    </AbsoluteFill>
  );
};
