const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatWindow = document.querySelector("#chat-window");
const sendButton = document.querySelector(".send-button");
const promptButtons = document.querySelectorAll(".prompt-button");
const gameTrack = document.querySelector(".game-track");
const gameControls = document.querySelectorAll(".game-control");

const responseRules = [
  {
    keywords: ["最近", "在忙", "做什么", "近况"],
    answer: "最近主要在做 C++ 后端开发，也在学 vibe coding。两边来回切换，偶尔会因为信息太多直接发愣。",
  },
  {
    keywords: ["vibe", "编程", "为什么学", "学习"],
    answer: "我想把写代码从“先想完整再动手”变成更自然的探索。vibe coding 对我来说像是边做边理解，重点是保持好奇心。",
  },
  {
    keywords: ["擅长", "cpp", "c++", "后端", "技术"],
    answer: "我比较擅长 C++，现在关注后端服务、性能和工程实践。遇到复杂问题时，我会先把它拆小一点。",
  },
  {
    keywords: ["ai", "人工智能", "关心"],
    answer: "我很关心 AI，尤其是它怎么进入真实的开发流程。比起追热点，我更想知道它能不能让一个想法更快变成可用的东西。",
  },
  {
    keywords: ["健身", "锻炼", "运动"],
    answer: "健身是我给大脑清缓存的方式。规律动一动之后，很多卡住的事情会突然变得没那么复杂。",
  },
  {
    keywords: ["游戏", "玩什么", "娱乐"],
    answer: "我喜欢游戏，具体玩什么会随阶段变化。对我来说，游戏是放松，也是观察规则、反馈和设计的方式。",
  },
  {
    keywords: ["发愣", "过载", "大脑", "性格", "特点"],
    answer: "我的大脑比较容易过载，所以经常会突然发愣。表面上像是在放空，其实可能是在后台整理刚刚收到的信息。",
  },
  {
    keywords: ["身份", "学生", "是谁", "介绍"],
    answer: "我是王培根，一个正在学习和做项目的学生。现在的关键词是 C++ 后端、vibe coding，还有对 AI 的好奇。",
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

  return matchedRule?.answer ?? "这是一个很好的问题。我的本地分身还没准备好这个答案，但我会先想一会儿，再继续学 C++ 和 AI。";
}

function scrollChatToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addMessage(content, role) {
  const message = document.createElement("div");
  message.className = `message message-${role}`;

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
  sendButton.disabled = !chatInput.value.trim();
}

function submitMessage(rawMessage) {
  const message = rawMessage.trim();

  if (!message) {
    setInputState();
    return;
  }

  addMessage(message, "user");
  chatInput.value = "";
  chatInput.style.height = "auto";
  setInputState();

  const typingMessage = addTypingMessage();
  window.setTimeout(() => {
    typingMessage.remove();
    addMessage(findResponse(message), "assistant");
  }, 520);
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitMessage(chatInput.value);
});

chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = `${Math.min(chatInput.scrollHeight, 120)}px`;
  setInputState();
});

chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitMessage(chatInput.value);
  }
});

promptButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const question = button.dataset.question;
    chatInput.value = question;
    chatInput.dispatchEvent(new Event("input"));
    submitMessage(question);
  });
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
