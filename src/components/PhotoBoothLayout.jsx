import React from "react";

const PhotoBoothLayout = ({ photos }) => {
  if (!photos.length) return null;
  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-lg">
      <div className="flex flex-col gap-2">
        {photos.map((photo, idx) => (
          <img
            key={idx}
            src={photo}
            alt={`cut-${idx}`}
            className="w-[200px] rounded-md border border-gray-200"
          />
        ))}
      </div>
      <p className="text-sm mt-2 text-gray-500">인생네컷 미리보기</p>
    </div>
  );
};

export default PhotoBoothLayout;
