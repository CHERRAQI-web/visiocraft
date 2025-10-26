import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true, 
    unique: true 
  }, 
  category: { 
    type: String, 
    required: true, 
    trim: true 
  } 
}, { timestamps: true });

const Skill = mongoose.model('Skill', skillSchema);
export default Skill;