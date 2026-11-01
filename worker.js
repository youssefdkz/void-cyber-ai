export default {
  async fetch(request, env) {
    const url = new URL(request.url);

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
                content: "أنت VOID، مساعد ذكي يتحدث العربية. ساعد في البرمجة والأمن السيبراني الدفاعي وحماية المواقع والأجهزة. كن واضحًا ومفيدًا."
              },
              {
                role: "user",
                content: message
              }
            ],
            chat_template_kwargs: {
              enable_thinking: false
            }
          }
        );

        const reply =
          result?.choices?.[0]?.message?.content ||
          result?.response ||
          result?.output_text ||
          result?.text;

        if (!reply) {
          return Response.json(
            { error: "النموذج لم يُرجع نصًا. حاول مرة أخرى." },
            { status: 502 }
          );
        }

        return Response.json({ reply });

      } catch (error) {
        return Response.json(
          { error: "خطأ من الذكاء الاصطناعي: " + error.message },
          { status: 500 }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};