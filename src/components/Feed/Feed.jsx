import Post from '../Post/Post';
import './Feed.css';
import { usePosts } from '../../hooks/usePosts';

export default function Feed({ activeTheme }) {
  const { posts, loading, error, toggleLike } = usePosts(activeTheme);
  const showCrisis = activeTheme === 'all' || activeTheme === 'solitude';

  if (loading) {
    return (
      <div className="feed">
        <h2 className="feed__heading">Fil de discussions</h2>
        <div className="feed__loading">
          <div className="feed__skeleton" />
          <div className="feed__skeleton" />
          <div className="feed__skeleton" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed">
        <h2 className="feed__heading">Fil de discussions</h2>
        <p className="feed__error">Impossible de charger les posts : {error}</p>
      </div>
    );
  }

  return (
    <div className="feed">
      <h2 className="feed__heading">Fil de discussions</h2>

      {posts.length === 0 && (
        <p className="feed__empty">Aucun post dans cette thématique pour le moment.</p>
      )}

      {posts.map((post, i) => (
        <div key={post.id}>
          <Post post={post} onToggleLike={toggleLike} />
          {showCrisis && i === 1 && (
            <div className="feed__crisis">
              <strong>Si tu traverses une période difficile</strong>
              Tu n'es pas seul·e. Un pair volontaire est disponible maintenant pour t'écouter.
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
