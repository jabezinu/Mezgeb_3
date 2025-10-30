import Client from '../models/Client.js';

export const getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Helper function to validate phone number format
const isValidPhoneNumber = (phone) => {
  return /^\+?[\d\s-()]{10,}$/.test(phone);
};

export const createClient = async (req, res) => {
  // Start timing the operation
  const startTime = Date.now();
  
  try {
    const { phoneNumbers, phone, ...rest } = req.body;

    // Validate required fields
    const requiredFields = ['businessName', 'managerName', 'firstVisit', 'nextVisit', 'place'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Process phone numbers
    let processedPhoneNumbers = [];
    
    // If phoneNumbers is provided as an array, use it
    if (Array.isArray(phoneNumbers)) {
      processedPhoneNumbers = phoneNumbers.map(num => num.trim()).filter(Boolean);
    }
    
    // If phone field exists (for backward compatibility), add it if not already present
    if (phone && typeof phone === 'string' && phone.trim()) {
      const trimmedPhone = phone.trim();
      if (!processedPhoneNumbers.includes(trimmedPhone)) {
        processedPhoneNumbers.unshift(trimmedPhone);
      }
    }
    
    // Validate we have at least one phone number
    if (processedPhoneNumbers.length === 0) {
      return res.status(400).json({ 
        message: 'At least one phone number is required' 
      });
    }
    
    // Validate phone number formats
    const invalidPhones = processedPhoneNumbers.filter(num => !isValidPhoneNumber(num));
    if (invalidPhones.length > 0) {
      return res.status(400).json({ 
        message: `Invalid phone number format: ${invalidPhones.join(', ')}` 
      });
    }

    // Create client with processed data
    const clientData = {
      ...rest,
      phoneNumbers: processedPhoneNumbers,
      // Ensure we don't save the old phone field
      phone: undefined,
      // Set default values if not provided
      status: rest.status || 'started',
      primaryPhoneIndex: Math.min(
        Math.max(0, Number(rest.primaryPhoneIndex) || 0),
        Math.max(0, processedPhoneNumbers.length - 1)
      )
    };

    // Convert string dates to Date objects if they're not already
    if (clientData.firstVisit && typeof clientData.firstVisit === 'string') {
      clientData.firstVisit = new Date(clientData.firstVisit);
    }
    if (clientData.nextVisit && typeof clientData.nextVisit === 'string') {
      clientData.nextVisit = new Date(clientData.nextVisit);
    }

    const client = new Client(clientData);
    
    // Save the client with error handling
    try {
      const savedClient = await client.save();
      
      // Log performance
      const duration = Date.now() - startTime;
      console.log(`Client created in ${duration}ms`);
      
      // Return the saved client with 201 status
      return res.status(201).json({
        ...savedClient.toObject(),
        // Add any additional fields or transformations here
      });
      
    } catch (saveError) {
      console.error('Error saving client:', saveError);
      
      // Handle duplicate key errors (e.g., duplicate phone number)
      if (saveError.code === 11000) {
        const field = Object.keys(saveError.keyPattern)[0];
        return res.status(409).json({ 
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
        });
      }
      
      // Handle validation errors
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: Object.values(saveError.errors).map(e => e.message)
        });
      }
      
      throw saveError; // Re-throw for the outer catch
    }
    
  } catch (err) {
    console.error('Unexpected error in createClient:', {
      error: err.message,
      stack: err.stack,
      requestBody: req.body
    });
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ 
        message: `${field} already exists`
      });
    }
    
    // Generic error response
    res.status(500).json({ 
      message: 'An unexpected error occurred while creating the client',
      ...(process.env.NODE_ENV === 'development' ? { 
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      } : {})
    });
  }
};

export const updateClient = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // If phone field exists (for backward compatibility), update phoneNumbers accordingly
    if (updateData.phone) {
      const client = await Client.findById(req.params.id);
      if (client) {
        // If the number exists in the array, make it the primary
        const existingIndex = client.phoneNumbers.indexOf(updateData.phone);
        if (existingIndex >= 0) {
          updateData.primaryPhoneIndex = existingIndex;
        } else {
          // Add the new number as primary
          updateData.phoneNumbers = [updateData.phone, ...client.phoneNumbers];
          updateData.primaryPhoneIndex = 0;
        }
      }
      // Remove the old phone field
      delete updateData.phone;
    }
    
    const client = await Client.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClientStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Count clients added today
    const todayCount = await Client.countDocuments({
      firstVisit: { $gte: today }
    });

    // Count clients added this week (last 7 days)
    const weekCount = await Client.countDocuments({
      firstVisit: { $gte: weekAgo }
    });

    // Count clients added this month (last 30 days)
    const monthCount = await Client.countDocuments({
      firstVisit: { $gte: monthAgo }
    });

    // Get daily breakdown for the last 30 days
    const dailyStats = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const count = await Client.countDocuments({
        firstVisit: { $gte: date, $lt: nextDate }
      });
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    res.json({
      today: todayCount,
      week: weekCount,
      month: monthCount,
      daily: dailyStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
