
import os
import requests
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder="public")

@app.route("/")
def home():
    return send_from_directory("public", "index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json(silent=True) or {}
        message = str(data.get("message", "")).strip()

        if not message:
            return jsonify({"error": "اكتب رسالة الأول"}), 400

        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            return jsonify({"error": "مفتاح Gemini API غير مضبوط."}), 500

        url = (
            "https://generativelanguage.googleapis.com/v1beta/"
            "models/gemini-2.5-flash:generateContent"
        )

        response = requests.post(
            url,
            params={"key": api_key},
            json={
                "contents": [
                    {"parts": [{"text": message}]}
                ]
            },
            timeout=60
        )

        result = response.json()

        if not response.ok:
            return jsonify({
                "error": result.get("error", {}).get("message", "خطأ من Gemini")
            }), response.status_code

        reply = (
            result.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "")
        )

        if not reply:
            return jsonify({"error": "Gemini لم يُرجع نصًا."}), 502

        return jsonify({"reply": reply})

    except requests.RequestException:
        return jsonify({"error": "تعذر الاتصال بخدمة الذكاء الاصطناعي."}), 502
    except Exception as error:
        return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)))
