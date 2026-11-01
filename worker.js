
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
          "@cf/meta/llama-3.2-3b-instruct",
          {
            messages: [
              {
                role: "system",
                content: "أنت VOID، مساعد عربي ذكي. أجب بوضوح وباختصار، واستخدم لغة المستخدم."
              },
              {
                role: "user",
                content: message
              }
            ]
          }
        );

        return Response.json({
          diagnostic: true,
          result: result
        });

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
