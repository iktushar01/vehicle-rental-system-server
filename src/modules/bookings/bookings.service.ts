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

const getAllBookings = async () => {
    return await pool.query(
        `SELECT 
            b.id,
            b.customer_id,
            b.vehicle_id,
            b.rent_start_date,
            b.rent_end_date,
            b.total_price,
            b.status,
            u.name as customer_name,
            u.email as customer_email,
            v.vehicle_name,
            v.registration_number
         FROM bookings b
         INNER JOIN users u ON b.customer_id = u.id
         INNER JOIN vehicles v ON b.vehicle_id = v.id
         ORDER BY b.created_at DESC`
    )
}

const getBookingsByCustomerId = async (customerId: number) => {
    return await pool.query(
        `SELECT 
            b.id,
            b.vehicle_id,
            b.rent_start_date,
            b.rent_end_date,
            b.total_price,
            b.status,
            v.vehicle_name,
            v.registration_number,
            v.type
         FROM bookings b
         INNER JOIN vehicles v ON b.vehicle_id = v.id
         WHERE b.customer_id = $1
         ORDER BY b.created_at DESC`,
        [customerId]
    )
}

const getBookingById = async (bookingId: number) => {
    return await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId])
}

const updateBookingStatus = async (bookingId: number, status: string, vehicleId: number) => {
    // Start a transaction
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Update booking status
        const bookingResult = await client.query(
            `UPDATE bookings 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING *`,
            [status, bookingId]
        );
        
        // If status is cancelled or returned, update vehicle to available
        if (status === 'cancelled' || status === 'returned') {
            await client.query(
                'UPDATE vehicles SET availability_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                ['available', vehicleId]
            );
        }
        
        await client.query('COMMIT');
        
        return bookingResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

const getBookingWithVehicleStatus = async (bookingId: number) => {
    return await pool.query(
        `SELECT 
            b.*,
            v.availability_status
         FROM bookings b
         INNER JOIN vehicles v ON b.vehicle_id = v.id
         WHERE b.id = $1`,
        [bookingId]
    )
}

const autoReturnExpiredBookings = async () => {
    // Auto-return bookings where rent_end_date has passed and status is still 'active'
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Get all active bookings that have passed their end date
        const expiredBookings = await client.query(
            `SELECT id, vehicle_id 
             FROM bookings 
             WHERE status = 'active' 
             AND rent_end_date < CURRENT_DATE`
        );
        
        // Update each expired booking and its vehicle
        for (const booking of expiredBookings.rows) {
            await client.query(
                `UPDATE bookings 
                 SET status = 'returned', updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $1`,
                [booking.id]
            );
            
            await client.query(
                `UPDATE vehicles 
                 SET availability_status = 'available', updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $1`,
                [booking.vehicle_id]
            );
        }
        
        await client.query('COMMIT');
        
        return expiredBookings.rows.length;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export const bookingsService = {
    getVehicleById,
    createBooking,
    getBookingWithVehicle,
    getAllBookings,
    getBookingsByCustomerId,
    getBookingById,
    updateBookingStatus,
    getBookingWithVehicleStatus,
    autoReturnExpiredBookings
}
