'use client';

import { useState } from 'react';

export default function ApiTestComponent() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      // Test basic connectivity
      const response = await fetch('http://localhost:5000/api/health', {
        mode: 'cors',
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ API Connected! Response: ${JSON.stringify(data)}`);
      } else {
        setTestResult(`❌ API Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`❌ Connection Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testTasksEndpoint = async () => {
    setIsLoading(true);
    setTestResult('Testing tasks endpoint...');
    
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        mode: 'cors',
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Tasks endpoint working! Found ${data.length} tasks`);
      } else {
        setTestResult(`❌ Tasks endpoint error: ${response.status}`);
      }
    } catch (error) {
      setTestResult(`❌ Tasks endpoint failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4">
      <h3 className="text-lg font-semibold mb-4">API Connection Test</h3>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={testApiConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Health
        </button>
        
        <button
          onClick={testTasksEndpoint}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Tasks
        </button>
      </div>
      
      {testResult && (
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
          {testResult}
        </div>
      )}
    </div>
  );
}