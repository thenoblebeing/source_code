// EmailJS is loaded via CDN in index.html
// These constants should match your EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_p1nlqac';
const EMAILJS_TEMPLATE_ID = 'template_3gymthq';
const EMAILJS_PUBLIC_KEY = 'kQFneNP16eLdVApdc';

// Initialize EmailJS if not already initialized
if (window.emailjs && !window.emailjsInitialized) {
  try {
    window.emailjs.init(EMAILJS_PUBLIC_KEY);
    window.emailjsInitialized = true;
    console.log('EmailJS initialized in contactService');
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
  }
}

// Helper function to format current date
const getFormattedDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const contactService = {
  // Submit contact form using EmailJS
  submitContactForm: async (formData) => {
    try {
      console.log('Starting form submission with data:', formData);
      
      // Check if EmailJS is available
      if (!window.emailjs) {
        throw new Error('EmailJS is not loaded. Please refresh the page and try again.');
      }
      
      // Make sure EmailJS is initialized
      if (!window.emailjsInitialized) {
        try {
          window.emailjs.init(EMAILJS_PUBLIC_KEY);
          window.emailjsInitialized = true;
          console.log('EmailJS initialized in submitContactForm');
        } catch (initError) {
          console.error('Failed to initialize EmailJS:', initError);
          throw new Error('Failed to initialize email service. Please refresh the page and try again.');
        }
      }
      
      console.log('Sending email with EmailJS');
      
      // Use the helper function to format the date
      const formattedDate = getFormattedDate();
      
      // Log the email sending attempt
      console.log('Sending email to:', 'contact.thenoblebeing@gmail.com');
      
      // Make sure all parameters match the template variables exactly
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject || 'No Subject',
        message: formData.message,
        date: formattedDate,
        to_name: 'The Noble Being Team',
        reply_to: formData.email,
        website_name: 'The Noble Being',
        company_address: '123 Artisan Street, Creative District, San Francisco, CA 94110',
        company_phone: '(555) 123-4567',
        company_email: 'contact.thenoblebeing@gmail.com'
      };
      
      console.log('Sending email with params:', templateParams);
      
      // Send email using EmailJS global object with all required parameters
      const response = await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      console.log('EmailJS response:', response);
      
      if (response && (response.status === 200 || response.status === '200' || response.status === 0)) {
        return { success: true, message: 'Message sent successfully!' };
      } else {
        console.error('EmailJS response error:', response);
        throw new Error(`Failed to send message. Status: ${response ? response.status : 'no status'}`);
      }
    } catch (error) {
      console.error('Error in submitContactForm:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        fullError: error
      });
      
      // More specific error messages based on error type
      let errorMessage = 'Failed to send message. Please try again later.';
      if (error && error.message) {
        if (error.message.includes('Network Error')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('Invalid login')) {
          errorMessage = 'Email service configuration error. Please contact support.';
        }
      }
      
      throw new Error(errorMessage);
    }
  },

  // Subscribe to newsletter
  subscribeToNewsletter: async (email) => {
    try {
      // Simulate API response
      console.log(`Subscribing email: ${email} to newsletter`);
      return { success: true, message: 'Successfully subscribed to newsletter!' };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      throw error;
    }
  },

  // Get FAQ categories
  getFaqCategories: async () => {
    try {
      // Return static categories
      return ['General', 'Products', 'Shipping', 'Returns', 'Artisans'];
    } catch (error) {
      console.error('Error fetching FAQ categories:', error);
      throw error;
    }
  },

  // Get FAQs by category
  getFaqsByCategory: async (category) => {
    try {
      // Return the same fallback FAQs for all categories
      const fallbackFaqs = [
        {
          id: 1,
          question: 'How do I care for my handcrafted items?',
          answer: 'Each product comes with specific care instructions tailored to the materials and techniques used. Generally, we recommend gentle hand washing and air drying for most textile items.'
        },
        {
          id: 2,
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries worldwide. International shipping times vary depending on destination, typically 7-14 business days.'
        },
        {
          id: 3,
          question: 'What is your return policy?',
          answer: 'We accept returns within 30 days of purchase for items in original condition. Custom orders are non-returnable.'
        },
        {
          id: 4,
          question: 'How are your artisans compensated?',
          answer: 'We practice fair trade principles and ensure all artisans receive above-market wages for their skilled work. We also invest in their communities and traditional craft preservation.'
        }
      ];
      return fallbackFaqs;
    } catch (error) {
      console.error(`Error fetching FAQs for category ${category}:`, error);
      throw error;
    }
  },

  // Get all FAQs
  getAllFaqs: async () => {
    try {
      // Return fallback FAQs
      const fallbackFaqs = [
        {
          id: 1,
          question: 'How do I care for my handcrafted items?',
          answer: 'Each product comes with specific care instructions tailored to the materials and techniques used. Generally, we recommend gentle hand washing and air drying for most textile items.'
        },
        {
          id: 2,
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries worldwide. International shipping times vary depending on destination, typically 7-14 business days.'
        },
        {
          id: 3,
          question: 'What is your return policy?',
          answer: 'We accept returns within 30 days of purchase for items in original condition. Custom orders are non-returnable.'
        },
        {
          id: 4,
          question: 'How are your artisans compensated?',
          answer: 'We practice fair trade principles and ensure all artisans receive above-market wages for their skilled work. We also invest in their communities and traditional craft preservation.'
        }
      ];
      return fallbackFaqs;
    } catch (error) {
      console.error('Error fetching all FAQs:', error);
      throw error;
    }
  },
  
  // Get FAQs (alias for getAllFaqs for backward compatibility)
  getFaqs: async () => {
    try {
      // Return fallback FAQs without network request for now
      return [
        {
          id: 1,
          question: 'How do I care for my handcrafted items?',
          answer: 'Each product comes with specific care instructions tailored to the materials and techniques used. Generally, we recommend gentle hand washing and air drying for most textile items.'
        },
        {
          id: 2,
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries worldwide. International shipping times vary depending on destination, typically 7-14 business days.'
        },
        {
          id: 3,
          question: 'What is your return policy?',
          answer: 'We accept returns within 30 days of purchase for items in original condition. Custom orders are non-returnable.'
        },
        {
          id: 4,
          question: 'How are your artisans compensated?',
          answer: 'We practice fair trade principles and ensure all artisans receive above-market wages for their skilled work. We also invest in their communities and traditional craft preservation.'
        }
      ];
    } catch (error) {
      console.error('Error in getFaqs:', error);
      throw error;
    }
  },

  // Get store locations
  getStoreLocations: async () => {
    try {
      // Return static store locations
      return [
        {
          id: 1,
          name: 'The Noble Being Flagship Store',
          address: '123 Artisan Street, Creative District, San Francisco, CA 94110',
          phone: '(555) 123-4567',
          email: 'flagship@thenoblebeing.com',
          hours: 'Mon-Fri: 9am-6pm PT, Sat-Sun: 10am-4pm PT',
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        {
          id: 2,
          name: 'The Noble Being Studio',
          address: '456 Craftsman Avenue, Artist Colony, Los Angeles, CA 90001',
          phone: '(555) 987-6543',
          email: 'studio@thenoblebeing.com',
          hours: 'Mon-Fri: 10am-7pm PT, Sat: 11am-5pm PT, Sun: Closed',
          coordinates: { lat: 34.0522, lng: -118.2437 }
        }
      ];
    } catch (error) {
      console.error('Error fetching store locations:', error);
      throw error;
    }
  }
};

export default contactService;
