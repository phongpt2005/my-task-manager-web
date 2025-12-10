/**
 * AI Service
 * Groq API Integration for AI features (Free & Fast)
 */

const Groq = require('groq-sdk');

// Initialize Groq client with timeout
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
    timeout: 30000 // 30 second timeout
});

// Use available model (not deprecated)
const MODEL = 'llama-3.3-70b-versatile';

/**
 * Generate daily work plan based on tasks and available time
 */
const generateDailyPlan = async (tasks, availableTime) => {
    try {
        const taskList = tasks.map(t =>
            `- ${t.title} (Ưu tiên: ${t.priority}, Deadline: ${new Date(t.deadline).toLocaleDateString('vi-VN')})`
        ).join('\n');

        const prompt = `Tạo kế hoạch làm việc cho ngày hôm nay:

CÔNG VIỆC:
${taskList || 'Chưa có task nào'}

THỜI GIAN: ${availableTime.startTime || '08:00'} - ${availableTime.endTime || '17:00'}
Nghỉ trưa: ${availableTime.breakTime || '12:00-13:00'}

Yêu cầu: Sắp xếp theo ưu tiên, format markdown với emoji, tiếng Việt.`;

        const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.7
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('AI Generate Plan Error:', error.message);
        throw new Error('Không thể tạo kế hoạch. Lỗi: ' + error.message);
    }
};

/**
 * Summarize task description
 */
const summarizeDescription = async (description) => {
    try {
        const prompt = `Tóm tắt nội dung sau thành 3-5 dòng ngắn gọn bằng tiếng Việt, dùng bullet points:

${description}`;

        const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 300,
            temperature: 0.5
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('AI Summarize Error:', error.message);
        throw new Error('Không thể tóm tắt. Lỗi: ' + error.message);
    }
};

/**
 * Suggest priority level based on task details
 */
const suggestPriority = async (taskDetails) => {
    try {
        const { deadline, difficulty, estimatedTime, title, description } = taskDetails;
        const daysUntilDeadline = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));

        const prompt = `Đề xuất mức độ ưu tiên cho task:
- Tiêu đề: ${title || 'Không có'}
- Deadline: ${daysUntilDeadline} ngày nữa
- Độ khó: ${difficulty || 'medium'}

Trả lời JSON: {"priority": "High/Medium/Low", "reason": "lý do", "tips": "gợi ý"}`;

        const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 200,
            temperature: 0.3
        });

        const response = completion.choices[0].message.content;

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return JSON.parse(response);
        } catch {
            return {
                priority: daysUntilDeadline <= 1 ? 'High' : daysUntilDeadline <= 3 ? 'Medium' : 'Low',
                reason: response || 'Dựa trên deadline',
                tips: 'Xem xét deadline và độ khó để quyết định.'
            };
        }
    } catch (error) {
        console.error('AI Priority Error:', error.message);
        // Fallback logic
        const { deadline } = taskDetails;
        const daysUntilDeadline = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
        return {
            priority: daysUntilDeadline <= 1 ? 'High' : daysUntilDeadline <= 3 ? 'Medium' : 'Low',
            reason: 'Đề xuất dựa trên thời gian còn lại đến deadline',
            tips: 'Nên bắt đầu sớm để hoàn thành đúng hạn'
        };
    }
};

/**
 * Rewrite notes professionally
 */
const rewriteNotes = async (rawNotes) => {
    try {
        const prompt = `Viết lại ghi chú sau thành văn bản chuyên nghiệp, rõ ràng bằng tiếng Việt, thêm emoji:

${rawNotes}`;

        const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 500,
            temperature: 0.6
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('AI Rewrite Error:', error.message);
        throw new Error('Không thể viết lại ghi chú. Lỗi: ' + error.message);
    }
};

// Initialize Google Generative AI for Vision
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Break down large task into subtasks
 */
const breakdownTask = async (taskDescription) => {
    try {
        const prompt = `Từ mô tả công việc sau, hãy phân chia thành các subtask nhỏ, cụ thể để thực hiện.
Mô tả: ${taskDescription}

Trả về định dạng JSON:
{
    "subtasks": [
        { "title": "Tên subtask", "estimatedTime": "thời gian ước lượng (phút/giờ)" }
    ]
}`;

        const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" },
            max_tokens: 1000,
            temperature: 0.5
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('AI Breakdown Error:', error.message);
        throw new Error('Không thể phân chia task: ' + error.message);
    }
};

/**
 * Predict deadline risk
 */
const predictDeadline = async (task) => {
    try {
        const prompt = `Phân tích khả năng hoàn thành task này đúng hạn:
Task: ${task.title}
Mô tả: ${task.description}
Độ khó: ${task.difficulty}
Thời gian ước lượng: ${task.estimatedTime} phút
Hạn chót: ${task.deadline}
Ngày bắt đầu: ${task.startDate || new Date()}

Dựa trên kinh nghiệm chung về lập trình/công việc văn phòng, hãy đánh giá rủi ro trễ hạn.
Trả về JSON:
{
    "riskLevel": "Low/Medium/High",
    "reason": "Giải thích ngắn gọn",
    "suggestedAction": "Hành động gợi ý"
}`;

        const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" },
            max_tokens: 500,
            temperature: 0.3
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('AI Predict Deadline Error:', error.message);
        // Fallback default
        return { riskLevel: "Medium", reason: "Không thể phân tích", suggestedAction: "Theo dõi sát sao" };
    }
};

/**
 * Analyze work habits
 */
const analyzeHabits = async (completedTasks) => {
    try {
        // Prepare task log summary
        const taskLogs = completedTasks.map(t =>
            `- ${t.title}: Hoàn thành lúc ${t.completedAt}, Tốn ${t.actualTime || 'N/A'} phút`
        ).join('\n');

        const prompt = `Phân tích thói quen làm việc dựa trên lịch sử hoàn thành task:
${taskLogs}

Hãy đề xuất khung giờ làm việc hiệu quả nhất và lời khuyên cải thiện năng suất. 
Trả về JSON:
{
    "peakProductivityHours": "Ví dụ: 09:00 - 11:00",
    "habits": ["Thói quen tốt/xấu phát hiện được"],
    "suggestions": ["Lời khuyên 1", "Lời khuyên 2"]
}`;

        const completion = await groq.chat.completions.create({
            model: MODEL,
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" },
            max_tokens: 800,
            temperature: 0.6
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('AI Habits Error:', error.message);
        throw new Error('Không thể phân tích thói quen');
    }
};

/**
 * OCR: Convert image to text using Gemini Vision
 */
const processOCR = async (imageBuffer, mimeType) => {
    try {
        const prompt = "Trích xuất toàn bộ văn bản trong hình ảnh này. Chỉ trả về nội dung văn bản, không thêm lời dẫn.";

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: mimeType
            }
        };

        const result = await geminiModel.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI OCR Error:", error.message);
        throw new Error("Không thể nhận diện văn bản từ ảnh");
    }
};

module.exports = {
    generateDailyPlan,
    summarizeDescription,
    suggestPriority,
    rewriteNotes,
    breakdownTask,
    predictDeadline,
    analyzeHabits,
    processOCR
};
