import { NextResponse } from 'next/server';

export async function GET() {
  const COMFY_URL = process.env.COMFY_URL || 'http://127.0.0.1:8188';

  try {
    // Try to fetch ComfyUI's system stats endpoint
    const response = await fetch(`${COMFY_URL}/system_stats`);

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'ComfyUI is accessible!',
        url: COMFY_URL,
        stats: data
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `ComfyUI returned status ${response.status}`,
        url: COMFY_URL
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Cannot connect to ComfyUI',
      url: COMFY_URL,
      error: error.message,
      hint: 'Make sure ComfyUI is running and check the port number'
    }, { status: 500 });
  }
}
