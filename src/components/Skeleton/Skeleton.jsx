import './Skeleton.css';

export default function Skeleton({ type = 'text', width, height, className = '' }) {
  const style = {
    width: width || (type === 'text' ? '100%' : 'auto'),
    height: height || (type === 'text' ? '16px' : type === 'avatar' ? '40px' : 'auto'),
  };

  return (
    <div
      className={`skeleton skeleton--${type} ${className}`}
      style={style}
    />
  );
}