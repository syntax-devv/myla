import React from 'react';
import { Box, useStdout } from 'ink';
import { useState, useEffect } from 'react';

const CHROME_ROWS = 7;

export const ScrollView = ({ children }) => {
  const { stdout } = useStdout();
  const [termHeight, setTermHeight] = useState(stdout.rows || 24);

  useEffect(() => {
    const onResize = () => setTermHeight(stdout.rows || 24);
    onResize();
    stdout.on('resize', onResize);
    return () => stdout.off('resize', onResize);
  }, [stdout]);

  const maxItems = Math.max(4, termHeight - CHROME_ROWS);
  const items = React.Children.toArray(children);
  const visible = items.slice(-maxItems);

  return (
    <Box flexDirection="column">
      {visible}
    </Box>
  );
};

export default ScrollView;
