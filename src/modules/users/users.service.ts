import { pool } from "../../config/db"

const getUsers = async () => {
    return await pool.query('SELECT * FROM users')
}

export const usersService = {
    getUsers
}