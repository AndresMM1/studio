export async function sendWhatsAppGroupMessage(message: string, groupName?: string, endpoint?: string): Promise<any> {
  // Use globalThis to safely read process.env without requiring @types/node in client builds
  const env = (globalThis as any).process?.env ?? {};
  const targetEndpoint = endpoint ?? env.NEXT_PUBLIC_WHATSAPP_ENDPOINT ?? env.WHATSAPP_ENDPOINT ?? "https://edacffc65d5f.ngrok-free.app/send-group";
  const targetGroup = groupName ?? env.NEXT_PUBLIC_WHATSAPP_GROUP_NAME ?? env.WHATSAPP_GROUP_NAME ?? "testingau";

  try {
    const payload = { groupName: targetGroup, message };
    const res = await fetch(targetEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`WhatsApp webhook failed: ${res.status} ${text}`);
    }

    // return parsed response if any
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  } catch (err) {
    console.error("sendWhatsAppGroupMessage error:", err);
    throw err;
  }
}
