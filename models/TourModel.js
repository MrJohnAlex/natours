const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./UserModel.js');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour name must be provided'],
      unique: true,
      trim: true,
      minLength: [8, 'Tour name must be at least 8 characters'],
      maxLength: [20, 'Tour name must be at most 10 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'Tour duration must be provided'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour maximum group size must be provided'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour difficulty must be provided'],
      enum: ['easy', 'medium', 'difficult'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
      // set: (val) => Math.random(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      required: [true, 'Tour summary must be provided'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: String,
    images: [String],
    startDates: [Date],
    price: {
      type: Number,
      required: [true, 'Tour price must be provided'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    priceDiscount: {
      type: Number,
      validate: function (val) {
        return val < this.price; // 100 < 200
      },
      message: 'Discount price ({VALUE}) should be less than regular price',
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'point',
        emum: ['point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'point',
          emum: ['point'],
        },
        description: String,
        coordinates: [Number],
        address: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// DOCUMENT MIDDLEWARE : runs before .save() and .create()

tourSchema.pre('save', (next) => {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE : runs before executing queries
// tourSchema.pre('find', (next) => {
//   this.find({ secretTour: false });
//   next();
// });
tourSchema.index({
  price: 1,
  ratingsAverage: -1,
});
tourSchema.index({
  slug: 1,
});
tourSchema.index({
  startLocation: '2dsphere',
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
// Virtual Populating reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// Embedded guides data
// tourSchema.pre('save', async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
