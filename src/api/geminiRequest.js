import { fetchRetry } from "../utils/fetchRetry";

const API_URL = "https://teminai.onrender.com";
//const API_URL = "http://localhost:8080";


export async function sendQuestionToGemini(question) {
  const response = await fetchRetry(`${API_URL}/gemini`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  const data = await response.json();
  return data.answer;
}
