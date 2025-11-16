const API_URL = "https://teminai.onrender.com";

export async function sendQuestionToGemini(question) {
  const response = await fetch(`${API_URL}/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  const data = await response.json();
  return data.answer;
}
