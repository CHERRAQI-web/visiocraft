import mongoose from 'mongoose';

const pricingBenchmarkSchema = new mongoose.Schema({
  project_type: { 
    type: String, 
    required: true, 
    trim: true 
  },
  complexity: { 
    type: String, 
    required: true, 
    enum: ['low', 'medium', 'high'] 
  },
  average_price: { 
    type: Number, 
    required: true 
  },
  price_range: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  source: { 
    type: String, 
    trim: true 
  },
  related_skills: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Skill' 
  }]
}, { timestamps: true });

const PricingBenchmark = mongoose.model('PricingBenchmark', pricingBenchmarkSchema);
export default PricingBenchmark;