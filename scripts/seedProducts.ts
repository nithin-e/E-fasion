import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { Category } from '../src/models/categoryModel';
import { Product } from '../src/models/productModel';
import { Variant } from '../src/models/variantModel';

const seedData = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    // Clear existing data (optional, but good for clean test)
    // await Category.deleteMany({});
    // await Product.deleteMany({});
    // await Variant.deleteMany({});

    // 1. Create Categories
    const categories = [
      { name: 'Cosmetic', description: 'Beauty and skin care products' },
      { name: 'Dresses', description: 'Trendy women apparel' },
      { name: 'Accessories', description: 'Bags, jewelry and more' },
    ];

    const createdCategories = [];
    for (const cat of categories) {
      const existing = await Category.findOne({ name: cat.name });
      if (existing) {
        createdCategories.push(existing);
      } else {
        const newCat = await Category.create(cat);
        createdCategories.push(newCat);
        console.log(`Created category: ${newCat.name}`);
      }
    }

    // 2. Sample Products
    const products = [
      {
        name: 'Velvet Matte Lipstick',
        brand: 'LuxeBeauty',
        description: 'Long-lasting matte lipstick with a velvet finish and intense pigmentation.',
        highlights: ['Waterproof', 'No-smudge', 'Rich colors'],
        category: createdCategories[0]._id,
        basePrice: 899,
      },
      {
        name: 'Silk Party Dress',
        brand: 'Suruchi',
        description: 'Elegant silk dress perfect for evening parties and special occasions.',
        highlights: ['Pure Silk', 'Comfortable fit', 'Hand-stitched'],
        category: createdCategories[1]._id,
        basePrice: 2499,
      },
      {
        name: 'Designer Clutch Bag',
        brand: 'Suruchi',
        description: 'Premium designer clutch bag with metallic finish and spacious interior.',
        highlights: ['Genuine Leather', 'Gold-plated buckle', 'Detachable chain'],
        category: createdCategories[2]._id,
        basePrice: 1599,
      },
      {
        name: 'Hydrating Face Serum',
        brand: 'DermaCare',
        description: 'Advanced hydrating serum with Hyaluronic Acid and Vitamin C.',
        highlights: ['Dermatologist tested', 'Alcohol free', 'For all skin types'],
        category: createdCategories[0]._id,
        basePrice: 1299,
      },
      {
        name: 'Casual Floral Skirt',
        brand: 'Vogue',
        description: 'Beautiful floral print skirt made from breathable cotton blend.',
        highlights: ['High waist', 'Flowy design', 'Machine washable'],
        category: createdCategories[1]._id,
        basePrice: 1199,
      }
    ];

    for (const pData of products) {
      const product = await Product.create(pData);
      
      // Add a couple of variants for each
      const variants = [
        { 
          productId: product._id, 
          size: 'Standard', 
          shadeName: 'Royal Red', 
          shadeHex: '#FF0000', 
          price: product.basePrice, 
          stock: 50,
          images: ['https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg']
        },
        { 
          productId: product._id, 
          size: 'Standard', 
          shadeName: 'Pink Petal', 
          shadeHex: '#FFC0CB', 
          price: product.basePrice, 
          stock: 30,
          images: ['https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg']
        }
      ];

      const createdVariants = await Variant.insertMany(variants);
      product.variants = createdVariants.map(v => v._id as any);
      await product.save();
      console.log(`Added product: ${product.name} with ${createdVariants.length} variants`);
    }

    console.log('Seeding completed successfully!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
