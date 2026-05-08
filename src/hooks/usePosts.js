import { useState, useEffect, useCallback } from 'react';
import { postsAPI } from '../api/api';
import { useToast } from '../components/Toast/Toast';
import { useSocket } from '../context/SocketContext';

export function usePosts(theme) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { error: showError } = useToast();
  const { socket, connected } = useSocket();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsAPI.getAll(theme);
      setPosts(data);
    } catch (err) {
      setError(err.message);
      showError('Impossible de charger les posts');
    } finally {
      setLoading(false);
    }
  }, [theme, showError]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Écouter les nouveaux commentaires pour rafraîchir le feed
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewComment = (commentData) => {
      // Rafraîchir le feed quand un nouveau commentaire est ajouté
      fetchPosts();
    };

    socket.on('new_comment', handleNewComment);

    return () => {
      socket.off('new_comment', handleNewComment);
    };
  }, [socket, connected, fetchPosts]);

  const addPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const toggleLike = async (postId) => {
    // Optimistic update
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const wasLiked = post.is_liked_by_user;
    const newLikeCount = wasLiked
      ? Math.max(0, parseInt(post.like_count) - 1)
      : parseInt(post.like_count) + 1;

    // Update UI immediately
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? {
            ...p,
            is_liked_by_user: !wasLiked,
            like_count: String(newLikeCount)
          }
        : p
    ));

    try {
      const { liked } = await postsAPI.toggleLike(postId);
      // Server response matches our optimistic update
      if (liked !== !wasLiked) {
        // Rollback if server response doesn't match
        setPosts(prev => prev.map(p =>
          p.id === postId
            ? {
                ...p,
                is_liked_by_user: liked,
                like_count: String(liked ? parseInt(p.like_count) + 1 : Math.max(0, parseInt(p.like_count) - 1))
              }
            : p
        ));
      }
    } catch (err) {
      // Rollback on error
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? {
              ...p,
              is_liked_by_user: wasLiked,
              like_count: String(wasLiked ? parseInt(p.like_count) + 1 : Math.max(0, parseInt(p.like_count) - 1))
            }
          : p
      ));
      showError('Impossible de liker ce post');
    }
  };

  return { posts, loading, error, addPost, toggleLike, refetch: fetchPosts };
}
