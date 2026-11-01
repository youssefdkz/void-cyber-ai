export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") {
        return Response.json({ error: "POST required" }, { status: 405 });
      }

      try {
        const body = await request.json();
        const message = String(body.message || "").trim();

        if (!message) {
          return Response.json({ error: "اكتب رسالة الأول" }, { status: 400 });
        }

        const result = await env.AI.run(
          "@cf/google/gemma-4-26b-a4b-it",
          {
            messages: [
              {
                role: "system",
                content: "أنت VOID، مساعد عربي مفيد."
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
        return Response.json({
          error: error.message
        }, { status: 500 });
      }
    }

    return env.ASSETS.fetch(request);
  }
};