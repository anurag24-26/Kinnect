const Avatar = ({ src, size = 40 }) => {
  return (
    <img
      src={src}
      alt="avatar"
      className={`rounded-full object-cover`}
      style={{ height: size, width: size }}
    />
  );
};

export default Avatar;
