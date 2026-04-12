const Client = require("../models/Client");
const Case = require("../models/Case");

const getClients = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.keyword) {
      query.name = { $regex: req.query.keyword, $options: "i" };
    }

    if (req.user.role === "Lawyer") {
      const caseClientIds = await Case.distinct("clientId", { assignedLawyer: req.user._id });
      query = {
        ...query,
        $or: [{ createdBy: req.user._id }, { _id: { $in: caseClientIds } }],
      };
    }

    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404);
      throw new Error("Client not found");
    }

    if (req.user.role === "Lawyer") {
      const ownsCase = await Case.exists({ clientId: client._id, assignedLawyer: req.user._id });
      if (client.createdBy?.toString() !== req.user._id.toString() && !ownsCase) {
        res.status(403);
        throw new Error("Not authorized to view this client");
      }
    }

    res.json(client);
  } catch (error) {
    next(error);
  }
};

const createClient = async (req, res, next) => {
  try {
    const { name, email, phone, address, notes } = req.body;

    if (!name) {
      res.status(400);
      throw new Error("Client name is required");
    }

    const client = await Client.create({
      name,
      contactInfo: { email, phone },
      address,
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404);
      throw new Error("Client not found");
    }

    if (req.user.role === "Lawyer") {
      const ownsCase = await Case.exists({ clientId: client._id, assignedLawyer: req.user._id });
      if (client.createdBy?.toString() !== req.user._id.toString() && !ownsCase) {
        res.status(403);
        throw new Error("Not authorized to update this client");
      }
    }

    client.name = req.body.name || client.name;
    client.contactInfo = {
      email: req.body.email ?? client.contactInfo?.email,
      phone: req.body.phone ?? client.contactInfo?.phone,
    };
    client.address = req.body.address ?? client.address;
    client.notes = req.body.notes ?? client.notes;

    const updatedClient = await client.save();
    res.json(updatedClient);
  } catch (error) {
    next(error);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      res.status(404);
      throw new Error("Client not found");
    }

    const linkedCases = await Case.countDocuments({ clientId: req.params.id });

    if (linkedCases > 0) {
      res.status(400);
      throw new Error("Cannot delete a client with active case records");
    }

    await client.deleteOne();
    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
