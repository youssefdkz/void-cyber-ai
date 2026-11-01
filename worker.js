
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API: VOID Chat
    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") {
        return Response.json(
          { error: "استخدم POST لإرسال الرسائل." },
          { status: 405 }
        );
      }

      try {
        if (!env.AI) {
          throw new Error("Workers AI binding غير متصل.");
        }

        const body = await request.json();
        const message = String(body.message || "").trim();

        if (!message) {
          return Response.json(
            { error: "اكتب رسالة الأول." },
            { status: 400 }
          );
        }

        const result = await env.AI.run(
          "@cf/google/gemma-4-26b-a4b-it",
          {
            messages: [
              {
                role: "system",
                content:
                  "أنت VOID، مساعد ذكي يتحدث العربية. ساعد في البرمجة والأمن السيبراني الدفاعي وحماية المواقع والأجهزة. كن واضحًا ومفيدًا."
              },
              {
                role: "user",
                content: message
              }
            ]
          }
        );

        // قراءة صيغ الرد المحتملة
        const reply =
          result?.response ||
          result?.choices?.[0]?.message?.content ||
          result?.output_text ||
          result?.text ||
          result?.content;

        if (typeof reply !== "string" || !reply.trim()) {
          return Response.json(
            {
              error: "النموذج لم يُرجع نصًا.",
              debug: JSON.stringify(result).slice(0, 1500)
            },
            { status: 502 }
          );
        }

        return Response.json({ reply: reply.trim() });

      } catch (error) {
        return Response.json(
          {
            error: "خطأ من الذكاء الاصطناعي: " + error.message
          },
          { status: 500 }
        );
      }
    }

    // عرض ملفات الموقع
    return env.ASSETS.fetch(request);
  }
};
