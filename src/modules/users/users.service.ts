import { pool } from "../../config/db"

const getUsers = async () => {
    return await pool.query('SELECT * FROM users')
}

const getUserById = async (userId: number) => {
    return await pool.query('SELECT * FROM users WHERE id = $1', [userId])
}

const updateUser = async (userId: number, userData: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
}) => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(userData.name);
    }
    if (userData.email !== undefined) {
        updates.push(`email = $${paramCount++}`);
        values.push(userData.email);
    }
    if (userData.phone !== undefined) {
        updates.push(`phone = $${paramCount++}`);
        values.push(userData.phone);
    }
    if (userData.role !== undefined) {
        updates.push(`role = $${paramCount++}`);
        values.push(userData.role);
    }

    if (updates.length === 0) {
        // No fields to update, just return the current user
        const result = await pool.query('SELECT id, name, email, phone, role FROM users WHERE id = $1', [userId]);
        return result.rows[0];
    }

    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add userId as the last parameter
    values.push(userId);

    const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, name, email, phone, role
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
        throw new Error('User not found or update failed');
    }
    
    return result.rows[0];
}

export const usersService = {
    getUsers,
    getUserById,
    updateUser
}