import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({
  apiKey: "sk-bokji-LN9qfgFlnifEVsitGbSaT3BlbkFJBeINmsFdEye56ZwfypDZ",
});

const listAssistant = async () => {
  const assistants = await openai.beta.assistants.list();
  console.log(assistants.data);
};

async function queryAssistant(promptText) {
  const file = await openai.files.create({
    file: fs.createReadStream("2.csv"),
    purpose: "assistants",
  });

  const assistant = await openai.beta.assistants.create({
    name: "한국 복지 서비스 알리미",
    description:
      "한국 복지 서비스 알리미 is programmed to handle pre-trained data in CSV and JSON formats, specifically tailored to welfare services information. It should match user-inputted personas, including age, gender, and situation descriptions, to select the appropriate data format—specific rows from CSVs or keys from JSON objects. The GPT must ensure accurate matching and provide relevant data suggestions based on the persona details provided by the user. It should prioritize privacy and data security in processing these sensitive inputs.",
    model: "gpt-4-turbo",
    tools: [{ type: "code_interpreter" }],
    tool_resources: {
      code_interpreter: {
        file_ids: [file.id],
      },
    },
  });

  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content:
          "안녕! 나는 20대 초반의 남성이야. 지금 일자리를 구하려고 하는데, 나에게 맞는 복지 서비스를 추천 해줄 수 있을까?",
        attachments: [
          {
            file_id: file.id,
            tools: [{ type: "code_interpreter" }],
          },
        ],
      },
    ],
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
    model: "gpt-4-turbo",
    instructions: "New instructions that override the Assistant instructions",
    tools: [{ type: "code_interpreter" }, { type: "file_search" }],
  });

  console.log(run);
}

// queryAssistant("Hello, world!");
listAssistant();
