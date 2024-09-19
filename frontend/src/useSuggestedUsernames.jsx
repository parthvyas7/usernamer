import { useState, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const useSuggestedUsernames = () => {
  const minuteLimit = 3;
  const cacheKey = "cachedUsernames";
  const requestCountKey = "requestCount";
  const requestTimestampKey = "requestTimestamp";
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt =
    "Suggest 5 awesome usernames which can be used across web and give out your response with only 5 usernames in single line, space-separated";
  const [cachedResults, setCachedResults] = useState([]);

  useEffect(() => {
    const storedCache = localStorage.getItem(cacheKey);
    if (storedCache) setCachedResults(JSON.parse(storedCache));
  }, []);

  const canMakeRequest = () => {
    const currentTime = Date.now();
    const lastRequestTimestamp = localStorage.getItem(requestTimestampKey);
    const requestCount =
      parseInt(localStorage.getItem(requestCountKey), 10) || 0;

    // Reset minute count if more than a minute has passed
    if (lastRequestTimestamp && currentTime - lastRequestTimestamp > 60000) {
      localStorage.setItem(requestCountKey, "0");
      return true;
    }

    if (requestCount >= minuteLimit) return false;

    return true;
  };

  // Get random usernames from cache
  const getRandomUsernames = useCallback(
    (count) => {
      const shuffled = [...cachedResults].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    },
    [cachedResults]
  );

  const run = useCallback(async () => {
    if (!canMakeRequest()) return getRandomUsernames(5); // Return from cache if limit exceeded

    try {
      const rawResponse = await model.generateContent(prompt);
      const response = rawResponse.response
        .text()
        .split(" ")
        .filter((el) => el && el !== "\n");

      const newCache = [...new Set([...cachedResults, ...response])]; // Remove duplicates
      const newlyCachedResults = newCache.slice(-10); // Limit cache size to 10
      setCachedResults(newlyCachedResults);
      localStorage.setItem(cacheKey, JSON.stringify(newlyCachedResults));

      const requestCount =
        parseInt(localStorage.getItem(requestCountKey), 10) || 0;
      localStorage.setItem(requestCountKey, (requestCount + 1).toString());
      localStorage.setItem(requestTimestampKey, Date.now().toString());
    } catch (error) {
      console.error("Error making request:", error);
      return getRandomUsernames(5);
    }
  }, [cachedResults, model, getRandomUsernames]);

  useEffect(() => {
    run();
  }, [run]);

  return getRandomUsernames(5);
};

export default useSuggestedUsernames;
