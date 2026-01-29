import React from "react";

const ImageUrlManager = ({ images, onImagesChange }) => {
  // Add new image URL
  const handleAddImage = () => {
    onImagesChange([...images, ""]);
  };

  // Update image URL at specific index
  const handleImageUrlChange = (index, value) => {
    const newImages = [...images];
    newImages[index] = value;
    onImagesChange(newImages);
  };

  // Remove image at specific index
  const handleRemoveImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Additional Images
        </label>
        <button
          type="button"
          onClick={handleAddImage}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Add Image
        </button>
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center">
          <span className="material-symbols-outlined text-3xl text-slate-400">
            add_photo_alternate
          </span>
          <p className="text-sm text-slate-500 mt-1">No additional images</p>
          <button
            type="button"
            onClick={handleAddImage}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Click to add image URL
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {images.map((imageUrl, index) => (
            <div key={index} className="flex items-center gap-2">
              {/* Thumbnail Preview */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full items-center justify-center ${imageUrl ? "hidden" : "flex"}`}
                >
                  <span className="material-symbols-outlined text-slate-400 text-lg">
                    image
                  </span>
                </div>
              </div>

              {/* URL Input */}
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="https://example.com/image.jpg"
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Remove image"
              >
                <span className="material-symbols-outlined text-lg">
                  delete
                </span>
              </button>
            </div>
          ))}

          {/* Add More Button at bottom */}
          {images.length > 0 && (
            <button
              type="button"
              onClick={handleAddImage}
              className="w-full py-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add another image
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUrlManager;
