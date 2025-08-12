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

export const createClient = async (req, res) => {
  try {
    // Ensure phoneNumbers is an array and has at least one number
    if (!Array.isArray(req.body.phoneNumbers) || req.body.phoneNumbers.length === 0) {
      return res.status(400).json({ message: 'At least one phone number is required' });
    }

    // If phone field exists (for backward compatibility), add it as the first number
    if (req.body.phone && !req.body.phoneNumbers.includes(req.body.phone)) {
      req.body.phoneNumbers.unshift(req.body.phone);
    }

    const client = new Client({
      ...req.body,
      // Ensure we don't save the old phone field
      phone: undefined
    });
    
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
