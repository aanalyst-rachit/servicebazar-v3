import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function FactoryBackground() {
  const opacity = useRef(new Animated.Value(0.72)).current;
  const translateY = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    const opacityLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.72,
          duration: 2800,
          useNativeDriver: true,
        }),
      ])
    );

    const movementLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -5,
          duration: 3200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 4,
          duration: 3200,
          useNativeDriver: true,
        }),
      ])
    );

    opacityLoop.start();
    movementLoop.start();

    return () => {
      opacityLoop.stop();
      movementLoop.stop();
    };
  }, [opacity, translateY]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 800"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Soft upper geometry */}
          <Circle
            cx="38"
            cy="90"
            r="118"
            fill="#6366f1"
            opacity="0.045"
          />

          <Circle
            cx="362"
            cy="110"
            r="105"
            fill="#8b5cf6"
            opacity="0.038"
          />

          <Circle
            cx="38"
            cy="90"
            r="82"
            fill="none"
            stroke="#6366f1"
            strokeWidth="1"
            opacity="0.065"
          />

          <Circle
            cx="362"
            cy="110"
            r="74"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1"
            opacity="0.055"
          />

          {/* Main flowing foundation */}
          <Path
            d="M0 610
               C55 560 105 625 160 592
               C220 557 280 625 342 584
               C366 568 386 566 400 560
               L400 800
               L0 800 Z"
            fill="#6366f1"
            opacity="0.045"
          />

          <Path
            d="M0 660
               C70 615 115 680 180 646
               C245 613 310 675 400 625
               L400 800
               L0 800 Z"
            fill="#8b5cf6"
            opacity="0.035"
          />

          {/* Elegant curves */}
          <Path
            d="M-10 650
               C48 594 92 601 136 638
               C178 675 216 674 256 631
               C296 588 344 590 410 638"
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.3"
            opacity="0.20"
          />

          <Path
            d="M-15 690
               C48 642 94 648 138 678
               C180 707 219 708 260 668
               C302 628 348 631 415 672"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="0.9"
            opacity="0.15"
          />

          {/* Universal connected network */}
          <Path
            d="M35 635
               L92 580
               L150 628
               L204 570
               L262 628
               L320 575
               L370 632"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="1"
            opacity="0.14"
          />

          <Path
            d="M92 580 L113 643 L150 628
               M204 570 L224 644 L262 628
               M320 575 L340 642 L370 632"
            fill="none"
            stroke="#6366f1"
            strokeWidth="0.8"
            opacity="0.11"
          />

          {/* Network circles */}
          <Circle
            cx="92"
            cy="580"
            r="27"
            fill="none"
            stroke="#6366f1"
            strokeWidth="1"
            opacity="0.11"
          />

          <Circle
            cx="204"
            cy="570"
            r="34"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="1"
            opacity="0.10"
          />

          <Circle
            cx="320"
            cy="575"
            r="26"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="1"
            opacity="0.10"
          />

          {/* Nodes */}
          <Circle cx="35" cy="635" r="3" fill="#6366f1" opacity="0.22" />
          <Circle cx="92" cy="580" r="3.6" fill="#4f46e5" opacity="0.22" />
          <Circle cx="150" cy="628" r="3" fill="#8b5cf6" opacity="0.20" />
          <Circle cx="204" cy="570" r="3.8" fill="#6366f1" opacity="0.23" />
          <Circle cx="262" cy="628" r="3" fill="#8b5cf6" opacity="0.19" />
          <Circle cx="320" cy="575" r="3.6" fill="#4f46e5" opacity="0.21" />
          <Circle cx="370" cy="632" r="3" fill="#6366f1" opacity="0.18" />

          {/* Fine dots */}
          <Circle cx="54" cy="705" r="2" fill="#6366f1" opacity="0.11" />
          <Circle cx="78" cy="690" r="1.7" fill="#8b5cf6" opacity="0.10" />
          <Circle cx="174" cy="708" r="2" fill="#4f46e5" opacity="0.09" />
          <Circle cx="286" cy="704" r="2" fill="#6366f1" opacity="0.10" />
          <Circle cx="346" cy="696" r="1.7" fill="#8b5cf6" opacity="0.09" />

          {/* Bottom flowing system */}
          <Path
            d="M0 750
               C75 718 124 760 192 736
               C262 712 318 758 400 732"
            fill="none"
            stroke="#64748b"
            strokeWidth="0.8"
            opacity="0.075"
          />

          <Path
            d="M0 770
               C72 742 126 779 194 757
               C264 734 323 778 400 752"
            fill="none"
            stroke="#6366f1"
            strokeWidth="0.7"
            opacity="0.065"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
