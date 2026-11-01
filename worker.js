
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") {
        return Response.json({ error: "POST required" }, { status: 405 });
      }

      try {
        if (!env.AI) {
          throw new Error("Workers AI binding غير متصل.");
        }

        const body = await request.json();
        const message = String(body.message || "").trim();

        if (!message) {
          return Response.json({ error: "اكتب رسالة الأول" }, { status: 400 });
        }

        const result = await env.AI.run(
          "@cf/deepseek-ai/deepseek-v4.1-flash-1017",
          {
            messages: [
              {
                role: "system",
                content: "أنت VOID، مساعد عربي ذكي. أجب بوضوح وباللغة التي يستخدمها المستخدم."
              },
              {
                role: "user",
                content: message
              }
            ]
          }
        );

        const reply =
          result?.response ??
          result?.output_text ??
          result?.text ??
          result?.choices?.[0]?.message?.content;

        if (!reply) {
          return Response.json({
            error: "النموذج اشتغل لكن صيغة الرد غير متوقعة.",
            details: result
          }, { status: 502 });
        }

        return Response.json({ reply });

      } catch (error) {
        return Response.json(
          { error: error.message || "حصل خطأ غير معروف" },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
