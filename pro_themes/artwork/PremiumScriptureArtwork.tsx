import React from 'react';
import Svg, {
  Circle,
  G,
  Path,
  Rect,
} from 'react-native-svg';

type ScriptureType = 'Bhagavad Gita' | 'Quran';

interface PremiumScriptureArtworkProps {
  scripture: ScriptureType;
  color: string;
  glow: string;
  opacity?: number;
}

export default function PremiumScriptureArtwork({
  scripture,
  color,
  glow,
  opacity = 0.14,
}: PremiumScriptureArtworkProps) {
  return (
    <Svg
      pointerEvents="none"
      width="250"
      height="260"
      viewBox="0 0 250 260"
      style={{
        position: 'absolute',
        right: -10,
        bottom: -8,
        opacity,
      }}
    >
      {scripture === 'Bhagavad Gita' ? (
        <G>
          {/* Krishna-inspired serene silhouette */}
          <Circle
            cx="176"
            cy="68"
            r="24"
            fill={color}
          />

          {/* Crown / peacock-feather inspired shape */}
          <Path
            d="M158 47 C166 27 184 18 202 28 C190 34 183 43 181 55 Z"
            fill={glow}
          />

          <Path
            d="M171 43 C178 25 193 16 211 23 C198 31 190 43 187 57 Z"
            fill={color}
            opacity={0.8}
          />

          {/* Face / neck */}
          <Path
            d="M158 78 C163 92 176 98 187 90 L192 119 L164 119 Z"
            fill={color}
          />

          {/* Shoulder + flowing robe silhouette */}
          <Path
            d="M126 168
               C132 130 146 108 171 104
               C198 100 218 120 226 157
               L242 229
               L113 229 Z"
            fill={color}
          />

          {/* Flute */}
          <Rect
            x="136"
            y="116"
            width="94"
            height="5"
            rx="2.5"
            fill={glow}
            transform="rotate(8 136 116)"
          />

          <Circle cx="158" cy="121" r="3" fill={glow} />
          <Circle cx="176" cy="123" r="3" fill={glow} />
          <Circle cx="194" cy="126" r="3" fill={glow} />

          {/* Decorative aura */}
          <Circle
            cx="176"
            cy="122"
            r="92"
            fill="none"
            stroke={glow}
            strokeWidth="2"
            opacity={0.45}
          />

          <Circle
            cx="176"
            cy="122"
            r="108"
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity={0.3}
          />
        </G>
      ) : (
        <G>
          {/* Makkah / Madina inspired architectural silhouette */}

          {/* Main dome */}
          <Path
            d="M82 119
               C82 91 102 70 126 70
               C150 70 170 91 170 119 Z"
            fill={color}
          />

          {/* Crescent */}
          <Path
            d="M126 51
               C116 39 119 27 130 21
               C124 34 128 43 139 47
               C134 51 130 52 126 51 Z"
            fill={glow}
          />

          {/* Main building */}
          <Rect
            x="65"
            y="119"
            width="123"
            height="84"
            rx="3"
            fill={color}
          />

          {/* Central doorway */}
          <Path
            d="M111 203 V163
               C111 151 119 143 127 143
               C135 143 143 151 143 163
               V203 Z"
            fill={glow}
            opacity={0.65}
          />

          {/* Minarets */}
          <Rect x="38" y="88" width="14" height="115" rx="3" fill={color} />
          <Circle cx="45" cy="82" r="10" fill={color} />

          <Rect x="197" y="78" width="14" height="125" rx="3" fill={color} />
          <Circle cx="204" cy="72" r="10" fill={color} />

          {/* Courtyard arches */}
          <Path
            d="M76 136
               C76 124 88 124 88 136 V158
               H76 Z"
            fill={glow}
            opacity={0.45}
          />

          <Path
            d="M91 136
               C91 124 103 124 103 136 V158
               H91 Z"
            fill={glow}
            opacity={0.45}
          />

          <Path
            d="M151 136
               C151 124 163 124 163 136 V158
               H151 Z"
            fill={glow}
            opacity={0.45}
          />

          <Path
            d="M166 136
               C166 124 178 124 178 136 V158
               H166 Z"
            fill={glow}
            opacity={0.45}
          />

          {/* Horizon / ornamental lines */}
          <Path
            d="M24 213 H226"
            stroke={glow}
            strokeWidth="2"
            opacity={0.6}
          />

          <Path
            d="M42 225 H208"
            stroke={color}
            strokeWidth="1.5"
            opacity={0.45}
          />

          {/* Architectural aura */}
          <Circle
            cx="127"
            cy="137"
            r="103"
            fill="none"
            stroke={glow}
            strokeWidth="2"
            opacity={0.3}
          />
        </G>
      )}
    </Svg>
  );
}
