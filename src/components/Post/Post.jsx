import { useState } from 'react';
import './Post.css';
import { postsAPI, commentsAPI } from '../../api/api';

export default function Post({ post, onToggleLike }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(parseInt(post.like_count) || 0);
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes(newLiked ? likes + 1 : likes - 1);
    if (onToggleLike) onToggleLike(post.id);
  };

  const handleExpand = async (e) => {
    e.stopPropagation();
    if (!expanded && comments.length === 0) {
      setLoadingComments(true);
      try {
        const data = await postsAPI.getById(post.id);
        setComments(data.comments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    }
    setExpanded(!expanded);
  };

  const handleAddComment = async (e) => {
    e.stopPropagation();
    if (!commentInput.trim()) return;
    try {
      const newComment = await commentsAPI.add(post.id, commentInput.trim());
      setComments(prev => [...prev, newComment]);
      setCommentInput('');
    } catch (err) {
      console.error('Erreur commentaire :', err.message);
    }
  };

  const commentCount = parseInt(post.comment_count) || 0;

  return (
    <article className="post">
      <div className="post__meta">
        <span className="post__anon">{post.pseudo}</span>
        {post.role === 'admin' && <span className="post__admin-badge">Admin</span>}
        <span className="post__badge">{post.theme}</span>
        <span className="post__time">
          {new Date(post.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <p className="post__text">{post.content}</p>

      <div className="post__actions">
        <button
          className={`post__action ${liked ? 'post__action--liked' : ''}`}
          onClick={handleLike}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="M8 13s-6-4.5-6-8a4 4 0 0 1 8 0 4 4 0 0 1 8 0c0 3.5-6 8-6 8z"/>
          </svg>
          {likes}
        </button>
        <button className="post__action" onClick={handleExpand}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 10a2 2 0 0 1-2 2H4l-2 2V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/>
          </svg>
          {commentCount} {commentCount === 1 ? 'réponse' : 'réponses'}
        </button>
      </div>

      {expanded && (
        <div className="post__comments">
          {loadingComments && <p className="post__more">Chargement...</p>}
          {comments.map(c => (
            <div key={c.id} className="post__comment">
              <div className="post__comment-meta">
                <span className="post__anon">{c.pseudo}</span>
                <span className="post__time">
                  {new Date(c.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="post__comment-text">{c.content}</p>
            </div>
          ))}
          {comments.length === 0 && !loadingComments && (
            <p className="post__empty">Sois le premier à répondre.</p>
          )}
          <div className="post__comment-input" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              placeholder="Écrire une réponse..."
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddComment(e)}
              className="post__comment-field"
            />
            <button className="post__comment-submit" onClick={handleAddComment} disabled={!commentInput.trim()}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M14 2L2 7l5 2 2 5 5-12z"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
