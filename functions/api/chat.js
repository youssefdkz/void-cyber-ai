export async function onRequestPost({ request, env }) {
  try {
    if (!env.AI) {
      return Response.json(
        { error: "Workers AI binding غير متصل." },
        { status: 500 }
      );
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
              "أنت VOID، مساعد ذكي يتحدث العربية. ساعد في البرمجة والأمن السيبراني الدفاعي وحماية المواقع والأجهزة وتحليل المشكلات. لا تقدم تعليمات لاختراق أنظمة أو إيذاء الآخرين. كن واضحًا ومفيدًا."
          },
          {
            role: "user",
            content: message
          }
        ]
      }
    );

    const reply =
      result.response ||
      result.output_text ||
      result.text ||
      "لم يصل رد من النموذج.";

    return Response.json({ reply });

  } catch (error) {
    return Response.json(
      { error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي: " + error.message },
      { status: 500 }
    );
  }
}