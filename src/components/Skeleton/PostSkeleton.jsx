import Skeleton from '../Skeleton/Skeleton';
import './PostSkeleton.css';

export default function PostSkeleton() {
  return (
    <div className="post-skeleton">
      <div className="post-skeleton__header">
        <Skeleton type="avatar" className="post-skeleton__avatar" />
        <div className="post-skeleton__user-info">
          <Skeleton type="text" width="120px" className="post-skeleton__username" />
          <Skeleton type="text" width="80px" className="post-skeleton__timestamp" />
        </div>
      </div>
      <div className="post-skeleton__content">
        <Skeleton type="title" />
        <Skeleton type="paragraph" />
        <Skeleton type="paragraph" />
        <Skeleton type="paragraph" width="70%" />
      </div>
      <div className="post-skeleton__actions">
        <Skeleton type="button" width="60px" />
        <Skeleton type="button" width="60px" />
        <Skeleton type="button" width="60px" />
      </div>
    </div>
  );
}