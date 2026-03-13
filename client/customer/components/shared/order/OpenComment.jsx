import React, { useState, useRef } from "react";
import { Star, Camera, X, Send } from "lucide-react";

const OpenComment = ({ onSubmit, disabled }) => {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target && ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit({ text, rating, image });
    setText("");
    setRating(0);
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* RATING SELECTOR */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">
          Your Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform active:scale-90 disabled:opacity-50"
            >
              <Star
                size={28}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-200 dark:text-zinc-700"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* TEXT AREA */}
      <div className="relative">
        <textarea
          className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none disabled:bg-zinc-50"
          placeholder="Tell us what you liked or what we can improve..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          disabled={disabled}
        />
      </div>

      {/* IMAGE UPLOADER & ACTION ROW */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            disabled={disabled}
          />
          
          {!image ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              <Camera size={18} />
              <span className="text-xs font-bold">Add Photo</span>
            </button>
          ) : (
            <div className="relative group">
              <img
                src={image}
                alt="Preview"
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-white dark:ring-zinc-800 shadow-md"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
              >
                <X size={12} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={disabled || (!text && !rating)}
          className="px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-sm flex items-center gap-2 hover:opacity-90 disabled:bg-zinc-100 disabled:text-zinc-400 transition-all active:scale-95 shadow-lg shadow-zinc-200 dark:shadow-none"
        >
          Post Review
          <Send size={14} />
        </button>
      </div>
    </form>
  );
};

export default OpenComment;