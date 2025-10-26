import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  freelancer_id: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Freelancer",
    default: null, 
  },
  assigned_by_admin_id: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null,
  },
  category_id: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending_assignment', 'assigned', 'in_progress', 'in_review', 'completed', 'cancelled'],
    default: 'pending_assignment'
  },
  analysis_status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  project_details: {
    type: String,
    required: true,
  },
  extracted_skills: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Skill'
  }],
  deadline_date: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    min: 0
  },
  complexity_level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  client_initial_budget: {
    type: Number,
    min: 0,
    required: true
  },
  ai_suggested_budget: {
    type: Number,
    min: 0
  },
  final_budget: {
    type: Number,
    min: 0
  },
  ai_budget_note: {
    type: String,
    trim: true
  },
  budget_status: {
    type: String,
    enum: ['client_submitted', 'ai_reviewed', 'pending_client_approval', 'approved_by_client', 'rejected_by_client'],
    default: 'client_submitted'
  },
  ai_suggested_freelancers: [{
    freelancer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Freelancer'
    },
    score: { type: Number },
    reason: { type: String }
  }],
  assigned_at: {
    type: Date
  }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema); 
export default Project;