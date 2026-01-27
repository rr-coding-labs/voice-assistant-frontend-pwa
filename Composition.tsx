import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Sequence,
} from "remotion";

const LightBeam: React.FC<{ rotation: number; delay: number }> = ({
  rotation,
  delay,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame - delay, [0, 20, 60, 80], [0, 0.6, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame - delay, [0, 60], [0.5, 1.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 8,
          height: 800,
          background:
            "linear-gradient(to top, transparent 0%, rgba(0, 200, 255, 0.8) 50%, transparent 100%)",
          transform: `rotate(${rotation}deg) scaleY(${scale})`,
          opacity,
          filter: "blur(4px)",
        }}
      />
    </div>
  );
};

const Particle: React.FC<{
  x: number;
  y: number;
  size: number;
  delay: number;
  speed: number;
}> = ({ x, y, size, delay, speed }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame - delay,
    [0, 20, 100, 120],
    [0, 0.8, 0.8, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const yOffset = interpolate(frame - delay, [0, 150], [0, -200 * speed], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(0, 200, 255, 0.9)",
        boxShadow: "0 0 10px rgba(0, 200, 255, 0.8)",
        opacity,
        transform: `translateY(${yOffset}px)`,
      }}
    />
  );
};

const Star: React.FC<{
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  delay: number;
}> = ({ x, y, size, twinkleSpeed, delay }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    Math.sin((frame + delay) * twinkleSpeed * 0.1),
    [-1, 1],
    [0.2, 1]
  );

  const fadeIn = interpolate(frame, [0, 30 + delay * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        background: "white",
        boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.8)`,
        opacity: opacity * fadeIn,
      }}
    />
  );
};

const GlowRing: React.FC<{ delay: number; orbitSpeed?: number; startAngle?: number }> = ({ delay, orbitSpeed = 0.08, startAngle = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 100, stiffness: 50, mass: 1 },
  });

  const opacity = interpolate(frame - delay, [0, 10, 40, 60], [0, 0.8, 0.4, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Orbit angle - stops when ring fades out
  const orbitProgress = interpolate(frame - delay, [0, 60], [0, 60], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const orbitAngle = startAngle + orbitProgress * orbitSpeed * Math.PI * 2;

  // Calculate orbit position (radius is 200, the ring radius)
  const orbitRadius = 200;
  const orbitX = Math.cos(orbitAngle) * orbitRadius;
  const orbitY = Math.sin(orbitAngle) * orbitRadius;

  return (
    <div
      style={{
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: "50%",
        border: "3px solid rgba(0, 200, 255, 0.6)",
        boxShadow:
          "0 0 40px rgba(0, 200, 255, 0.4), inset 0 0 40px rgba(0, 200, 255, 0.2)",
        transform: `scale(${scale * 2})`,
        opacity,
      }}
    >
      {/* Orbiting point */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 0 10px rgba(255, 255, 255, 0.9), 0 0 20px rgba(0, 200, 255, 0.8)",
          transform: `translate(calc(-50% + ${orbitX}px), calc(-50% + ${orbitY}px))`,
        }}
      />
    </div>
  );
};

export const MyComposition: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo animation
  const logoScale = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 80, mass: 0.8 },
  });

  const logoOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const logoGlow = interpolate(frame, [20, 50, 80], [0, 30, 15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Vignette intensity
  const vignetteIntensity = interpolate(frame, [0, 30], [0.8, 0.6], {
    extrapolateRight: "clamp",
  });

  // Text animation (starts at frame 100)
  const textOpacity = interpolate(frame, [110, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textY = interpolate(frame, [110, 140], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const textSpacing = interpolate(frame, [110, 150], [20, 8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Particles configuration
  const particles = [
    { x: 20, y: 80, size: 3, delay: 10, speed: 0.8 },
    { x: 35, y: 70, size: 4, delay: 20, speed: 1.2 },
    { x: 50, y: 85, size: 2, delay: 5, speed: 0.6 },
    { x: 65, y: 75, size: 5, delay: 15, speed: 1.0 },
    { x: 80, y: 80, size: 3, delay: 25, speed: 0.9 },
    { x: 25, y: 60, size: 2, delay: 30, speed: 1.1 },
    { x: 75, y: 65, size: 4, delay: 8, speed: 0.7 },
    { x: 45, y: 90, size: 3, delay: 18, speed: 1.3 },
    { x: 55, y: 70, size: 2, delay: 12, speed: 0.5 },
    { x: 40, y: 75, size: 4, delay: 22, speed: 1.0 },
  ];

  // Stars configuration - spread across the entire background
  const stars = [
    { x: 5, y: 8, size: 2, twinkleSpeed: 1.2, delay: 0 },
    { x: 12, y: 15, size: 1.5, twinkleSpeed: 0.8, delay: 5 },
    { x: 23, y: 5, size: 2.5, twinkleSpeed: 1.5, delay: 10 },
    { x: 35, y: 12, size: 1, twinkleSpeed: 1.0, delay: 3 },
    { x: 48, y: 8, size: 2, twinkleSpeed: 1.3, delay: 7 },
    { x: 62, y: 14, size: 1.5, twinkleSpeed: 0.9, delay: 12 },
    { x: 75, y: 6, size: 2, twinkleSpeed: 1.1, delay: 2 },
    { x: 88, y: 10, size: 1.5, twinkleSpeed: 1.4, delay: 8 },
    { x: 95, y: 18, size: 2, twinkleSpeed: 0.7, delay: 15 },
    { x: 8, y: 25, size: 1.5, twinkleSpeed: 1.2, delay: 4 },
    { x: 18, y: 32, size: 2, twinkleSpeed: 0.9, delay: 11 },
    { x: 30, y: 28, size: 1, twinkleSpeed: 1.5, delay: 6 },
    { x: 42, y: 22, size: 2.5, twinkleSpeed: 1.0, delay: 9 },
    { x: 55, y: 30, size: 1.5, twinkleSpeed: 1.3, delay: 1 },
    { x: 68, y: 25, size: 2, twinkleSpeed: 0.8, delay: 14 },
    { x: 82, y: 32, size: 1, twinkleSpeed: 1.1, delay: 7 },
    { x: 92, y: 28, size: 2, twinkleSpeed: 1.4, delay: 3 },
    { x: 3, y: 45, size: 1.5, twinkleSpeed: 0.9, delay: 10 },
    { x: 15, y: 52, size: 2, twinkleSpeed: 1.2, delay: 5 },
    { x: 28, y: 48, size: 1, twinkleSpeed: 1.0, delay: 13 },
    { x: 72, y: 50, size: 2, twinkleSpeed: 1.3, delay: 2 },
    { x: 85, y: 45, size: 1.5, twinkleSpeed: 0.7, delay: 8 },
    { x: 97, y: 52, size: 2, twinkleSpeed: 1.1, delay: 11 },
    { x: 6, y: 68, size: 2, twinkleSpeed: 1.4, delay: 4 },
    { x: 18, y: 75, size: 1.5, twinkleSpeed: 0.8, delay: 9 },
    { x: 32, y: 70, size: 1, twinkleSpeed: 1.2, delay: 6 },
    { x: 68, y: 72, size: 2, twinkleSpeed: 1.0, delay: 12 },
    { x: 80, y: 68, size: 1.5, twinkleSpeed: 1.5, delay: 1 },
    { x: 93, y: 75, size: 2, twinkleSpeed: 0.9, delay: 7 },
    { x: 4, y: 88, size: 1.5, twinkleSpeed: 1.3, delay: 14 },
    { x: 16, y: 92, size: 2, twinkleSpeed: 1.1, delay: 3 },
    { x: 28, y: 85, size: 1, twinkleSpeed: 0.7, delay: 10 },
    { x: 40, y: 90, size: 2.5, twinkleSpeed: 1.2, delay: 5 },
    { x: 55, y: 88, size: 1.5, twinkleSpeed: 1.4, delay: 8 },
    { x: 70, y: 92, size: 2, twinkleSpeed: 0.8, delay: 2 },
    { x: 84, y: 85, size: 1, twinkleSpeed: 1.0, delay: 11 },
    { x: 96, y: 90, size: 2, twinkleSpeed: 1.3, delay: 6 },
    { x: 10, y: 40, size: 1.5, twinkleSpeed: 0.9, delay: 9 },
    { x: 90, y: 38, size: 2, twinkleSpeed: 1.1, delay: 4 },
    { x: 7, y: 58, size: 1, twinkleSpeed: 1.5, delay: 13 },
    { x: 94, y: 62, size: 1.5, twinkleSpeed: 1.2, delay: 0 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: "#000000",
        overflow: "hidden",
      }}
    >
      {/* Stars */}
      {stars.map((star, i) => (
        <Star key={`star-${i}`} {...star} />
      ))}

      {/* Animated background grid */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage: `
            linear-gradient(rgba(0, 200, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 200, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          opacity: interpolate(frame, [0, 30], [0, 0.5], {
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Light beams */}
      <LightBeam rotation={0} delay={5} />
      <LightBeam rotation={45} delay={10} />
      <LightBeam rotation={90} delay={15} />
      <LightBeam rotation={135} delay={20} />
      <LightBeam rotation={180} delay={8} />
      <LightBeam rotation={225} delay={12} />
      <LightBeam rotation={270} delay={18} />
      <LightBeam rotation={315} delay={22} />

      {/* Particles */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Center content */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Glow rings */}
        <GlowRing delay={20} orbitSpeed={0.04} startAngle={0} />
        <GlowRing delay={35} orbitSpeed={0.03} startAngle={Math.PI * 2 / 3} />
        <GlowRing delay={50} orbitSpeed={0.02} startAngle={Math.PI * 4 / 3} />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: `scale(${logoScale})`,
          }}
        >
          <Img
            src={staticFile("logo_rr.png")}
            style={{
              height: 580,
              opacity: logoOpacity,
              filter: `drop-shadow(0 0 ${logoGlow}px rgba(0, 200, 255, 0.8)) drop-shadow(0 0 ${logoGlow * 2}px rgba(0, 200, 255, 0.4))`,
            }}
          />
        </div>
      </AbsoluteFill>

      {/* Text - Robert Roksela Software Development */}
      <Sequence from={100}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 620,
          }}
        >
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 48,
              fontWeight: 600,
              color: "#ffffff",
              textAlign: "center",
              opacity: textOpacity,
              transform: `translateY(${textY}px)`,
              letterSpacing: textSpacing,
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 200, 255, 0.6)",
            }}
          >
            ROBERT ROKSELA
          </div>
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 24,
              fontWeight: 500,
              color: "rgba(0, 200, 255, 0.95)",
              textAlign: "center",
              opacity: textOpacity,
              transform: `translateY(${textY + 10}px)`,
              letterSpacing: textSpacing * 0.4,
              marginTop: 18,
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 200, 255, 0.5)",
            }}
          >
            SOFTWARE DEVELOPMENT
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, ${vignetteIntensity}) 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Horizontal light sweep */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)`,
          transform: `translateX(${interpolate(frame, [30, 70], [-100, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}%)`,
          opacity: interpolate(frame, [30, 50, 70], [0, 0.3, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
    </AbsoluteFill>
  );
};
