const Appointment = require('../models/Appointment');
const Manager = require('../models/Manager');

// returns all appointments for a manager if logged in as manager, or only client's own appointments
exports.list = async (req, res) => {
    let filter;
    if (req.user.isManager) {
        const mgr = await Manager.findOne({ user: req.user.id }, '_id');
        if (!mgr) return res.json([]);
        filter = { manager: mgr._id };
    } else {
        filter = { client: req.user.id };
    } const list = await Appointment.find(filter)
        .populate('client', 'name phone')
        .populate({ path: 'manager', populate: { path: 'user', select: 'name imageUrl' } });
    res.json(list);
};

// creates a new appointment for the logged-in client with the selected manager, date, and service
exports.create = async (req, res) => {
    try {
        console.log('🔥 create appointment, body =', req.body);
        console.log('req.user =', req.user);

        const { manager, dateTime, serviceType } = req.body;

        const appointmentData = {
            client: req.user.id,
            manager,
            dateTime,
            serviceType
        };

        console.log('📥 Appointment data to save:', appointmentData);

        const appointment = await Appointment.create(appointmentData);

        res.status(201).json(appointment);
    } catch (error) {
        console.error('❌ Error creating appointment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// client can update only their own appointment, and manager can update any appointment booked for them
exports.update = async (req, res) => {
    const { id } = req.params;
    let managerFilter = null;
    if (req.user.isManager) {
        const mgr = await Manager.findOne({ user: req.user.id }, '_id');
        if (mgr) managerFilter = mgr._id;
    }

    const updated = await Appointment.findOneAndUpdate(
        { _id: id, $or: [{ client: req.user.id }, { manager: managerFilter }] },

        req.body,
        { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'תור לא נמצא' });
    res.json(updated);
};


// client can delete only their own appointment, and manager can delete any appointment booked for them
exports.delete = async (req, res) => {
    const { id } = req.params;
    let managerFilter = null;
    if (req.user.isManager) {
        const mgr = await Manager.findOne({ user: req.user.id }, '_id');
        if (mgr) managerFilter = mgr._id;
    }
    const removed = await Appointment.findOneAndDelete(
        { _id: id, $or: [{ client: req.user.id }, { manager: managerFilter }] }
    );
    if (!removed) return res.status(404).json({ message: 'תור לא נמצא' });
    res.json({ message: 'התור בוטל' });
};


// returns all appointments already taken for a specific manager on a specific date
exports.getByManagerAndDate = async (req, res) => {
    try {
        const { managerId } = req.params;
        const { date } = req.query;

        const from = new Date(date);
        const to = new Date(date);
        to.setDate(to.getDate() + 1);

        const appointments = await Appointment.find({
            manager: managerId,
            dateTime: { $gte: from, $lt: to }
        });

        res.json(appointments);
    } catch (error) {
        console.error('❌ Failed to fetch appointments by manager and date:', error);
        res.status(500).json({ message: 'שגיאה בשרת', error: error.message });
    }
};

// returns all appointments booked by the logged-in client with manager details
exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ client: req.user.id })
            .populate({
                path: 'manager',
                populate: {
                    path: 'user',
                    select: 'name imageUrl'
                }
            });
        res.json(appointments);
    } catch (err) {
        console.error('❌ Failed to fetch user appointments:', err);
        res.status(500).json({ message: 'שגיאת שרת בשליפת תורים', error: err.message });
    }
};
