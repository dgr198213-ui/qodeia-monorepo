import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Lógica para resetear el cliente singleton de MCP si existe en el ámbito global
    if ((global as any).__mcp_client) {
      delete (global as any).__mcp_client;
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
