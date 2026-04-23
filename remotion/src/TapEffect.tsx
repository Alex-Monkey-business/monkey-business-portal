import { interpolate, useCurrentFrame, useVideoConfig, Easing } from 'remotion';

type TapEffectProps = {
  x: number;
  y: number;
  startFrame: number;
  color?: string;
  size?: number;
};

/**
 * Subtle iOS-style tap indicator — a soft filled dot flashes briefly,
 * followed by a ring that expands and fades out.
 * No finger cursor, just feedback.
 */
export const TapEffect: React.FC<TapEffectProps> = ({
  x,
  y,
  startFrame,
  color = 'rgba(17, 17, 17, 0.9)',
  size = 110,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - startFrame;

  const ringDuration = Math.round(0.85 * fps);
  const dotDuration = Math.round(0.28 * fps);

  // Ring: expands from 0 → size, fades 0.55 → 0
  const ringScale = interpolate(local, [0, ringDuration], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ringOpacity = interpolate(
    local,
    [0, 4, ringDuration],
    [0, 0.55, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Dot: quick flash
  const dotScale = interpolate(local, [0, dotDuration], [0.7, 1.15], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dotOpacity = interpolate(
    local,
    [0, 2, dotDuration],
    [0, 0.4, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Don't render outside our window
  if (local < -1 || local > ringDuration + 2) return null;

  return (
    <>
      {/* Expanding ring */}
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderRadius: '50%',
          border: `3px solid ${color}`,
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
          boxSizing: 'border-box',
        }}
      />
      {/* Inner soft dot */}
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 56,
          height: 56,
          marginLeft: -28,
          marginTop: -28,
          borderRadius: '50%',
          background: color,
          transform: `scale(${dotScale})`,
          opacity: dotOpacity,
          filter: 'blur(0.5px)',
        }}
      />
    </>
  );
};
