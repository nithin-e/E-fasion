import { Schema, model } from 'mongoose';
import { IReview } from '../types';

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent multiple reviews from same user on same product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { productId, is_deleted: false } },
    {
      $group: {
        _id: '$productId',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const Product = model('Product');
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      numReviews: stats[0].nRating,
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      numReviews: 0,
      avgRating: 0,
    });
  }
};

// Call calculateAverageRating after save
reviewSchema.post('save', function () {
  (this.constructor as any).calculateAverageRating(this.productId);
});

export const Review = model<IReview>('Review', reviewSchema);
