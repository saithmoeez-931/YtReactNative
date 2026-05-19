import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme/theme';

const iconPaths = {
  'add-circle-outline': (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 8v8M8 12h8" />
    </>
  ),
  'business-outline': (
    <>
      <Rect x="4" y="3" width="12" height="18" rx="2" />
      <Path d="M8 7h4M8 11h4M8 15h4M16 9h4v12h-4" />
    </>
  ),
  'document-text-outline': (
    <>
      <Path d="M7 3h7l4 4v14H7zM14 3v5h4" />
      <Path d="M10 12h5M10 16h5" />
    </>
  ),
  'ellipse-outline': <Circle cx="12" cy="12" r="7" />,
  'eye-off-outline': (
    <>
      <Path d="M3 3l18 18" />
      <Path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <Path d="M9.5 5.4A9.8 9.8 0 0 1 12 5c5 0 8 4.5 9 7a13.1 13.1 0 0 1-2.1 3.3" />
      <Path d="M6.4 6.7A13 13 0 0 0 3 12c1 2.5 4 7 9 7a9.7 9.7 0 0 0 4-.9" />
    </>
  ),
  'eye-outline': (
    <>
      <Path d="M3 12c1-2.5 4-7 9-7s8 4.5 9 7c-1 2.5-4 7-9 7s-8-4.5-9-7z" />
      <Circle cx="12" cy="12" r="3" />
    </>
  ),
  'grid-outline': (
    <>
      <Rect x="4" y="4" width="6" height="6" rx="1.5" />
      <Rect x="14" y="4" width="6" height="6" rx="1.5" />
      <Rect x="4" y="14" width="6" height="6" rx="1.5" />
      <Rect x="14" y="14" width="6" height="6" rx="1.5" />
    </>
  ),
  'home-outline': (
    <>
      <Path d="M4 11l8-7 8 7" />
      <Path d="M6 10v10h12V10" />
      <Path d="M10 20v-6h4v6" />
    </>
  ),
  'pause-circle-outline': (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M10 8v8M14 8v8" />
    </>
  ),
  'people-outline': (
    <>
      <Circle cx="9" cy="8" r="3" />
      <Circle cx="17" cy="9" r="2.5" />
      <Path d="M3 20c.7-4 3-6 6-6s5.3 2 6 6" />
      <Path d="M14 15c2.8.2 4.8 2 5.5 5" />
    </>
  ),
  'person-outline': (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c1-5 4-8 8-8s7 3 8 8" />
    </>
  ),
  'shield-checkmark-outline': (
    <>
      <Path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z" />
      <Path d="M8.5 12l2.3 2.3 4.7-5" />
    </>
  ),
  'time-outline': (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3.5 2" />
    </>
  ),
};

export default function AppIcon({
  color = colors.textMuted,
  name = 'ellipse-outline',
  size = 22,
  strokeWidth = 1.9,
  style,
}) {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      style={style}
      viewBox="0 0 24 24"
      width={size}
    >
      {iconPaths[name] || iconPaths['ellipse-outline']}
    </Svg>
  );
}
