const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  author: { type: String, required: true },
  text: { type: String, required: true }
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial;