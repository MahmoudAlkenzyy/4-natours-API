const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'please tell us your name'],
    minLength: [3, 'user name must be at least 3 characters'],
    maxLength: [16, 'user name must be less than 16 characters'],
  },
  email: {
    type: String,
    required: [true, 'please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'provide a valid email '],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    minLength: 8,
    required: [true, 'enter your password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    minLength: 8,
    required: [true, 'enter your confirm password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'paswords are not the same',
    },
  },
  passwordChangeAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  //
  console.log(await bcrypt.hash(this.password, 12));
  this.passwordConfirm = undefined;
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passworfAfter = function (JWTTimeStamp) {
  if (this.passwordChangeAt) {
    const changedTimeStamp = this.passwordChangeAt.getTime() / 1000;
    console.log(changedTimeStamp, JWTTimeStamp);
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};
module.exports = mongoose.model('User', userSchema);
