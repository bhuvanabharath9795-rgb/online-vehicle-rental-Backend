import MaintenanceRecord from "../models/MaintenanceRecord.js";

export const addMaintenanceRecord = async (req, res) => {
  const record = await MaintenanceRecord.create(req.body);
  res.status(201).json(record);
};

export const getMaintenanceByVehicle = async (req, res) => {
  const records = await MaintenanceRecord.find({ vehicle: req.params.vehicleId }).sort({ serviceDate: -1 });
  res.json(records);
};
