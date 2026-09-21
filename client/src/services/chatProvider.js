// Replace this provider with the persona/RAG API when it is ready.
// Contract: respond({ messages }) => Promise<{ text, label }>.
export const demoResponseProvider = {
  async respond({ messages }) {
    const question = messages[messages.length - 1]?.text || '';
    return {
      label: 'Demo response',
      text: `Your question, “${question}”, is ready for Henry’s future AI assistant. This is a demo conversation; no live AI or personal knowledge retrieval is connected. You can explore the About me, Projects, and Experience pages for information from the portfolio.`,
    };
  },
};
