const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatWindow = document.querySelector("#chat-window");
const sendButton = document.querySelector(".send-button");
const chatToggle = document.querySelector("#chat-toggle");
const chatClose = document.querySelector("#chat-close");
const chatPanel = document.querySelector("#chat-panel");
const promptButtons = document.querySelectorAll(".prompt-button");
const gameTrack = document.querySelector(".game-track");
const gameControls = document.querySelectorAll(".game-control");
const chatApiUrl = typeof window.CHAT_API_URL === "string" ? window.CHAT_API_URL.trim() : "";
const maxHistoryMessages = 8;
let conversation = [];
let isSubmitting = false;

function setChatOpen(isOpen) {
  chatPanel.hidden = !isOpen;
  chatToggle.setAttribute("aria-expanded", String(isOpen));
  chatToggle.setAttribute("aria-label", isOpen ? "关闭数字分身" : "打开数字分身");

  if (isOpen) {
    chatInput.focus();
  }
}

const responseRules = [
  {
    keywords: ["最近", "在忙", "做什么", "近况"],
    answer: "没干啥啊，就学学习，健健身。最近还可以，学习健身都有。",
  },
  {
    keywords: ["vibe", "编程", "为什么学", "学习"],
    answer: "就边做边学，先把东西跑起来。能跑就算阶段性成功。",
  },
  {
    keywords: ["擅长", "cpp", "c++", "后端", "技术"],
    answer: "主要是 C++ 基础语法、STL、多线程和并发。勉强实习的水平，能独立做一些小项目。",
  },
  {
    keywords: ["项目", "class2ical", "muduo", "gobang", "五子棋", "课表"],
    answer: "项目主要是拿来练习的。Class2iCal 做课表转日历，muduo 练事件驱动的 TCP 和 HTTP，gobang 是 WebSocket 在线五子棋。重点是能跑，不吹得太厉害。",
  },
  {
    keywords: ["ai", "人工智能", "关心"],
    answer: "关心啊，主要想看看 AI 能不能真的帮我把东西做出来。",
  },
  {
    keywords: ["健身", "锻炼", "运动"],
    answer: "最近在执行谭成义三分化训练。177 cm，82 kg，体脂 15%，先练着。",
  },
  {
    keywords: ["游戏", "玩什么", "娱乐"],
    answer: "主要玩三角洲和无畏契约。三角洲 ID 是智勇双全 beibei，无畏契约 ID 是 bei 神丿男人。",
  },
  {
    keywords: ["发愣", "过载", "大脑", "性格", "特点"],
    answer: "我比较粗心，三分钟热度，大脑也容易过载。专注一件事时，经常会下意识忽略别的东西。",
  },
  {
    keywords: ["身份", "学生", "是谁", "介绍"],
    answer: "我是 Bacon。特点是粗心大意、三分钟热度，容易大脑过载。现在主要在学 C++、做点后端和 vibe coding，项目能跑就算阶段性成功。",
  },
];

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, "");
}

function findResponse(text) {
  const normalizedText = normalize(text);
  const matchedRule = responseRules.find((rule) =>
    rule.keywords.some((keyword) => normalizedText.includes(normalize(keyword))),
  );

  return matchedRule?.answer ?? "不是很懂。";
}

function scrollChatToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addMessage(content, role, variant = "") {
  const message = document.createElement("div");
  message.className = `message message-${role}${variant ? ` ${variant}` : ""}`;

  const author = document.createElement("span");
  author.className = "message-author";
  author.textContent = role === "user" ? "你" : "培根的分身";

  const text = document.createElement("p");
  text.textContent = content;

  message.append(author, text);
  chatWindow.appendChild(message);
  scrollChatToBottom();
}

function addTypingMessage() {
  const message = document.createElement("div");
  message.className = "message message-assistant typing-message";
  message.setAttribute("aria-label", "分身正在思考");

  for (let index = 0; index < 3; index += 1) {
    message.appendChild(document.createElement("span"));
  }

  chatWindow.appendChild(message);
  scrollChatToBottom();
  return message;
}

function setInputState() {
  sendButton.disabled = isSubmitting || !chatInput.value.trim();
  promptButtons.forEach((button) => {
    button.disabled = isSubmitting;
  });
}

function keepRecentMessages() {
  conversation = conversation.slice(-maxHistoryMessages);
}

async function requestChat(messages) {
  if (!chatApiUrl) {
    await new Promise((resolve) => window.setTimeout(resolve, 520));
    return {
      answer: findResponse(messages.at(-1).content),
      remote: false,
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 20_000);

  try {
    const response = await fetch(chatApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || typeof payload.message?.content !== "string") {
      throw new Error(payload.error?.code || "chat_request_failed");
    }

    const answer = payload.message.content.trim();
    if (!answer) {
      throw new Error("chat_response_empty");
    }

    return { answer, remote: true };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function submitMessage(rawMessage) {
  const message = rawMessage.trim();

  if (!message || isSubmitting) {
    setInputState();
    return;
  }

  addMessage(message, "user");
  conversation.push({ content: message, role: "user" });
  keepRecentMessages();
  chatInput.value = "";
  chatInput.style.height = "auto";
  isSubmitting = true;
  setInputState();

  const typingMessage = addTypingMessage();
  try {
    const result = await requestChat(conversation);
    typingMessage.remove();

    if (!result.remote && chatApiUrl) {
      addMessage("AI 暂时不可用，已切回本地演示。", "assistant", "message-muted");
    }

    addMessage(result.answer, "assistant");
    conversation.push({ content: result.answer, role: "assistant" });
    keepRecentMessages();
  } catch {
    typingMessage.remove();
    addMessage("AI 暂时不可用，已切回本地演示。", "assistant", "message-muted");
    const fallbackAnswer = findResponse(message);
    addMessage(fallbackAnswer, "assistant");
    conversation.push({ content: fallbackAnswer, role: "assistant" });
    keepRecentMessages();
  } finally {
    isSubmitting = false;
    setInputState();
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void submitMessage(chatInput.value);
});

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, 120)}px`;
  setInputState();
});

chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    void submitMessage(chatInput.value);
  }
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const question = button.dataset.question;
    chatInput.value = question;
    chatInput.dispatchEvent(new Event("input"));
    void submitMessage(question);
  });
});

chatToggle.addEventListener("click", () => {
  setChatOpen(chatPanel.hidden);
});

chatClose.addEventListener("click", () => {
  setChatOpen(false);
  chatToggle.focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !chatPanel.hidden) {
    setChatOpen(false);
    chatToggle.focus();
  }
});

gameControls.forEach((button) => {
  button.addEventListener("click", () => {
    const card = gameTrack.querySelector(".game-card");
    const gap = Number.parseFloat(getComputedStyle(gameTrack).columnGap) || 0;
    const distance = card.getBoundingClientRect().width + gap;
    const direction = button.dataset.direction === "previous" ? -1 : 1;

    gameTrack.scrollBy({
      left: distance * direction,
      behavior: "smooth",
    });
  });
});

setInputState();
