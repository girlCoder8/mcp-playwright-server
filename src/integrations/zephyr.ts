// src/integrations/zephyr.ts
import axios from 'axios';

export async function createZephyrTestResult(status: string, testCaseKey: string, comment: string) {
  const result = await axios.post(`${process.env.ZEPHYR_BASE_URL}/execution`, {
    status,
    testCaseKey,
    comment
  }, {
    headers: {
      Authorization: `Bearer ${process.env.ZEPHYR_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  return result.data;
}
