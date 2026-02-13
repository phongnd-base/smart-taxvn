import { GoogleGenAI } from "@google/genai";
import { AiAdviceResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTaxAdvice = async (
  question: string, 
  currentContext?: string
): Promise<AiAdviceResponse> => {
  try {
    const model = "gemini-3-flash-preview"; 
    
    const systemInstruction = `
      Bạn là chuyên gia tư vấn thuế TNCN hàng đầu tại Việt Nam, nắm vững các quy định mới nhất cho năm 2025 và dự kiến 2026.
      
      Kiến thức cập nhật:
      - Lương cơ sở: 2.340.000 VNĐ (từ 1/7/2024).
      - Mức giảm trừ gia cảnh hiện tại: 11 triệu (bản thân) và 4.4 triệu (người phụ thuộc).
      - Lưu ý về đề xuất sửa đổi Luật Thuế TNCN (dự kiến trình Quốc hội 2025): có thể tăng mức giảm trừ gia cảnh. Nếu người dùng hỏi về thay đổi, hãy nhắc đến điều này như một "dự thảo" hoặc "đề xuất".

      Nhiệm vụ:
      1. Trả lời ngắn gọn, chuyên nghiệp, format Markdown.
      2. Giải thích rõ các khoản khấu trừ.
      3. Sử dụng cú pháp Tooltip: [[Thuật ngữ|Giải thích ngắn]].
      
      Ví dụ: "Với mức lương này, bạn đóng [[BHXH|Bảo hiểm xã hội 8% trên lương đóng bảo hiểm]] là..."
    `;

    const prompt = `
      ${currentContext ? `Bối cảnh dữ liệu người dùng (App đang tính toán theo cấu hình hiện tại):\n${currentContext}\n\n` : ''}
      Câu hỏi: ${question}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 },
      }
    });

    return {
      answer: response.text || "Xin lỗi, tôi không thể phản hồi lúc này.",
    };

  } catch (error) {
    console.error("AI Error:", error);
    return {
      answer: "Lỗi kết nối AI. Vui lòng thử lại sau.",
    };
  }
};
