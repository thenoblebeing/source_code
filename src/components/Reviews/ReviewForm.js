import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const FormContainer = styled(motion.div)`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 2rem;
  margin-top: 2rem;
`;

const FormTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  color: var(--soft-gold);
  margin-top: 0;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--sandstone-beige);
  }
`;

const StarRating = styled.div`
  display: flex;
  font-size: 2rem;
  margin-bottom: 1rem;
  
  .star {
    cursor: pointer;
    color: ${props => props.hoveredValue >= props.value || props.selectedValue >= props.value 
      ? 'var(--soft-gold)' 
      : 'rgba(255, 255, 255, 0.2)'};
    transition: color 0.2s;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  font-family: 'Inter', sans-serif;
  
  &:focus {
    outline: none;
    border-color: var(--soft-gold);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
  font-family: 'Inter', sans-serif;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--soft-gold);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  
  button {
    padding: 0.8rem 1.5rem;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &.cancel {
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: var(--sandstone-beige);
      
      &:hover {
        border-color: var(--terracotta);
        color: var(--terracotta);
      }
    }
    
    &.submit {
      background-color: var(--soft-gold);
      border: 1px solid var(--soft-gold);
      color: black;
      
      &:hover {
        background-color: #c0941e;
      }
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
`;

const ErrorMessage = styled.div`
  color: var(--terracotta);
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled(motion.div)`
  background-color: rgba(138, 154, 91, 0.2);
  border: 1px solid var(--sage-green);
  color: var(--sage-green);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const RequiredLabel = styled.span`
  color: var(--terracotta);
  margin-left: 0.25rem;
`;

const ReviewForm = ({ productId, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (rating === 0) {
      setError('Please select a star rating');
      return;
    }
    
    if (!comment.trim()) {
      setError('Please enter a review comment');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Submit the review
      await onSubmit({
        productId,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim()
      });
      
      // Show success message
      setSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setRating(0);
        setTitle('');
        setComment('');
        setSuccess(false);
        onCancel(); // Close the form
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <FormContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <FormTitle>Write a Review</FormTitle>
      
      <AnimatePresence>
        {success && (
          <SuccessMessage
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            Your review has been submitted successfully!
          </SuccessMessage>
        )}
      </AnimatePresence>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <label>Overall Rating <RequiredLabel>*</RequiredLabel></label>
          <StarRating 
            selectedValue={rating} 
            hoveredValue={hoverRating}
          >
            {[1, 2, 3, 4, 5].map(value => (
              <div 
                key={value}
                className="star"
                value={value}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </div>
            ))}
          </StarRating>
        </FormGroup>
        
        <FormGroup>
          <label>Review Title</label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience (optional)"
            maxLength={100}
          />
        </FormGroup>
        
        <FormGroup>
          <label>Review <RequiredLabel>*</RequiredLabel></label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            maxLength={1000}
          />
        </FormGroup>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <ButtonGroup>
          <button 
            type="button" 
            className="cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default ReviewForm;
