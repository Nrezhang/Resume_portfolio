import React from 'react';
import { useChat } from './ChatContext';

export default function SessionUsage() {
  const { sessionMessages } = useChat();
  return <section className="session-usage" aria-labelledby="session-usage-title">
    <div className="settings-section-title"><h3 id="session-usage-title">Session usage</h3><span>Demo</span></div>
    <dl><div><dt>Messages sent</dt><dd>{sessionMessages}</dd></div><div><dt>AI tokens used</dt><dd>0</dd></div><div><dt>Session limit</dt><dd>Not enabled</dd></div></dl>
    <p>No live AI calls or spending. Message and token limits will apply when AI chat is connected.</p>
  </section>;
}
