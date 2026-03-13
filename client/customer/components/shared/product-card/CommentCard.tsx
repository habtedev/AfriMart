import React, { useState } from "react";
import Image from "next/image";
import { Star, ThumbsUp, CheckCircle2 } from "lucide-react";

export interface CommentCardProps {
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
  isVerified?: boolean;
  helpfulCount?: number;
}

const CommentCard: React.FC<CommentCardProps> = ({ 
  userName, 
  userImage, 
  rating, 
  comment, 
  date, 
  isVerified = true, 
  helpfulCount = 0 
}) => {
  const [likes, setLikes] = useState(helpfulCount);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    }
  };

  return (
    <li className="flex flex-col gap-4 border-b border-zinc-200 dark:border-zinc-700 py-6 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10">
            {/* <Image
              src={userImage} 
              alt={userName} 
              fill 
              className="rounded-full object-cover border border-zinc-200 dark:border-zinc-700" 
            /> */}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{userName}</p>
            {isVerified && (
              <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 size={12} />
                Verified Purchase
              </div>
            )}
          </div>
        </div>
        <span className="text-xs text-zinc-500">{date}</span>
      </div>

      <div>
        <div className="flex mb-2" aria-label={`Rating: ${rating} out of 5 stars`}>
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              className={i < rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-300 dark:text-zinc-600"} 
            />
          ))}
        </div>
        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {comment}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={handleLike}
          disabled={hasLiked}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            hasLiked ? "text-blue-600" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <ThumbsUp size={14} className={hasLiked ? "fill-current" : ""} />
          Helpful ({likes})
        </button>
        <button className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          Report
        </button>
      </div>
    </li>
  );
};

export default CommentCard;