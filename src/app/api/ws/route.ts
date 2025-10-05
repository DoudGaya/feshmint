import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';

declare global {
  var wss: WebSocketServer | undefined;
}

// Simple WebSocket server implementation
if (!global.wss) {
  global.wss = new WebSocketServer({ port: 8080 });
  
  global.wss.on('connection', (ws) => {
    console.log('📡 WebSocket client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('📥 Received message:', data);
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe':
            // Subscribe to specific channels
            ws.send(JSON.stringify({
              type: 'subscription_confirmed',
              channel: data.channel
            }));
            break;
            
          case 'execute_trade':
            // Handle manual trade execution
            console.log('💼 Manual trade request:', data.payload);
            // This would trigger the trading engine
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
    });
    
    // Send initial connection message
    ws.send(JSON.stringify({
      type: 'connected',
      timestamp: Date.now()
    }));
  });
  
  console.log('🚀 WebSocket server started on port 8080');
}

// Internal function to broadcast to all clients
function broadcastToAllClients(type: string, payload: unknown) {
  if (global.wss) {
    global.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({
          type,
          payload,
          timestamp: Date.now()
        }));
      }
    });
  }
}

// Next.js API route handler (dummy - WebSocket handled above)
export async function GET(request: NextRequest) {
  return new Response('WebSocket server running on port 8080', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}
