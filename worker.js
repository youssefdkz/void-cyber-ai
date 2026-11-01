export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // استقبال رسائل الشات
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
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
                  "أنت VOID، مساعد ذكي يتحدث العربية. ساعد في البرمجة والأمن السيبراني الدفاعي وحماية المواقع والأجهزة وتحليل المشكلات. لا تقدم تعليمات لاختراق أنظمة أو إيذاء الآخرين. كن واضحًا ومفيدًا."
              },
              {
                role: "user",
                content: message
              }
            ]
          }
        );

        return Response.json({
          reply: result.response || result.output_text || result.text || "لم يصل رد."
        });

      } catch (error) {
        return Response.json(
          { error: "حدث خطأ: " + error.message },
          { status: 500 }
        );
      }
    }

    // عرض واجهة VOID
    return env.ASSETS.fetch(request);
  }
};