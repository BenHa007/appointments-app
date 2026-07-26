const WorkHour = require('../models/WorkHour');
const Manager = require('../models/Manager');

// returns the work hours set for the logged-in manager
exports.list = async (req, res) => {
    const manager = await Manager.findOne({ user: req.user.id });
    if (!manager) return res.status(404).json({ error: 'Manager not found' });
    const hours = await WorkHour.find({ manager: manager._id });
    res.json(hours);
};

// saves the opening and closing hours for each day of the week for the logged-in manager
exports.create = async (req, res) => {
    const manager = await Manager.findOne({ user: req.user.id });
    if (!manager) return res.status(404).json({ error: 'Manager not found' });
    const { hours } = req.body;

    try {
        const dayMap = {
            Sunday: 0,
            Monday: 1,
            Tuesday: 2,
            Wednesday: 3,
            Thursday: 4,
            Friday: 5,
            Saturday: 6,
        };

        const workHours = [];

        for (const [day, { open, close }] of Object.entries(hours)) {
            const dayNumber = dayMap[day];

            if (!open || !close) continue;

            const newHour = await WorkHour.create({
                manager: manager._id,
                dayOfWeek: dayNumber,
                from: open,
                to: close,
            });

            workHours.push(newHour);
        }

        res.status(201).json(workHours);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save work hours' });
    }
};

// updates a specific work hour entry belonging to the logged-in manager
exports.update = async (req, res) => {
    const { id } = req.params;
    const manager = await Manager.findOne({ user: req.user.id });
    if (!manager) return res.status(404).json({ error: 'Manager not found' });

    const updated = await WorkHour.findOneAndUpdate(
        { _id: id, manager: manager._id },
        req.body,
        { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'שעות עבודה לא נמצאו' });
    res.json(updated);
};

// deletes a specific work hour entry belonging to the logged-in manager
exports.delete = async (req, res) => {
    const { id } = req.params;
    const manager = await Manager.findOne({ user: req.user.id });
    if (!manager) return res.status(404).json({ error: 'Manager not found' });

    const removed = await WorkHour.findOneAndDelete({ _id: id, manager: manager._id });
    if (!removed) return res.status(404).json({ message: 'שעות עבודה לא נמצאו' });
    res.json({ message: 'נמחק בהצלחה' });
};

// returns work hours and treatments for a specific manager so clients can see available times
exports.getAvailabilityByManager = async (req, res) => {
    const managerId = req.params.id;

    try {
        const hours = await WorkHour.find({ manager: managerId });

        const Manager = require('../models/Manager');
        const manager = await Manager.findById(managerId);
        const treatments = manager?.treatments || [];

        res.json({ times: hours, treatments });
    } catch (err) {
        res.status(500).json({ message: 'שגיאה בשרת', error: err.message });
    }
};