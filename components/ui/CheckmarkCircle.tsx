import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function CheckmarkCircle({ width = 104, height = 104, color = '#38E078', ...props }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 104 104" fill="none" {...props}>
      <Path d="M52 0C23.4 0 0 23.4 0 52C0 80.6 23.4 104 52 104C80.6 104 104 80.6 104 52C104 23.4 80.6 0 52 0ZM52 93.6C29.068 93.6 10.4 74.932 10.4 52C10.4 29.068 29.068 10.4 52 10.4C74.932 10.4 93.6 29.068 93.6 52C93.6 74.932 74.932 93.6 52 93.6ZM75.868 29.016L41.6 63.284L28.132 49.868L20.8 57.2L41.6 78L83.2 36.4L75.868 29.016Z" fill={color} />
    </Svg>
  );
}
