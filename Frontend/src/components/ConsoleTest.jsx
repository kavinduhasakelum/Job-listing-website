import React, { useEffect } from 'react';

/**
 * Console Test Component
 * 
 * Add this to your page to verify console.log is working
 * 
 * Usage in JobView.jsx (temporary):
 * import ConsoleTest from './ConsoleTest';
 * 
 * Then add <ConsoleTest /> anywhere in the JSX
 */

const ConsoleTest = () => {
  useEffect(() => {
    console.log('✅ CONSOLE TEST: Console is working!');
    console.log('✅ CONSOLE TEST: If you see this, console.log works');
    console.error('⚠️ CONSOLE TEST: This is an error (should be red)');
    console.warn('⚠️ CONSOLE TEST: This is a warning (should be yellow)');
    console.info('ℹ️ CONSOLE TEST: This is info (should be blue)');
    
    // Test with alert too
    setTimeout(() => {
      alert('If you see this alert, JavaScript is running!');
    }, 1000);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'red',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '5px',
      zIndex: 9999,
      fontWeight: 'bold'
    }}>
      🔍 CONSOLE TEST ACTIVE - Check Console (F12)
    </div>
  );
};

export default ConsoleTest;
