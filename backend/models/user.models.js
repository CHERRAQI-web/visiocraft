import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    password: { 
      type: String, 
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ["Freelancer", "Admin", "Client"],
      required: true
    },
    is_active: { type: Boolean, default: true },
    googleRefreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;