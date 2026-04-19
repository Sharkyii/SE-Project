import React from 'react';

export const TestPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-white mb-4">TEST PAGE - ROUTING WORKS!</h1>
      <p className="text-2xl text-green-400">If you can see this, routing is working correctly.</p>
      <div className="mt-8 p-6 glass-effect rounded-xl">
        <h2 className="text-2xl text-white mb-4">Debug Info:</h2>
        <p className="text-gray-300">Current URL: {window.location.href}</p>
        <p className="text-gray-300">Pathname: {window.location.pathname}</p>
      </div>
    </div>
  );
};

export default TestPage;
