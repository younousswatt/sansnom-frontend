import Chat from '../../components/Chat/Chat';
import './ChatPage.css';

export default function ChatPage({ onShowAuth }) {
  return (
    <div className="chat-page">
      <Chat onShowAuth={onShowAuth} />
    </div>
  );
}
