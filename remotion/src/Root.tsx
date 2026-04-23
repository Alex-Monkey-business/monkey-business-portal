import './index.css';
import { Composition } from 'remotion';
import { PhoneLoop, type PhoneLoopProps } from './PhoneLoop';

const W = 390;
const H = 844;
const FPS = 30;
const DURATION = 6 * FPS; // 6 seconds, loops at frame 180

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* =================== DASHBOARD =================== */}
      <Composition
        id="halsen-dashboard"
        component={PhoneLoop}
        durationInFrames={DURATION}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={
          {
            image: 'halsen/dashboard.png',
            taps: [
              // Tap on "Rød" team filter pill
              { x: 215, y: 195, atSecond: 1.2 },
              // Tap on first match card (Borre Rød vs Halsen Hvit)
              { x: 195, y: 420, atSecond: 3.2 },
            ],
          } satisfies PhoneLoopProps
        }
      />

      {/* =================== MATCH DETAIL =================== */}
      <Composition
        id="halsen-match"
        component={PhoneLoop}
        durationInFrames={DURATION}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={
          {
            image: 'halsen/match.png',
            taps: [
              // Tap on Alex coach card (top-left of Trenere grid)
              { x: 103, y: 515, atSecond: 1.2 },
              // Tap on Simon coach card (mid-right)
              { x: 285, y: 605, atSecond: 3.3 },
            ],
          } satisfies PhoneLoopProps
        }
      />

      {/* =================== SEASON =================== */}
      <Composition
        id="halsen-season"
        component={PhoneLoop}
        durationInFrames={DURATION}
        fps={FPS}
        width={W}
        height={H}
        defaultProps={
          {
            image: 'halsen/season.png',
            taps: [
              // Tap on Alex row (highlighted)
              { x: 195, y: 400, atSecond: 1.3 },
              // Tap on "Eksporter til Excel" button
              { x: 195, y: 705, atSecond: 3.5 },
            ],
          } satisfies PhoneLoopProps
        }
      />
    </>
  );
};
