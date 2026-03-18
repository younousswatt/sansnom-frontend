import { useState, useEffect, useCallback } from 'react';
import { postsAPI } from '../api/api';

export function usePosts(theme) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsAPI.getAll(theme);
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [theme]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const addPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const toggleLike = async (postId) => {
    try {
      const { liked } = await postsAPI.toggleLike(postId);
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, like_count: String(liked ? parseInt(p.like_count) + 1 : parseInt(p.like_count) - 1) }
          : p
      ));
    } catch (err) {
      console.error('Erreur like :', err.message);
    }
  };

  return { posts, loading, error, addPost, toggleLike, refetch: fetchPosts };
}
