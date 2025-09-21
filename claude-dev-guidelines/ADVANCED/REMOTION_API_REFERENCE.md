# 📚 Remotion API Reference

**Comprehensive guide to Remotion framework components and capabilities**

---

## About Remotion

Remotion is a framework that can create videos programmatically.
It is based on React.js. All output should be valid React code and be written in TypeScript.

## Project Structure

A Remotion Project consists of an entry file, a Root file and any number of React component files.
A project can be scaffolded using the "npx create-video@latest --blank" command.

### Entry File
The entry file is usually named "src/index.ts" and looks like this:

```ts
import {registerRoot} from 'remotion';
import {Root} from './Root';

registerRoot(Root);
```

### Root File
The Root file is usually named "src/Root.tsx" and looks like this:

```tsx
import {Composition} from 'remotion';
import {MyComp} from './MyComp';

export const Root: React.FC = () => {
    return (
        <>
            <Composition
                id="MyComp"
                component={MyComp}
                durationInFrames={120}
                width={1920}
                height={1080}
                fps={30}
                defaultProps={{}}
            />
        </>
    );
};
```

A `<Composition>` defines a video that can be rendered. It consists of:
- **component**: A React component
- **id**: Unique identifier
- **durationInFrames**: Length in frames
- **width**: Video width (default: 1920)
- **height**: Video height (default: 1080)
- **fps**: Frame rate (default: 30)
- **defaultProps**: Props passed to the component

## Core Hooks

### useCurrentFrame()
Inside a React component, use `useCurrentFrame()` to get the current frame number.
Frame numbers start at 0.

```tsx
export const MyComp: React.FC = () => {
    const frame = useCurrentFrame();
    return <div>Frame {frame}</div>;
};
```

### useVideoConfig()
If you need the fps, durationInFrames, height or width of the composition, use `useVideoConfig()`:

```tsx
import {useVideoConfig} from 'remotion';

export const MyComp: React.FC = () => {
    const {fps, durationInFrames, height, width} = useVideoConfig();
    return (
        <div>
            fps: {fps}
            durationInFrames: {durationInFrames}
            height: {height}
            width: {width}
        </div>
    );
};
```

## Media Components

### Video - OffthreadVideo
For including video files, use the `<OffthreadVideo>` tag:

```tsx
import {OffthreadVideo} from 'remotion';

export const MyComp: React.FC = () => {
    return (
        <div>
            <OffthreadVideo
                src="https://remotion.dev/bbb.mp4"
                style={{width: '100%'}}
            />
        </div>
    );
};
```

**Props:**
- `trimBefore`: Trims the left side of video by number of frames
- `trimAfter`: Limits how long video is shown
- `volume`: Sets volume (0-1)

### Images - Img
For non-animated images, use the `<Img>` tag:

```tsx
import {Img} from 'remotion';

export const MyComp: React.FC = () => {
    return <Img src="https://remotion.dev/logo.png" style={{width: '100%'}} />;
};
```

### Animated GIFs - Gif
For animated GIFs, install `@remotion/gif` and use the `<Gif>` tag:

```tsx
import {Gif} from '@remotion/gif';

export const MyComp: React.FC = () => {
    return (
        <Gif
            src="https://media.giphy.com/media/l0MYd5y8e1t0m/giphy.gif"
            style={{width: '100%'}}
        />
    );
};
```

### Audio
For audio files, use the `<Audio>` tag:

```tsx
import {Audio} from 'remotion';

export const MyComp: React.FC = () => {
    return <Audio src="https://remotion.dev/audio.mp3" />;
};
```

**Props:**
- `trimBefore`: Trims the left side of audio by number of frames
- `trimAfter`: Limits how long audio is shown
- `volume`: Sets volume (0-1)

## Asset Management

### staticFile()
For assets in the "public/" folder, use the `staticFile` API:

```tsx
import {Audio, staticFile} from 'remotion';

export const MyComp: React.FC = () => {
    return <Audio src={staticFile('audio.mp3')} />;
};
```

## Layout Components

### AbsoluteFill
For layering elements on top of each other, use `AbsoluteFill`:

```tsx
import {AbsoluteFill} from 'remotion';

export const MyComp: React.FC = () => {
    return (
        <AbsoluteFill>
            <AbsoluteFill style={{background: 'blue'}}>
                <div>This is in the back</div>
            </AbsoluteFill>
            <AbsoluteFill style={{background: 'red'}}>
                <div>This is in front</div>
            </AbsoluteFill>
        </AbsoluteFill>
    );
};
```

### Sequence
To place elements later in the video, wrap them in a `Sequence`:

```tsx
import {Sequence} from 'remotion';

export const MyComp: React.FC = () => {
    return (
        <Sequence from={10} durationInFrames={20}>
            <div>This only appears after 10 frames</div>
        </Sequence>
    );
};
```

**Props:**
- `from`: Frame number where element should appear (can be negative)
- `durationInFrames`: How long element should appear

**Important**: If a child component calls `useCurrentFrame()`, enumeration starts from the first frame the Sequence appears and starts at 0.

### Series
For displaying multiple elements sequentially, use `Series`:

```tsx
import {Series} from 'remotion';

export const MyComp: React.FC = () => {
    return (
        <Series>
            <Series.Sequence durationInFrames={20}>
                <div>This appears immediately</div>
            </Series.Sequence>
            <Series.Sequence durationInFrames={30}>
                <div>This appears after 20 frames</div>
            </Series.Sequence>
            <Series.Sequence durationInFrames={30} offset={-8}>
                <div>This appears after 42 frames</div>
            </Series.Sequence>
        </Series>
    );
};
```

**Props:**
- `durationInFrames`: Duration of the sequence
- `offset`: Shifts the start by number of frames

### TransitionSeries
For transitions between elements, use `TransitionSeries` from `@remotion/transitions`:

```tsx
import {
    linearTiming,
    springTiming,
    TransitionSeries,
} from '@remotion/transitions';

import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';

export const MyComp: React.FC = () => {
    return (
        <TransitionSeries>
            <TransitionSeries.Sequence durationInFrames={60}>
                <Fill color="blue" />
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition
                timing={springTiming({config: {damping: 200}})}
                presentation={fade()}
            />
            <TransitionSeries.Sequence durationInFrames={60}>
                <Fill color="black" />
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition
                timing={linearTiming({durationInFrames: 30})}
                presentation={wipe()}
            />
            <TransitionSeries.Sequence durationInFrames={60}>
                <Fill color="white" />
            </TransitionSeries.Sequence>
        </TransitionSeries>
    );
};
```

## Animation Helpers

### interpolate()
Remotion includes an `interpolate()` helper for animating values over time:

```tsx
import {interpolate} from 'remotion';

export const MyComp: React.FC = () => {
    const frame = useCurrentFrame();
    const value = interpolate(frame, [0, 100], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });
    return (
        <div>
            Frame {frame}: {value}
        </div>
    );
};
```

**Parameters:**
- First argument: Value to animate
- First array: Input range
- Second array: Output range
- Fourth argument: Options (recommended to add `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'`)

### spring()
Remotion includes a `spring()` helper for spring animations:

```tsx
import {spring} from 'remotion';

export const MyComp: React.FC = () => {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();

    const value = spring({
        fps,
        frame,
        config: {
            damping: 200,
        },
    });
    return (
        <div>
            Frame {frame}: {value}
        </div>
    );
};
```

### random()
For randomness, use the `random()` function with a static seed (Math.random() is forbidden):

```tsx
import {random} from 'remotion';

export const MyComp: React.FC = () => {
    return <div>Random number: {random('my-seed')}</div>;
};
```

The random function returns a number between 0 and 1.

## Rendering

### Local Rendering

**Render Video:**
```bash
npx remotion render [id]
# Example: npx remotion render MyComp
```

**Render Still Image:**
```bash
npx remotion still [id]
# Example: npx remotion still MyComp
```

### Cloud Rendering on Lambda

Videos can be rendered in the cloud using AWS Lambda.
The setup described at https://www.remotion.dev/docs/lambda/setup must be completed.

**CLI Commands:**
- Deploy Lambda function: `npx remotion lambda functions deploy`
- Deploy site: `npx remotion lambda sites create [entry-point]`
- Render video: `npx remotion lambda render [comp-id]`

**Node.js APIs:**
- Deploy function: `deployFunction()`
- Deploy site: `deploySite()`
- Render video: `renderMediaOnLambda()`
- Poll progress: `getRenderProgress()`

## Component Rules & Best Practices

### Required Structure
- Root element MUST be `<AbsoluteFill>`
- Use style objects for CSS (no className)
- All code must be deterministic (no Math.random())

### Performance Guidelines
- Use `extrapolateLeft: 'clamp'` and `extrapolateRight: 'clamp'` to prevent values going out of bounds
- Prefer transform over changing layout properties
- Use `backgroundColor` instead of `background` for solid colors

### Typography Guidelines
- Use large font sizes (4rem+) for video content
- Always specify color explicitly
- Use web-safe fonts or specify fallbacks

---

**💡 This reference covers the complete Remotion API. Use these components and patterns when generating complex animations with video, audio, advanced layouts, and cloud rendering capabilities.**