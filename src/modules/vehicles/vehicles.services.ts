import { pool } from "../../config/db"

const getVehicles = async () => {
    return await pool.query('SELECT * FROM vehicles ORDER BY created_at DESC')
}

const getVehicleById = async (vehicleId: number) => {
    return await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId])
}

const updateVehicle = async (vehicleId: number, vehicleData: {
    vehicle_name?: string;
    type?: string;
    registration_number?: string;
    daily_rent_price?: number;
    availability_status?: string;
}) => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (vehicleData.vehicle_name !== undefined) {
        updates.push(`vehicle_name = $${paramCount++}`);
        values.push(vehicleData.vehicle_name);
    }
    if (vehicleData.type !== undefined) {
        updates.push(`type = $${paramCount++}`);
        values.push(vehicleData.type);
    }
    if (vehicleData.registration_number !== undefined) {
        updates.push(`registration_number = $${paramCount++}`);
        values.push(vehicleData.registration_number);
    }
    if (vehicleData.daily_rent_price !== undefined) {
        updates.push(`daily_rent_price = $${paramCount++}`);
        values.push(vehicleData.daily_rent_price);
    }
    if (vehicleData.availability_status !== undefined) {
        updates.push(`availability_status = $${paramCount++}`);
        values.push(vehicleData.availability_status);
    }

    if (updates.length === 0) {
        // No fields to update, just return the current vehicle
        const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
        return result.rows[0];
    }

    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add vehicleId as the last parameter
    values.push(vehicleId);

    const query = `
        UPDATE vehicles 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
}

const createVehicle = async (vehicleData: {
    vehicle_name: string;
    type: string;
    registration_number: string;
    daily_rent_price: number;
    availability_status: string;
}) => {
    const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = vehicleData;
    const result = await pool.query(
        `INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [vehicle_name, type, registration_number, daily_rent_price, availability_status]
    );
    return result.rows[0];
}

const hasActiveBookings = async (vehicleId: number) => {
    const result = await pool.query(
        'SELECT COUNT(*) as count FROM bookings WHERE vehicle_id = $1 AND status = $2',
        [vehicleId, 'active']
    );
    return parseInt(result.rows[0].count) > 0;
}

const deleteVehicle = async (vehicleId: number) => {
    const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [vehicleId]);
    return result.rows[0];
}

export const vehiclesService = {
    getVehicles,
    getVehicleById,
    updateVehicle,
    createVehicle,
    hasActiveBookings,
    deleteVehicle
}

