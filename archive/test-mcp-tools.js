#!/usr/bin/env node

// Simple test client for MCP tools
const http = require('http');

async function testMcpTool(toolName, params = {}, sessionId = null) {
  console.log(`\n=== Testing ${toolName} ===`);
  
  const data = JSON.stringify({
    jsonrpc: '2.0',
    id: Math.random().toString(36).substring(7),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: params
    }
  });

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
    'Content-Length': Buffer.byteLength(data),
  };
  
  if (sessionId) {
    headers['mcp-session-id'] = sessionId;
  }

  const options = {
    hostname: 'localhost',
    port: 7961,
    path: '/mcp',
    method: 'POST',
    headers: headers,
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          if (response.result && response.result.content) {
            console.log('✅ Success:');
            response.result.content.forEach(content => {
              console.log(content.text);
            });
          } else if (response.error) {
            console.log('❌ Error:', response.error.message);
          } else {
            console.log('📄 Response:', JSON.stringify(response, null, 2));
          }
          resolve(response);
        } catch (err) {
          console.log('❌ Parse error:', err.message);
          console.log('Raw response:', body);
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Request error:', err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

async function initializeSession() {
  console.log('=== Initializing MCP Session ===');
  
  const data = JSON.stringify({
    jsonrpc: '2.0',
    id: 'init',
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
        logging: {}
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  });

  const options = {
    hostname: 'localhost',
    port: 7961,
    path: '/mcp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          console.log('✅ Session initialized');
          // Extract session ID from response headers
          const sessionId = res.headers['mcp-session-id'];
          if (sessionId) {
            console.log('📋 Session ID:', sessionId);
            return resolve(sessionId);
          }
          resolve(null);
        } catch (err) {
          console.log('❌ Parse error:', err.message);
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      console.log('❌ Request error:', err.message);
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    // Initialize session first
    const sessionId = await initializeSession();
    
    // Test get_export_directory tool
    await testMcpTool('get_export_directory', {}, sessionId);
    
    // Test open_export_directory tool
    await testMcpTool('open_export_directory', {}, sessionId);
    
    // Test other tools
    await testMcpTool('get_studio_url', {}, sessionId);
    await testMcpTool('list_animations', {}, sessionId);
    
    console.log('\n✅ All tests completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main();