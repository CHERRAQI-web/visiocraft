import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    company_name: { type: String, trim: true },
    industry: { type: String, trim: true },
    googleTokens: {
    type: Object,
    default: null
  },
    googleDriveFolderId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", clientSchema);
export default Client;