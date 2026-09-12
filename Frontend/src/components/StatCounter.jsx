import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const StatCounter = ({ value, prefix = '', suffix = '', decimals = 0, duration = 2 }) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]+/g, '')) || 0;
  
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const displayValue = useTransform(spring, (current) =>
    prefix + current.toLocaleString('en-IN', { maximumFractionDigits: decimals }) + suffix
  );

  const [renderedText, setRenderedText] = useState(prefix + '0' + suffix);

  useEffect(() => {
    spring.set(numericValue);
    const unsubscribe = displayValue.on('change', (latest) => setRenderedText(latest));
    return () => unsubscribe();
  }, [numericValue, spring, displayValue, prefix, suffix]);

  return <motion.span className="font-extrabold tracking-tight">{renderedText}</motion.span>;
};
