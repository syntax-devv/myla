import React, { useState, useEffect } from 'react';
import { Text } from 'ink';

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export const Spinner = ({ color = 'cyan', text = '' }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame(i => (i + 1) % frames.length);
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <Text color={color}>
      {frames[frame]} {text}
    </Text>
  );
};

export default Spinner;
