import mongoose from "mongoose";

const projectFileSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    uploaded_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    file_name: { type: String, required: true, trim: true },
    google_drive_url: { 
      type: String, 
      required: true, 
      trim: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/drive\.google\.com\/.*/.test(v);
        },
        message: 'Veuillez entrer une URL Google Drive valide'
      }
    }, file_type: {
      type: String,
      enum: ['file', 'folder'],
      default: 'file'
    },
    is_marked: {
      type: Boolean,
      default: false
    },
    mark_description: {
      type: String,
      trim: true
    },
  },
  { timestamps: true }
);

const ProjectFile = mongoose.model("ProjectFile", projectFileSchema);
export default ProjectFile;