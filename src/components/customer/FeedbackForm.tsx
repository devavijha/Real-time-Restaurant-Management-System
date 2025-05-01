import { useState } from 'react';
import { useOrder } from '../../contexts/OrderContext';
import { Star } from 'lucide-react';

interface FeedbackFormProps {
  orderId: string;
}

const FeedbackForm = ({ orderId }: FeedbackFormProps) => {
  const { provideFeedback } = useOrder();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) return;
    
    provideFeedback(orderId, {
      rating,
      comment: comment.trim() || undefined
    });
    
    setSubmitted(true);
  };
  
  if (submitted) {
    return (
      <div className="text-center py-2">
        <p className="text-green-600 font-medium">Thank you for your feedback!</p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <h4 className="font-medium text-gray-800 mb-2">How was your experience?</h4>
      
      <div className="flex justify-center mb-4">
        {[1, 2, 3, 4, 5].map(value => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1"
          >
            <Star
              size={24}
              className={`${
                value <= (hoveredRating || rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
      
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comments (optional)"
        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows={2}
      />
      
      <button
        type="submit"
        disabled={rating === 0}
        className="mt-2 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 rounded-lg"
      >
        Submit Feedback
      </button>
    </form>
  );
};

export default FeedbackForm;