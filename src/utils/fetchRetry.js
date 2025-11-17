export async function fetchRetry(url, options = {}, retry = 5) {
  for (let i = 0; i < retry; i++) {
    try {
      const res = await fetch(url, options);

      if (res.ok) return res; // 성공했으면 바로 리턴
      throw new Error("HTTP error");
    } catch (err) {
      if (i === retry - 1) throw err; // 마지막 시도면 오류 반환

      // 1.5초 기다린 후 다시 시도
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}
