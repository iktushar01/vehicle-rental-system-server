import { pool } from "../../config/db"

const getVehicleById = async (vehicleId: number) => {
    return await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId])
}

const createBooking = async (bookingData: {
    customer_id: number;
    vehicle_id: number;
    rent_start_date: string;
    rent_end_date: string;
    total_price: number;
}) => {
    const { customer_id, vehicle_id, rent_start_date, rent_end_date, total_price } = bookingData;
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Create the booking
        const bookingResult = await client.query(
            `INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
             VALUES ($1, $2, $3, $4, $5, 'active')
             RETURNING *`,
            [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
        );
        
        // Update vehicle status to booked
        await client.query(
            'UPDATE vehicles SET availability_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['booked', vehicle_id]
        );
        
        await client.query('COMMIT');
        
        return bookingResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

const getBookingWithVehicle = async (bookingId: number) => {
    return await pool.query(
        `SELECT 
            b.*,
            v.vehicle_name,
            v.daily_rent_price
         FROM bookings b
         INNER JOIN vehicles v ON b.vehicle_id = v.id
         WHERE b.id = $1`,
        [bookingId]
    )
}

export const bookingsService = {
    getVehicleById,
    createBooking,
    getBookingWithVehicle
}
