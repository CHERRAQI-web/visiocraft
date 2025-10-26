import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    portfolio_url: { type: String, trim: true },
    skills: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Skill',
      required: true 
    }],
    bio: { type: String, required: true },
    availability_status: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available'
    },
    hourly_rate: { 
      type: Number, 
      min: 0 
    },
    ai_score: { 
      type: Number, 
      min: 0, 
      max: 100, 
      default: 50 
    },
  },
  { timestamps: true }
);

const Freelancer = mongoose.model("Freelancer", freelancerSchema);
export default Freelancer;