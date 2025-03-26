import React, { useState, useEffect } from 'react';
import { Mail, Send } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';

interface ContactFormProps {
  description?: string;
  padding?: string;
}

export function ContactForm({ 
  description = "Have questions about our classes or want to learn more? We'd love to hear from you!",
  padding = "py-20"
}: ContactFormProps) {
  useEffect(() => {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    if (!publicKey) {
      console.error('EmailJS Public Key is missing!');
      return;
    }
    
    try {
      emailjs.init(publicKey);
      console.log('EmailJS Initialized with public key');
    } catch (error) {
      console.error('EmailJS Init Error:', error);
    }
  }, []);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    message: false,
    phone: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const sanitizedValue = value.replace(/[^\d() -]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = {
      name: !formData.name.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      message: !formData.message.trim(),
      phone: !isValidPhone(formData.phone)
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError(false);

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error('Missing EmailJS configuration:', {
        serviceId: !!serviceId,
        templateId: !!templateId,
        publicKey: !!publicKey
      });
      setSubmitError(true);
      setIsSubmitting(false);
      return;
    }

    const templateParams = {
      to_email: 'duckinggravity@gmail.com',
      from_name: formData.name,
      reply_to: formData.email,
      message: formData.message,
      phone: formData.phone
    };
    
    try {
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );
      console.log('EmailJS Response:', response);
      setFormData({ name: '', email: '', message: '', phone: '' });
      setSubmitSuccess(true);
    } catch (error) {
      console.error('EmailJS Error Details:', error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`container mx-auto px-4 ${padding}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold text-white mb-6 uppercase tracking-wider">
          Get in Touch
        </h2>
        <p className="text-xl text-gray-200 max-w-2xl mx-auto font-light">
          {description}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-lg p-8 md:p-12 card-hover
                 border border-white/5 shadow-[0_8px_30px_rgba(59,130,246,0.1)]"
      >
        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#22C55E]/20 mb-6">
              <Send className="h-8 w-8 text-[#22C55E]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Message Sent Successfully!</h3>
            <p className="text-gray-200 mb-6">Thank you for reaching out. We'll get back to you as soon as possible.</p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="bg-[#22C55E] text-white px-6 py-3 rounded-lg font-semibold 
                       hover:bg-[#22C55E]/80 transition-all duration-300"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Name <span className="text-[#22C55E]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg 
                           bg-white/5 text-white backdrop-blur-sm
                           border focus:ring-2 focus:ring-[#22C55E] outline-none
                           ${errors.name 
                             ? 'border-red-500' 
                             : 'border-white/10'}`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">
                    Please enter your name
                  </p>
                )}
              </div>
              
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Email <span className="text-[#22C55E]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg 
                           bg-white/5 text-white backdrop-blur-sm
                           border focus:ring-2 focus:ring-[#22C55E] outline-none
                           ${errors.email 
                             ? 'border-red-500' 
                             : 'border-white/10'}`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    Please enter a valid email address
                  </p>
                )}
              </div>
            </div>

            <div>
              <label 
                htmlFor="phone" 
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Phone <span className="text-[#22C55E]">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(123) 456-7890"
                className={`w-full px-4 py-3 rounded-lg 
                         bg-white/5 text-white backdrop-blur-sm
                         border focus:ring-2 focus:ring-[#22C55E] outline-none
                         ${errors.phone 
                           ? 'border-red-500' 
                           : 'border-white/10'}`}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-400">
                  Please enter a valid phone number
                </p>
              )}
            </div>

            <div>
              <label 
                htmlFor="message" 
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Message <span className="text-[#22C55E]">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Do you have any questions about our classes or services? Feel free to reach out!"
                className={`w-full px-4 py-3 rounded-lg 
                         bg-white/5 text-white backdrop-blur-sm
                         border focus:ring-2 focus:ring-[#22C55E] outline-none
                         ${errors.message 
                           ? 'border-red-500' 
                           : 'border-white/10'}`}
              ></textarea>
              {errors.message && (
                <p className="mt-1 text-sm text-red-400">
                  Please enter your message
                </p>
              )}
            </div>

            {submitError && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-200 text-sm">
                  There was an error sending your message. Please try again or contact us directly.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#22C55E] text-white py-3 px-6 rounded-lg font-semibold text-lg
                       hover:bg-[#22C55E]/80 transition-all duration-300 hover:scale-[1.02]
                       disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </section>
  );
} 