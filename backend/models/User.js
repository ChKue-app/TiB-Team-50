import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  team_id: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['player', 'admin', 'super_admin'],
    default: 'player'
  },
  email: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: function() {
      return this.role === 'admin' || this.role === 'super_admin';
    }
  },
  last_login: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  position: {
    type: Number,
    min: 1,
    sparse: true
  }
});

export default mongoose.model('User', userSchema); 