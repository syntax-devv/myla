import React from 'react';
import { Box, useStdout } from 'ink';
import { useEffect, useState } from 'react';

export const ScrollView = ({ children, maxHeight = 20 }) => {
  const { stdout } = useStdout();
  const [height, setHeight] = useState(maxHeight);

  useEffect(() => {
    const handleResize = () => {
      const termHeight = stdout.rows;
      setHeight(Math.min(maxHeight, termHeight - 4));
    };
    
    handleResize();
    stdout.on('resize', handleResize);
    return () => stdout.off('resize', handleResize);
  }, [stdout, maxHeight]);

  return (
    <Box 
      flexDirection="column" 
      height={height}
      overflow="hidden"
    >
      {children}
    </Box>
  );
};

export default ScrollView;
