import Vehicle from "../models/Vehicle.js";
import MaintenanceRecord from "../models/MaintenanceRecord.js";
import Review from "../models/Review.js";

export const createVehicle = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user);

    const {
      title,
      make,
      model,
      year,
      type,
      location,
      pricePerDay,
      availability,
      description,
    } = req.body;

    const image = req.file?.path || req.file?.secure_url || req.file?.url || "";
    console.log("Saved image URL:", image);

    if (!image) {
      return res.status(400).json({ message: "Vehicle image is required" });
    }

    const vehicle = await Vehicle.create({
      title,
      make,
      model,
      year: Number(year),
      type,
      location,
      pricePerDay: Number(pricePerDay),
      availability: availability === "true",
      description,
      image,
      owner: req.user._id,
      status : "approved" // Set default status to "approved"
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      vehicle,
    });
  }catch (error) {
  console.error("CREATE VEHICLE ERROR:", error);
  return res.status(500).json({
    success: false,
    message: error.message,
    name: error.name,
  });
}
};

export const getVehicles = async (req, res) => {
  const { keyword, type, location, minPrice, maxPrice } = req.query;

  const query = {  };

  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { make: { $regex: keyword, $options: "i" } },
      { model: { $regex: keyword, $options: "i" } }
    ];
  }

  if (type) query.type = type;
  if (location) query.location = { $regex: location, $options: "i" };
  if (minPrice || maxPrice) {
    query.pricePerDay = {};
    if (minPrice) query.pricePerDay.$gte = Number(minPrice);
    if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
  }

  const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });
  res.json(vehicles);
};

export const getVehicleById = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate("owner", "name email");
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  const reviews = await Review.find({ vehicle: vehicle._id, status: "approved" })
    .populate("user", "name")
    .sort({ createdAt: -1 });

  const maintenanceRecords = await MaintenanceRecord.find({ vehicle: vehicle._id }).sort({ serviceDate: -1 });

  res.json({ vehicle, reviews, maintenanceRecords });
};

export const updateVehicle = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  if (String(vehicle.owner) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not allowed" });
  }

  Object.assign(vehicle, req.body);
  const updated = await vehicle.save();
  res.json(updated);
};

export const deleteVehicle = async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ message: "Vehicle not found" });
  }

  await vehicle.deleteOne();
  res.json({ message: "Vehicle removed" });
};
