import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, ChevronLeft, User as UserIcon } from 'lucide-react';

const ChatWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null); // { id: receiverId, name: receiverName }
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await axios.get('/api/messages', { headers: { 'x-auth-token': token } });
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages", err);
    }
  };

  // Poll for messages when open
  useEffect(() => {
    if (!isOpen) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Listen for openChat events from other components
  useEffect(() => {
    const handleOpenChat = (e) => {
      const { id, name } = e.detail;
      if (id === user?.id) {
        alert("You cannot message yourself!");
        return;
      }
      setActiveChat({ id, name });
      setIsOpen(true);
      fetchMessages();
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeChat]);



  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat) return;

    const msgObj = { receiverId: activeChat.id, message: inputText };
    setInputText('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/messages', msgObj, { headers: { 'x-auth-token': token } });
      await fetchMessages();
    } catch (err) {
      console.error("Error sending message", err);
      alert('Failed to send message');
    }
    setLoading(false);
  };

  // Group messages to find unique conversations
  const getConversations = () => {
    const convoMap = {};
    messages.forEach(msg => {
      const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
      // We don't have the other user's name if we sent the first message and they haven't replied.
      // But we captured senderName in the backend. 
      // If they sent it, we know their name.
      const otherName = msg.senderId === user.id ? "Unknown User (You started chat)" : msg.senderName;
      
      if (!convoMap[otherId] || new Date(msg.createdAt) > new Date(convoMap[otherId].lastDate)) {
        convoMap[otherId] = {
          id: otherId,
          name: convoMap[otherId] && convoMap[otherId].name !== "Unknown User (You started chat)" ? convoMap[otherId].name : otherName,
          lastMessage: msg.message,
          lastDate: msg.createdAt
        };
      }
    });
    return Object.values(convoMap).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));
  };

  if (!user) return null;

  const filteredMessages = activeChat 
    ? messages.filter(m => 
        (m.senderId === user.id && m.receiverId === activeChat.id) ||
        (m.senderId === activeChat.id && m.receiverId === user.id)
      )
    : [];

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '6rem', zIndex: 100 }}> {/* Positioned left of notifications */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="card glass"
            style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '1rem', width: '350px', height: '450px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}
          >
            {/* Chat Window Header */}
            <div style={{ background: 'rgba(16,185,129,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {activeChat ? (
                  <button onClick={() => setActiveChat(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <ChevronLeft size={20} />
                  </button>
                ) : (
                  <MessageCircle size={20} color="#10b981" />
                )}
                <h4 style={{ color: 'white', margin: 0, fontSize: '1rem' }}>
                  {activeChat ? activeChat.name : 'Messages'}
                </h4>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} ref={scrollRef}>
              {!activeChat ? (
                // Conversation List
                getConversations().length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>No conversations yet. Message an organizer from the Projects page!</p>
                ) : (
                  getConversations().map(convo => (
                    <div 
                      key={convo.id} 
                      onClick={() => setActiveChat({ id: convo.id, name: convo.name })}
                      style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><UserIcon size={14} color="#10b981"/> {convo.name}</span>
                      </div>
                      <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {convo.lastMessage}
                      </p>
                    </div>
                  ))
                )
              ) : (
                // Message Thread
                <>
                  {filteredMessages.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>Say hello!</p>
                  ) : (
                    filteredMessages.map((msg, i) => {
                      const isMe = msg.senderId === user.id;
                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '0.5rem' }}>
                          <div style={{ 
                            background: isMe ? 'linear-gradient(135deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)', 
                            color: 'white', 
                            padding: '0.5rem 0.8rem', 
                            borderRadius: '12px', 
                            borderBottomRightRadius: isMe ? '2px' : '12px',
                            borderBottomLeftRadius: !isMe ? '2px' : '12px',
                            maxWidth: '80%',
                            fontSize: '0.88rem',
                            lineHeight: '1.4'
                          }}>
                            {msg.message}
                          </div>
                        </div>
                      )
                    })
                  )}
                </>
              )}
            </div>

            {/* Message Input Form */}
            {activeChat && (
              <form onSubmit={sendMessage} style={{ display: 'flex', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  maxLength="500"
                  style={{ flex: 1, margin: 0, padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.85rem' }}
                />
                <button type="submit" disabled={loading || !inputText.trim()} style={{ background: 'none', border: 'none', color: inputText.trim() ? '#10b981' : '#475569', padding: '0 0.5rem 0 0.75rem', cursor: inputText.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}>
                  <Send size={18} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary"
        style={{ width: '58px', height: '58px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(56,189,248,0.4)', background: 'linear-gradient(135deg, #10b981, #38bdf8)' }}
      >
        <MessageCircle size={26} color="white" />
      </button>
    </div>
  );
};

export default ChatWidget;
