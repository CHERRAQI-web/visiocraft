import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  action_type: {
    type: String,
    enum: ['budget_analysis', 'skill_extraction', 'freelancer_matching'],
    required: true
  },
  input_data: { 
    type: mongoose.Schema.Types.Mixed 
  },
  output_data: { 
    type: mongoose.Schema.Types.Mixed 
  },
  confidence_score: { 
    type: Number,
    min: 0,
    max: 1
  }
}, { timestamps: true });

const AiLog = mongoose.model('AiLog', aiLogSchema);
export default AiLog;