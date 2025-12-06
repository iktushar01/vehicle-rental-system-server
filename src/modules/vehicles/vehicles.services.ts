import { pool } from "../../config/db"

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

export const vehiclesService = {
    createVehicle
}

