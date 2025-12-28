// import React, { useState, useEffect } from 'react';
// import { messageAPI } from '../services/api';
// import { useAuth } from '../context/AuthContext';
// import { formatRelativeTime } from '../utils/formatters';

// const Messages = () => {
//   const { user } = useAuth();
//   const [messages, setMessages] = useState([]);
//   const [selectedMessage, setSelectedMessage] = useState(null);
//   const [conversation, setConversation] = useState([]);
//   const [replyText, setReplyText] = useState('');
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadMessages();
//     loadUnreadCount();
//   }, []);

//   const loadMessages = async () => {
//     try {
//       const response = await messageAPI.getAll();
//       setMessages(response.data.messages);
//     } catch (error) {
//       console.error('Error loading messages:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadUnreadCount = async () => {
//     try {
//       const response = await messageAPI.getUnreadCount();
//       setUnreadCount(response.data.unreadCount);
//     } catch (error) {
//       console.error('Error loading unread count:', error);
//     }
//   };

//   const loadConversation = async (messageId) => {
//     try {
//       const response = await messageAPI.getConversation(messageId);
//       setConversation(response.data.conversation);
//       setSelectedMessage(messageId);
//       loadUnreadCount();
//     } catch (error) {
//       console.error('Error loading conversation:', error);
//     }
//   };

//   const handleSendReply = async (e) => {
//     e.preventDefault();
//     if (!replyText.trim()) return;

//     try {
//       const originalMessage = conversation[0];
//       await messageAPI.send({
//         receiver_id: originalMessage.sender_id === user.id ? originalMessage.receiver_id : originalMessage.sender_id,
//         property_id: originalMessage.property_id,
//         subject: `Re: ${originalMessage.subject}`,
//         message: replyText,
//         parent_id: originalMessage.id
//       });

//       setReplyText('');
//       loadConversation(selectedMessage);
//       loadMessages();
//     } catch (error) {
//       alert('Failed to send message');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p>Loading messages...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-3xl font-bold">Messages</h1>
//         {unreadCount > 0 && (
//           <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
//             {unreadCount} unread
//           </span>
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Messages List */}
//         <div className="lg:col-span-1 bg-white rounded-lg shadow-md">
//           <div className="p-4 border-b">
//             <h2 className="font-semibold">Conversations</h2>
//           </div>
//           <div className="divide-y max-h-[600px] overflow-y-auto">
//             {messages.length === 0 ? (
//               <div className="p-8 text-center text-gray-500">
//                 <div className="text-4xl mb-2">💬</div>
//                 <p>No messages yet</p>
//               </div>
//             ) : (
//               messages.map((msg) => (
//                 <button
//                   key={msg.id}
//                   onClick={() => loadConversation(msg.id)}
//                   className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
//                     selectedMessage === msg.id ? 'bg-blue-50' : ''
//                   } ${!msg.is_read && msg.receiver_id === user.id ? 'bg-yellow-50' : ''}`}
//                 >
//                   <div className="flex items-start gap-3">
//                     <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
//                       {(msg.sender_id === user.id ? msg.receiver_name : msg.sender_name).charAt(0).toUpperCase()}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex justify-between items-start">
//                         <span className="font-semibold truncate">
//                           {msg.sender_id === user.id ? msg.receiver_name : msg.sender_name}
//                         </span>
//                         <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
//                           {formatRelativeTime(msg.created_at)}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-600 truncate">{msg.subject}</p>
//                       {msg.property_title && (
//                         <p className="text-xs text-gray-500 truncate">📍 {msg.property_title}</p>
//                       )}
//                     </div>
//                   </div>
//                 </button>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Conversation View */}
//         <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
//           {!selectedMessage ? (
//             <div className="flex items-center justify-center h-full p-8 text-center text-gray-500">
//               <div>
//                 <div className="text-6xl mb-4">💬</div>
//                 <p>Select a conversation to view messages</p>
//               </div>
//             </div>
//           ) : (
//             <>
//               <div className="p-4 border-b">
//                 <h2 className="font-semibold">{conversation[0]?.subject}</h2>
//                 {conversation[0]?.property_title && (
//                   <p className="text-sm text-gray-600">Property: {conversation[0].property_title}</p>
//                 )}
//               </div>

//               <div className="p-4 space-y-4 max-h-[450px] overflow-y-auto">
//                 {conversation.map((msg) => (
//                   <div
//                     key={msg.id}
//                     className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
//                   >
//                     <div
//                       className={`max-w-[70%] rounded-lg p-3 ${
//                         msg.sender_id === user.id
//                           ? 'bg-blue-600 text-white'
//                           : 'bg-gray-100 text-gray-900'
//                       }`}
//                     >
//                       <div className="text-sm font-semibold mb-1">
//                         {msg.sender_id === user.id ? 'You' : msg.sender_name}
//                       </div>
//                       <p className="whitespace-pre-wrap">{msg.message}</p>
//                       <div className="text-xs mt-1 opacity-75">
//                         {formatRelativeTime(msg.created_at)}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="p-4 border-t">
//                 <form onSubmit={handleSendReply} className="flex gap-2">
//                   <input
//                     type="text"
//                     value={replyText}
//                     onChange={(e) => setReplyText(e.target.value)}
//                     placeholder="Type your reply..."
//                     className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                   <button
//                     type="submit"
//                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                   >
//                     Send
//                   </button>
//                 </form>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Messages;
